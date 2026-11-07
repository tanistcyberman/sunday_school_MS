import { GradeRepositoryPort } from '../../../application/ports/out/GradeRepositoryPort';
import { GradeRecord } from '../../../domain/entities/GradeRecord';
import { DatabaseService } from './DatabaseService';
export declare class PostgresGradeRepo implements GradeRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<GradeRecord | null>;
    findByStudentId(studentId: string): Promise<GradeRecord[]>;
    findByCourseAndGrade(courseId: string, gradeLevel: number): Promise<GradeRecord[]>;
    findAll(): Promise<GradeRecord[]>;
    save(grade: GradeRecord): Promise<GradeRecord>;
    saveBatch(grades: GradeRecord[]): Promise<void>;
    getStudentCourseGrades(academicYear: string): Promise<GradeRecord[]>;
    private mapRow;
}
