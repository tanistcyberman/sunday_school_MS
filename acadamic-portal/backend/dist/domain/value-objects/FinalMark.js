"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalMark = void 0;
const DomainException_1 = require("../exceptions/DomainException");
class FinalMark {
    constructor(value) {
        if (value === null || value === undefined || isNaN(value)) {
            throw new DomainException_1.InvalidMarkException('Final exam mark must be a valid number');
        }
        if (value < 0 || value > 60) {
            throw new DomainException_1.InvalidMarkException(`Final exam mark must be between 0 and 60. Received: ${value}`);
        }
        this.value = Math.round(value * 100) / 100;
    }
    getValue() {
        return this.value;
    }
    static create(value) {
        return new FinalMark(value);
    }
}
exports.FinalMark = FinalMark;
//# sourceMappingURL=FinalMark.js.map