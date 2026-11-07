import { MidMark } from '../value-objects/MidMark';
import { FinalMark } from '../value-objects/FinalMark';
import { TotalScore } from '../value-objects/TotalScore';
import { PassStatus, PassStatusType } from '../value-objects/PassStatus';

export class GradeRecord {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly courseId: string,
    public academicYear: string,
    public midMark: MidMark | null,
    public finalMark: FinalMark | null,
    public totalScore: TotalScore | null,
    public passStatus: PassStatus,
    public readonly updatedAt: Date = new Date(),
    public studentCode?: string,
    public studentName?: string,
    public studentNameAmharic?: string,
    public gradeLevel?: number,
    public courseName?: string,
    public courseNameAmharic?: string
  ) {}

  public updateMarks(mid: number | null, final: number | null): void {
    this.midMark = mid !== null && mid !== undefined ? MidMark.create(mid) : null;
    this.finalMark = final !== null && final !== undefined ? FinalMark.create(final) : null;

    if (this.midMark !== null && this.finalMark !== null) {
      this.totalScore = TotalScore.calculate(this.midMark, this.finalMark);
      this.passStatus = PassStatus.determine(this.totalScore);
    } else {
      this.totalScore = null;
      this.passStatus = new PassStatus(PassStatusType.PENDING);
    }
  }

  public isPassed(): boolean {
    return this.passStatus.isPassed();
  }
}
