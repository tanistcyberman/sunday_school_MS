export class Schedule {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly gradeLevel: number,
    public academicYear: string,
    public semester: string,
    public startDate: Date,
    public midExamDate: Date,
    public finalExamDate: Date,
    public courseName?: string,
    public courseNameAmharic?: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
