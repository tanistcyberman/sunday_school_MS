import { Student } from '../../../domain/entities/Student';

export interface StudentRepositoryPort {
  findById(id: string): Promise<Student | null>;
  findByCode(code: string): Promise<Student | null>;
  findByGrade(gradeLevel: number): Promise<Student[]>;
  findAll(): Promise<Student[]>;
  save(student: Student): Promise<Student>;
  saveMany(students: Student[]): Promise<Student[]>;
  updateGradeAndStatus(id: string, gradeLevel: number, status: string): Promise<void>;
}
