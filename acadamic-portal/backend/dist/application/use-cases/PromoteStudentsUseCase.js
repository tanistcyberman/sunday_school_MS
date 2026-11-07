"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoteStudentsUseCase = void 0;
class PromoteStudentsUseCase {
    constructor(studentRepo, gradeRepo) {
        this.studentRepo = studentRepo;
        this.gradeRepo = gradeRepo;
    }
    async evaluatePromotionCandidates(gradeLevel) {
        const students = gradeLevel
            ? await this.studentRepo.findByGrade(gradeLevel)
            : await this.studentRepo.findAll();
        const results = [];
        for (const student of students) {
            if (student.status === 'GRADUATED')
                continue;
            const grades = await this.gradeRepo.findByStudentId(student.id);
            let averageScore = 0;
            let passed = false;
            if (grades.length > 0) {
                const totalSum = grades.reduce((acc, curr) => acc + (curr.totalScore ? curr.totalScore.getValue() : 0), 0);
                averageScore = Math.round((totalSum / grades.length) * 100) / 100;
                passed = averageScore >= 50.0;
            }
            let action = 'RETAINED';
            let targetGrade = student.gradeLevel;
            if (passed) {
                if (student.gradeLevel >= 10) {
                    action = 'GRADUATED';
                    targetGrade = 10;
                }
                else {
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
    async executeBulkPromotion(gradeLevel) {
        const candidates = await this.evaluatePromotionCandidates(gradeLevel);
        let promotedCount = 0;
        let retainedCount = 0;
        let graduatedCount = 0;
        for (const cand of candidates) {
            const student = await this.studentRepo.findById(cand.studentId);
            if (!student)
                continue;
            if (cand.passed) {
                const updated = student.promote();
                await this.studentRepo.updateGradeAndStatus(updated.id, updated.gradeLevel, updated.status);
                if (updated.status === 'GRADUATED') {
                    graduatedCount++;
                }
                else {
                    promotedCount++;
                }
            }
            else {
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
exports.PromoteStudentsUseCase = PromoteStudentsUseCase;
//# sourceMappingURL=PromoteStudentsUseCase.js.map