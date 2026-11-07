import { InvalidGradeLevelException } from '../exceptions/DomainException';

export type StudentStatus = 'ACTIVE' | 'PROMOTED' | 'RETAINED' | 'GRADUATED';

export class Student {
  constructor(
    public readonly id: string,
    public readonly studentCode: string,
    public fullName: string,
    public fullNameAmharic: string,
    public gradeLevel: number,
    public gender: 'M' | 'F',
    public section: string = '1',
    public status: StudentStatus = 'ACTIVE',
    public readonly createdAt: Date = new Date()
  ) {
    if (gradeLevel < 4 || gradeLevel > 10) {
      throw new InvalidGradeLevelException(gradeLevel);
    }
  }

  public promote(): Student {
    if (this.gradeLevel >= 10) {
      return new Student(
        this.id,
        this.studentCode,
        this.fullName,
        this.fullNameAmharic,
        10,
        this.gender,
        this.section,
        'GRADUATED',
        this.createdAt
      );
    }
    return new Student(
      this.id,
      this.studentCode,
      this.fullName,
      this.fullNameAmharic,
      this.gradeLevel + 1,
      this.gender,
      this.section,
      'PROMOTED',
      this.createdAt
    );
  }

  public retain(): Student {
    return new Student(
      this.id,
      this.studentCode,
      this.fullName,
      this.fullNameAmharic,
      this.gradeLevel,
      this.gender,
      this.section,
      'RETAINED',
      this.createdAt
    );
  }
}
