export class Material {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly gradeLevel: number,
    public title: string,
    public titleAmharic: string,
    public description: string,
    public fileName: string,
    public filePath: string,
    public fileSize: number,
    public mimeType: string,
    public uploadedByTeacherId: string,
    public courseName?: string,
    public courseNameAmharic?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  public isWithinSizeLimit(): boolean {
    const TEN_MB = 10 * 1024 * 1024;
    return this.fileSize <= TEN_MB;
  }
}
