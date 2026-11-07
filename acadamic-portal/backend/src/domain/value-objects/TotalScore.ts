import { MidMark } from './MidMark';
import { FinalMark } from './FinalMark';
import { InvalidMarkException } from '../exceptions/DomainException';

export class TotalScore {
  private readonly value: number;

  constructor(value: number) {
    if (value === null || value === undefined || isNaN(value)) {
      throw new InvalidMarkException('Total score must be a valid number');
    }
    if (value < 0 || value > 100) {
      throw new InvalidMarkException(`Total score must be between 0 and 100. Received: ${value}`);
    }
    this.value = Math.round(value * 100) / 100;
  }

  public getValue(): number {
    return this.value;
  }

  public static calculate(mid: MidMark, final: FinalMark): TotalScore {
    const sum = mid.getValue() + final.getValue();
    return new TotalScore(sum);
  }

  public static fromNumber(value: number): TotalScore {
    return new TotalScore(value);
  }
}
