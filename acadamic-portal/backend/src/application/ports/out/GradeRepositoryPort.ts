import { GradeRecord } from '../../../domain/entities/GradeRecord';

export interface GradeRepositoryPort {
  findById(id: string): Promise<GradeRecord | null>;
  findByStudentId(studentId: string): Promise<GradeRecord[]>;
  findByCourseAndGrade(courseId: string, gradeLevel: number): Promise<GradeRecord[]>;
  findAll(): Promise<GradeRecord[]>;
  save(grade: GradeRecord): Promise<GradeRecord>;
  saveBatch(grades: GradeRecord[]): Promise<void>;
  getStudentCourseGrades(academicYear: string): Promise<GradeRecord[]>;
}
