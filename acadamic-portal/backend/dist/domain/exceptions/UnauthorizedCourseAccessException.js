"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedCourseAccessException = void 0;
const DomainException_1 = require("./DomainException");
class UnauthorizedCourseAccessException extends DomainException_1.DomainException {
    constructor(message = 'ይህንን ትምህርት ለማስተካከል ፈቃድ የለዎትም (You are not authorized to modify this course)') {
        super(message);
        this.name = 'UnauthorizedCourseAccessException';
    }
}
exports.UnauthorizedCourseAccessException = UnauthorizedCourseAccessException;
//# sourceMappingURL=UnauthorizedCourseAccessException.js.map