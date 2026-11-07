import { TotalScore } from './TotalScore';
export declare enum PassStatusType {
    PASSED = "PASSED",
    FAILED = "FAILED",
    PENDING = "PENDING"
}
export declare class PassStatus {
    static readonly PASSING_THRESHOLD = 50;
    private readonly status;
    constructor(status: PassStatusType);
    getStatus(): PassStatusType;
    isPassed(): boolean;
    static determine(totalScore: TotalScore | null): PassStatus;
    static fromString(val: string): PassStatus;
}
