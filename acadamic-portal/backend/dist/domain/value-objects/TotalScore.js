"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotalScore = void 0;
const DomainException_1 = require("../exceptions/DomainException");
class TotalScore {
    constructor(value) {
        if (value === null || value === undefined || isNaN(value)) {
            throw new DomainException_1.InvalidMarkException('Total score must be a valid number');
        }
        if (value < 0 || value > 100) {
            throw new DomainException_1.InvalidMarkException(`Total score must be between 0 and 100. Received: ${value}`);
        }
        this.value = Math.round(value * 100) / 100;
    }
    getValue() {
        return this.value;
    }
    static calculate(mid, final) {
        const sum = mid.getValue() + final.getValue();
        return new TotalScore(sum);
    }
    static fromNumber(value) {
        return new TotalScore(value);
    }
}
exports.TotalScore = TotalScore;
//# sourceMappingURL=TotalScore.js.map