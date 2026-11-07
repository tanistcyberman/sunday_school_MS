import { InvalidMarkException } from '../exceptions/DomainException';

export class FinalMark {
  private readonly value: number;

  constructor(value: number) {
    if (value === null || value === undefined || isNaN(value)) {
      throw new InvalidMarkException('Final exam mark must be a valid number');
    }
    if (value < 0 || value > 60) {
      throw new InvalidMarkException(`Final exam mark must be between 0 and 60. Received: ${value}`);
    }
    this.value = Math.round(value * 100) / 100;
  }

  public getValue(): number {
    return this.value;
  }

  public static create(value: number): FinalMark {
    return new FinalMark(value);
  }
}
