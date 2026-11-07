import { InvalidMarkException } from '../exceptions/DomainException';

export class MidMark {
  private readonly value: number;

  constructor(value: number) {
    if (value === null || value === undefined || isNaN(value)) {
      throw new InvalidMarkException('Mid exam mark must be a valid number');
    }
    if (value < 0 || value > 40) {
      throw new InvalidMarkException(`Mid exam mark must be between 0 and 40. Received: ${value}`);
    }
    this.value = Math.round(value * 100) / 100;
  }

  public getValue(): number {
    return this.value;
  }

  public static create(value: number): MidMark {
    return new MidMark(value);
  }
}
