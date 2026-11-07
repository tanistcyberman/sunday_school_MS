import { MidMark } from './MidMark';
import { FinalMark } from './FinalMark';
export declare class TotalScore {
    private readonly value;
    constructor(value: number);
    getValue(): number;
    static calculate(mid: MidMark, final: FinalMark): TotalScore;
    static fromNumber(value: number): TotalScore;
}
