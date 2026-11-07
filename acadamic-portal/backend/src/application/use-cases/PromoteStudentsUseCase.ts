import { StudentRepositoryPort } from '../ports/out/StudentRepositoryPort';
import { GradeRepositoryPort } from '../ports/out/GradeRepositoryPort';
import { Student } from '../../domain/entities/Student';

export interface PromotionCandidateSummary {
  studentId: string;
  studentCode: string;
  fullName: string;
  fullNameAmharic: string;
  previousGrade: number;
  newGrade: number;
  averageScore: number;
  passed: boolean;
  actionTaken: 'PROMOTED' | 'RETAINED' | 'GRADUATED';
}

export interface BulkPromotionResult {
  totalEvaluated: number;
  promotedCount: number;
  retainedCount: number;
  graduatedCount: number;
  candidates: PromotionCandidateSummary[];
}

export class PromoteStudentsUseCase {
  constructor(
    private readonly studentRepo: StudentRepositoryPort,
    private readonly gradeRepo: GradeRepositoryPort
  ) {}

  public async evaluatePromotionCandidates(gradeLevel?: number): Promise<PromotionCandidateSummary[]> {
    const students = gradeLevel 
      ? await this.studentRepo.findByGrade(gradeLevel)
      : await this.studentRepo.findAll();

    const results: PromotionCandidateSummary[] = [];

    for (const student of students) {
      if (student.status === 'GRADUATED') continue;

      const grades = await this.gradeRepo.findByStudentId(student.id);
      
      let averageScore = 0;
      let passed = false;

      if (grades.length > 0) {
        const totalSum = grades.reduce((acc, curr) => acc + (curr.totalScore ? curr.totalScore.getValue() : 0), 0);
        averageScore = Math.round((totalSum / grades.length) * 100) / 100;
        // Student passes if average is 50% or above and at least one grade is recorded
        passed = averageScore >= 50.0;
      }

      let action: 'PROMOTED' | 'RETAINED' | 'GRADUATED' = 'RETAINED';
      let targetGrade = student.gradeLevel;

      if (passed) {
        if (student.gradeLevel >= 10) {
          action = 'GRADUATED';
          targetGrade = 10;
        } else {
          action = 'PROMOTED';
          targetGrade = student.gradeLevel + 1;
        }
      }

      results.push({
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        fullNameAmharic: student.fullNameAmharic,
        previousGrade: student.gradeLevel,
        newGrade: targetGrade,
        averageScore,
        passed,
        actionTaken: action
      });
    }

    return results;
  }

  public async executeBulkPromotion(gradeLevel?: number): Promise<BulkPromotionResult> {
    const candidates = await this.evaluatePromotionCandidates(gradeLevel);
    let promotedCount = 0;
    let retainedCount = 0;
    let graduatedCount = 0;

    for (const cand of candidates) {
      const student = await this.studentRepo.findById(cand.studentId);
      if (!student) continue;

      if (cand.passed) {
        const updated = student.promote();
        await this.studentRepo.updateGradeAndStatus(updated.id, updated.gradeLevel, updated.status);
        if (updated.status === 'GRADUATED') {
          graduatedCount++;
        } else {
          promotedCount++;
        }
      } else {
        const updated = student.retain();
        await this.studentRepo.updateGradeAndStatus(updated.id, updated.gradeLevel, updated.status);
        retainedCount++;
      }
    }

    return {
      totalEvaluated: candidates.length,
      promotedCount,
      retainedCount,
      graduatedCount,
      candidates
    };
  }
}
