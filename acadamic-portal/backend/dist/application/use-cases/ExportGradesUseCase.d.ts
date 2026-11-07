import { GradeRepositoryPort } from '../ports/out/GradeRepositoryPort';
import { StudentRepositoryPort } from '../ports/out/StudentRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
export interface ConsolidatedGradeRow {
    studentCode: string;
    fullName: string;
    fullNameAmharic: string;
    gradeLevel: number;
    courses: {
        courseCode: string;
        courseName: string;
        courseNameAmharic: string;
        midMark: number | null;
        finalMark: number | null;
        totalScore: number | null;
        passStatus: string;
    }[];
    overallAverage: number;
    overallStatus: 'PASSED' | 'FAILED' | 'PENDING';
}
export declare class ExportGradesUseCase {
    private readonly gradeRepo;
    private readonly studentRepo;
    private readonly courseRepo;
    constructor(gradeRepo: GradeRepositoryPort, studentRepo: StudentRepositoryPort, courseRepo: CourseRepositoryPort);
    getConsolidatedGrades(gradeLevel?: number, academicYear?: string): Promise<ConsolidatedGradeRow[]>;
    generateCsv(data: ConsolidatedGradeRow[]): Buffer;
    generateExcel(data: ConsolidatedGradeRow[]): Buffer;
}
