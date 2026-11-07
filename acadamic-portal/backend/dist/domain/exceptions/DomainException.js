"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidGradeLevelException = exports.StudentNotFoundException = exports.InvalidMarkException = exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainException';
    }
}
exports.DomainException = DomainException;
class InvalidMarkException extends DomainException {
    constructor(message = 'Invalid mark provided') {
        super(message);
        this.name = 'InvalidMarkException';
    }
}
exports.InvalidMarkException = InvalidMarkException;
class StudentNotFoundException extends DomainException {
    constructor(studentId) {
        super(`Student with ID or Code ${studentId} not found`);
        this.name = 'StudentNotFoundException';
    }
}
exports.StudentNotFoundException = StudentNotFoundException;
class InvalidGradeLevelException extends DomainException {
    constructor(grade) {
        super(`Grade level must be between 4 and 10. Received: ${grade}`);
        this.name = 'InvalidGradeLevelException';
    }
}
exports.InvalidGradeLevelException = InvalidGradeLevelException;
//# sourceMappingURL=DomainException.js.map