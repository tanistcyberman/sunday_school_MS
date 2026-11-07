import { GradeRepositoryPort } from '../ports/out/GradeRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
import { GradeRecord } from '../../domain/entities/GradeRecord';
import { MidMark } from '../../domain/value-objects/MidMark';
import { FinalMark } from '../../domain/value-objects/FinalMark';
import { TotalScore } from '../../domain/value-objects/TotalScore';
import { PassStatus } from '../../domain/value-objects/PassStatus';
import { UnauthorizedCourseAccessException } from '../../domain/exceptions/UnauthorizedCourseAccessException';

export interface UpdateGradeDto {
  studentId: string;
  courseId: string;
  academicYear: string;
  midMark: number | null;
  finalMark: number | null;
  requesterTeacherId?: string;
  requesterRole?: string;
}

export class CalculateFinalGradeUseCase {
  constructor(
    private readonly gradeRepo: GradeRepositoryPort,
    private readonly courseRepo: CourseRepositoryPort
  ) {}

  public async saveOrUpdateGrade(dto: UpdateGradeDto): Promise<GradeRecord> {
    // Enforce Course Ownership Authorization
    if (dto.requesterRole !== 'ADMIN' && dto.requesterTeacherId) {
      const course = await this.courseRepo.findById(dto.courseId);
      if (!course || !course.isOwnedBy(dto.requesterTeacherId)) {
        throw new UnauthorizedCourseAccessException();
      }
    }

    const studentGrades = await this.gradeRepo.findByStudentId(dto.studentId);
    let record = studentGrades.find(
      g => g.courseId === dto.courseId && g.academicYear === dto.academicYear
    );

    const midObj = dto.midMark !== null && dto.midMark !== undefined ? new MidMark(dto.midMark) : null;
    const finalObj = dto.finalMark !== null && dto.finalMark !== undefined ? new FinalMark(dto.finalMark) : null;
    
    let totalObj: TotalScore | null = null;
    let passStatusObj = PassStatus.determine(null);

    if (midObj !== null && finalObj !== null) {
      totalObj = TotalScore.calculate(midObj, finalObj);
      passStatusObj = PassStatus.determine(totalObj);
    }

    if (!record) {
      const newId = `grd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      record = new GradeRecord(
        newId,
        dto.studentId,
        dto.courseId,
        dto.academicYear,
        midObj,
        finalObj,
        totalObj,
        passStatusObj
      );
    } else {
      record.updateMarks(dto.midMark, dto.finalMark);
    }

    return await this.gradeRepo.save(record);
  }

  public async batchSaveGrades(gradesDto: UpdateGradeDto[]): Promise<void> {
    for (const dto of gradesDto) {
      await this.saveOrUpdateGrade(dto);
    }
  }
}
