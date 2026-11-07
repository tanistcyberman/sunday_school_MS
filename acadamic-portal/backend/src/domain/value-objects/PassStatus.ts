import { TotalScore } from './TotalScore';

export enum PassStatusType {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export class PassStatus {
  public static readonly PASSING_THRESHOLD = 50.0;
  private readonly status: PassStatusType;

  constructor(status: PassStatusType) {
    this.status = status;
  }

  public getStatus(): PassStatusType {
    return this.status;
  }

  public isPassed(): boolean {
    return this.status === PassStatusType.PASSED;
  }

  public static determine(totalScore: TotalScore | null): PassStatus {
    if (!totalScore) {
      return new PassStatus(PassStatusType.PENDING);
    }
    return totalScore.getValue() >= PassStatus.PASSING_THRESHOLD
      ? new PassStatus(PassStatusType.PASSED)
      : new PassStatus(PassStatusType.FAILED);
  }

  public static fromString(val: string): PassStatus {
    const upper = (val || '').toUpperCase();
    if (upper === 'PASSED') return new PassStatus(PassStatusType.PASSED);
    if (upper === 'FAILED') return new PassStatus(PassStatusType.FAILED);
    return new PassStatus(PassStatusType.PENDING);
  }
}
