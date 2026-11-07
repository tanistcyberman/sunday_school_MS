import { StudentRepositoryPort } from '../../../application/ports/out/StudentRepositoryPort';
import { Student } from '../../../domain/entities/Student';
import { DatabaseService } from './DatabaseService';
export declare class PostgresStudentRepo implements StudentRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<Student | null>;
    findByCode(code: string): Promise<Student | null>;
    findByGrade(gradeLevel: number): Promise<Student[]>;
    findAll(): Promise<Student[]>;
    save(student: Student): Promise<Student>;
    saveMany(students: Student[]): Promise<Student[]>;
    updateGradeAndStatus(id: string, gradeLevel: number, status: string): Promise<void>;
    private mapRow;
}
