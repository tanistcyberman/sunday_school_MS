export declare class Schedule {
    readonly id: string;
    readonly courseId: string;
    readonly gradeLevel: number;
    academicYear: string;
    semester: string;
    startDate: Date;
    midExamDate: Date;
    finalExamDate: Date;
    courseName?: string;
    courseNameAmharic?: string;
    readonly createdAt: Date;
    constructor(id: string, courseId: string, gradeLevel: number, academicYear: string, semester: string, startDate: Date, midExamDate: Date, finalExamDate: Date, courseName?: string, courseNameAmharic?: string, createdAt?: Date);
}
