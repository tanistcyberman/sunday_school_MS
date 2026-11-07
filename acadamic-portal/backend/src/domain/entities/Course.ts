import { InvalidGradeLevelException } from '../exceptions/DomainException';

export class Course {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public name: string,
    public nameAmharic: string,
    public gradeLevel: number,
    public description: string = '',
    public descriptionAmharic: string = '',
    public assignedTeacherId: string | null = null,
    public readonly createdAt: Date = new Date()
  ) {
    if (gradeLevel < 4 || gradeLevel > 10) {
      throw new InvalidGradeLevelException(gradeLevel);
    }
  }

  public isOwnedBy(teacherId: string): boolean {
    return this.assignedTeacherId === teacherId;
  }
}
