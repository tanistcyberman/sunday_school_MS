import { MidMark } from '../value-objects/MidMark';
import { FinalMark } from '../value-objects/FinalMark';
import { TotalScore } from '../value-objects/TotalScore';
import { PassStatus } from '../value-objects/PassStatus';
export declare class GradeRecord {
    readonly id: string;
    readonly studentId: string;
    readonly courseId: string;
    academicYear: string;
    midMark: MidMark | null;
    finalMark: FinalMark | null;
    totalScore: TotalScore | null;
    passStatus: PassStatus;
    readonly updatedAt: Date;
    studentCode?: string;
    studentName?: string;
    studentNameAmharic?: string;
    gradeLevel?: number;
    courseName?: string;
    courseNameAmharic?: string;
    constructor(id: string, studentId: string, courseId: string, academicYear: string, midMark: MidMark | null, finalMark: FinalMark | null, totalScore: TotalScore | null, passStatus: PassStatus, updatedAt?: Date, studentCode?: string, studentName?: string, studentNameAmharic?: string, gradeLevel?: number, courseName?: string, courseNameAmharic?: string);
    updateMarks(mid: number | null, final: number | null): void;
    isPassed(): boolean;
}
