import { CalculateFinalGradeUseCase, UpdateGradeDto } from '../../../application/use-cases/CalculateFinalGradeUseCase';
import { MaterialUseCase } from '../../../application/use-cases/MaterialUseCase';
import { PostgresGradeRepo } from '../../../infrastructure/database/postgres/PostgresGradeRepo';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';
export declare class TeacherController {
    private readonly calculateGradeUseCase;
    private readonly materialUseCase;
    private readonly gradeRepo;
    private readonly courseRepo;
    private readonly studentRepo;
    constructor(calculateGradeUseCase: CalculateFinalGradeUseCase, materialUseCase: MaterialUseCase, gradeRepo: PostgresGradeRepo, courseRepo: PostgresCourseRepo, studentRepo: PostgresStudentRepo);
    getMyCourses(req: any): Promise<import("../../../domain/entities/Course").Course[]>;
    getCourses(grade?: string): Promise<import("../../../domain/entities/Course").Course[]>;
    getCourseStudents(courseId: string, year?: string): Promise<{
        studentId: string;
        studentCode: string;
        fullName: string;
        fullNameAmharic: string;
        gradeLevel: number;
        courseId: string;
        academicYear: string;
        midMark: number;
        finalMark: number;
        totalScore: number;
        passStatus: string;
    }[]>;
    getGradebook(courseId: string, grade: string, year?: string): Promise<{
        studentId: string;
        studentCode: string;
        fullName: string;
        fullNameAmharic: string;
        gradeLevel: number;
        courseId: string;
        academicYear: string;
        midMark: number;
        finalMark: number;
        totalScore: number;
        passStatus: string;
    }[]>;
    saveCourseGrade(courseId: string, dto: UpdateGradeDto, req: any): Promise<import("../../../domain/entities/GradeRecord").GradeRecord>;
    updateGrade(dto: UpdateGradeDto, req: any): Promise<import("../../../domain/entities/GradeRecord").GradeRecord>;
    batchUpdateGrades(grades: UpdateGradeDto[], req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getMaterials(grade?: string, courseId?: string, req?: any): Promise<import("../../../domain/entities/Material").Material[]>;
    uploadCourseMaterial(courseId: string, file: Express.Multer.File, title: string, description: string, req: any): Promise<import("../../../domain/entities/Material").Material>;
    uploadMaterial(file: Express.Multer.File, courseId: string, gradeLevel: string, title: string, titleAmharic: string, description: string, req: any): Promise<import("../../../domain/entities/Material").Material>;
    deleteMaterial(id: string, req: any): Promise<{
        success: boolean;
        id: string;
    }>;
}
