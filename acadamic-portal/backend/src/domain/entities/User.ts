export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly fullName: string,
    public readonly fullNameAmharic: string,
    public readonly studentId?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  public isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  public isTeacher(): boolean {
    return this.role === 'TEACHER';
  }

  public isStudent(): boolean {
    return this.role === 'STUDENT';
  }
}
