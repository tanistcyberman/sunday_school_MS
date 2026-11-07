import { StudentRepositoryPort } from '../ports/out/StudentRepositoryPort';
import { GradeRepositoryPort } from '../ports/out/GradeRepositoryPort';
export interface PromotionCandidateSummary {
    studentId: string;
    studentCode: string;
    fullName: string;
    fullNameAmharic: string;
    previousGrade: number;
    newGrade: number;
    averageScore: number;
    passed: boolean;
    actionTaken: 'PROMOTED' | 'RETAINED' | 'GRADUATED';
}
export interface BulkPromotionResult {
    totalEvaluated: number;
    promotedCount: number;
    retainedCount: number;
    graduatedCount: number;
    candidates: PromotionCandidateSummary[];
}
export declare class PromoteStudentsUseCase {
    private readonly studentRepo;
    private readonly gradeRepo;
    constructor(studentRepo: StudentRepositoryPort, gradeRepo: GradeRepositoryPort);
    evaluatePromotionCandidates(gradeLevel?: number): Promise<PromotionCandidateSummary[]>;
    executeBulkPromotion(gradeLevel?: number): Promise<BulkPromotionResult>;
}
