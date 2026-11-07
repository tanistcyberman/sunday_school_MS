"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidMark = void 0;
const DomainException_1 = require("../exceptions/DomainException");
class MidMark {
    constructor(value) {
        if (value === null || value === undefined || isNaN(value)) {
            throw new DomainException_1.InvalidMarkException('Mid exam mark must be a valid number');
        }
        if (value < 0 || value > 40) {
            throw new DomainException_1.InvalidMarkException(`Mid exam mark must be between 0 and 40. Received: ${value}`);
        }
        this.value = Math.round(value * 100) / 100;
    }
    getValue() {
        return this.value;
    }
    static create(value) {
        return new MidMark(value);
    }
}
exports.MidMark = MidMark;
//# sourceMappingURL=MidMark.js.map