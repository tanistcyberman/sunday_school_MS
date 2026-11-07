export declare class Course {
    readonly id: string;
    readonly code: string;
    name: string;
    nameAmharic: string;
    gradeLevel: number;
    description: string;
    descriptionAmharic: string;
    assignedTeacherId: string | null;
    readonly createdAt: Date;
    constructor(id: string, code: string, name: string, nameAmharic: string, gradeLevel: number, description?: string, descriptionAmharic?: string, assignedTeacherId?: string | null, createdAt?: Date);
    isOwnedBy(teacherId: string): boolean;
}
