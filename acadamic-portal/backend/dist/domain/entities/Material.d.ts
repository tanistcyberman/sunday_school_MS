export declare class Material {
    readonly id: string;
    readonly courseId: string;
    readonly gradeLevel: number;
    title: string;
    titleAmharic: string;
    description: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedByTeacherId: string;
    courseName?: string;
    courseNameAmharic?: string;
    readonly createdAt: Date;
    constructor(id: string, courseId: string, gradeLevel: number, title: string, titleAmharic: string, description: string, fileName: string, filePath: string, fileSize: number, mimeType: string, uploadedByTeacherId: string, courseName?: string, courseNameAmharic?: string, createdAt?: Date);
    isWithinSizeLimit(): boolean;
}
