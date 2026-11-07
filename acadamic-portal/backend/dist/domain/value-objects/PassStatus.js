"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassStatus = exports.PassStatusType = void 0;
var PassStatusType;
(function (PassStatusType) {
    PassStatusType["PASSED"] = "PASSED";
    PassStatusType["FAILED"] = "FAILED";
    PassStatusType["PENDING"] = "PENDING";
})(PassStatusType || (exports.PassStatusType = PassStatusType = {}));
class PassStatus {
    constructor(status) {
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    isPassed() {
        return this.status === PassStatusType.PASSED;
    }
    static determine(totalScore) {
        if (!totalScore) {
            return new PassStatus(PassStatusType.PENDING);
        }
        return totalScore.getValue() >= PassStatus.PASSING_THRESHOLD
            ? new PassStatus(PassStatusType.PASSED)
            : new PassStatus(PassStatusType.FAILED);
    }
    static fromString(val) {
        const upper = (val || '').toUpperCase();
        if (upper === 'PASSED')
            return new PassStatus(PassStatusType.PASSED);
        if (upper === 'FAILED')
            return new PassStatus(PassStatusType.FAILED);
        return new PassStatus(PassStatusType.PENDING);
    }
}
exports.PassStatus = PassStatus;
PassStatus.PASSING_THRESHOLD = 50.0;
//# sourceMappingURL=PassStatus.js.map