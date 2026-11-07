export type StudentStatus = 'ACTIVE' | 'PROMOTED' | 'RETAINED' | 'GRADUATED';
export declare class Student {
    readonly id: string;
    readonly studentCode: string;
    fullName: string;
    fullNameAmharic: string;
    gradeLevel: number;
    gender: 'M' | 'F';
    section: string;
    status: StudentStatus;
    readonly createdAt: Date;
    constructor(id: string, studentCode: string, fullName: string, fullNameAmharic: string, gradeLevel: number, gender: 'M' | 'F', section?: string, status?: StudentStatus, createdAt?: Date);
    promote(): Student;
    retain(): Student;
}
