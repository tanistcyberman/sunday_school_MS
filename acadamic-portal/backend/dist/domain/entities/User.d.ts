export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
export declare class User {
    readonly id: string;
    readonly username: string;
    readonly email: string;
    readonly passwordHash: string;
    readonly role: UserRole;
    readonly fullName: string;
    readonly fullNameAmharic: string;
    readonly studentId?: string;
    readonly createdAt: Date;
    constructor(id: string, username: string, email: string, passwordHash: string, role: UserRole, fullName: string, fullNameAmharic: string, studentId?: string, createdAt?: Date);
    isAdmin(): boolean;
    isTeacher(): boolean;
    isStudent(): boolean;
}
