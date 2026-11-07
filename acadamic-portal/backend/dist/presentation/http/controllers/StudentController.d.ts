import { Response } from 'express';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';
import { PostgresGradeRepo } from '../../../infrastructure/database/postgres/PostgresGradeRepo';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresScheduleRepo } from '../../../infrastructure/database/postgres/PostgresScheduleRepo';
import { MaterialUseCase } from '../../../application/use-cases/MaterialUseCase';
import { LocalFileStorageAdapter } from '../../../infrastructure/storage/LocalFileStorageAdapter';
export declare class StudentController {
    private readonly studentRepo;
    private readonly gradeRepo;
    private readonly courseRepo;
    private readonly scheduleRepo;
    private readonly materialUseCase;
    private readonly fileStorage;
    constructor(studentRepo: PostgresStudentRepo, gradeRepo: PostgresGradeRepo, courseRepo: PostgresCourseRepo, scheduleRepo: PostgresScheduleRepo, materialUseCase: MaterialUseCase, fileStorage: LocalFileStorageAdapter);
    private resolveStudentId;
    getDashboard(req: any): Promise<{
        student: import("../../../domain/entities/Student").Student;
        courseCount: number;
        materialsCount: number;
        averageScore: number;
        timeline: {
            startDate: Date;
            midExamDate: Date;
            finalExamDate: Date;
            progressPercentage: number;
            currentPhase: string;
        };
    }>;
    getTimeline(req: any): Promise<import("../../../domain/entities/Schedule").Schedule[]>;
    getMaterials(req: any): Promise<{
        gradeLevel: number;
        courses: {
            course: import("../../../domain/entities/Course").Course;
            materials: import("../../../domain/entities/Material").Material[];
        }[];
    }>;
    getReportCard(req: any, year?: string): Promise<{
        student: import("../../../domain/entities/Student").Student;
        academicYear: string;
        entries: {
            courseId: string;
            courseCode: string;
            courseName: string;
            courseNameAmharic: string;
            midMark: number;
            finalMark: number;
            totalScore: number;
            passStatus: string;
        }[];
        averageScore: number;
        overallStatus: string;
    }>;
    downloadMaterial(id: string, res: Response): Promise<void>;
}
