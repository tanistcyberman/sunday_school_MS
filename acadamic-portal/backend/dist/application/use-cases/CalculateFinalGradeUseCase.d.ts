import { GradeRepositoryPort } from '../ports/out/GradeRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
import { GradeRecord } from '../../domain/entities/GradeRecord';
export interface UpdateGradeDto {
    studentId: string;
    courseId: string;
    academicYear: string;
    midMark: number | null;
    finalMark: number | null;
    requesterTeacherId?: string;
    requesterRole?: string;
}
export declare class CalculateFinalGradeUseCase {
    private readonly gradeRepo;
    private readonly courseRepo;
    constructor(gradeRepo: GradeRepositoryPort, courseRepo: CourseRepositoryPort);
    saveOrUpdateGrade(dto: UpdateGradeDto): Promise<GradeRecord>;
    batchSaveGrades(gradesDto: UpdateGradeDto[]): Promise<void>;
}
