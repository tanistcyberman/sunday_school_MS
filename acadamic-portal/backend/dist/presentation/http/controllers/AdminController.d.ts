import { Response } from 'express';
import { MasterScheduleUseCase, SaveScheduleDto } from '../../../application/use-cases/MasterScheduleUseCase';
import { ImportStudentsUseCase, CSVStudentRow } from '../../../application/use-cases/ImportStudentsUseCase';
import { ExportGradesUseCase } from '../../../application/use-cases/ExportGradesUseCase';
import { PromoteStudentsUseCase } from '../../../application/use-cases/PromoteStudentsUseCase';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';
import { PostgresUserRepo } from '../../../infrastructure/database/postgres/PostgresUserRepo';
export declare class AdminController {
    private readonly masterScheduleUseCase;
    private readonly importStudentsUseCase;
    private readonly exportGradesUseCase;
    private readonly promoteStudentsUseCase;
    private readonly courseRepo;
    private readonly studentRepo;
    private readonly userRepo;
    constructor(masterScheduleUseCase: MasterScheduleUseCase, importStudentsUseCase: ImportStudentsUseCase, exportGradesUseCase: ExportGradesUseCase, promoteStudentsUseCase: PromoteStudentsUseCase, courseRepo: PostgresCourseRepo, studentRepo: PostgresStudentRepo, userRepo: PostgresUserRepo);
    getSchedule(grade?: string): Promise<import("../../../domain/entities/Schedule").Schedule[]>;
    saveSchedule(dto: SaveScheduleDto): Promise<import("../../../domain/entities/Schedule").Schedule>;
    getCourses(grade?: string): Promise<import("../../../domain/entities/Course").Course[]>;
    getTeachers(): Promise<{
        id: string;
        username: string;
        fullName: string;
        fullNameAmharic: string;
        email: string;
    }[]>;
    assignTeacher(courseId: string, teacherId: string | null): Promise<{
        success: boolean;
        courseId: string;
        assignedTeacherId: string;
        course: import("../../../domain/entities/Course").Course;
    }>;
    getStudents(grade?: string): Promise<import("../../../domain/entities/Student").Student[]>;
    previewCsv(file?: Express.Multer.File, csvText?: string): Promise<import("../../../application/use-cases/ImportStudentsUseCase").CSVPreviewResult>;
    commitImport(rows: CSVStudentRow[]): Promise<{
        success: boolean;
        importedCount: number;
        students: import("../../../domain/entities/Student").Student[];
    }>;
    getConsolidatedGrades(grade?: string, year?: string): Promise<import("../../../application/use-cases/ExportGradesUseCase").ConsolidatedGradeRow[]>;
    exportCsv(res: Response, grade?: string, year?: string): Promise<void>;
    exportExcel(res: Response, grade?: string, year?: string): Promise<void>;
    getPromotionCandidates(grade?: string): Promise<import("../../../application/use-cases/PromoteStudentsUseCase").PromotionCandidateSummary[]>;
    executePromotion(grade?: number): Promise<import("../../../application/use-cases/PromoteStudentsUseCase").BulkPromotionResult>;
}
