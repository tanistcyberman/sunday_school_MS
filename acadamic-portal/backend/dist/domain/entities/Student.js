"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const DomainException_1 = require("../exceptions/DomainException");
class Student {
    constructor(id, studentCode, fullName, fullNameAmharic, gradeLevel, gender, section = '1', status = 'ACTIVE', createdAt = new Date()) {
        this.id = id;
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.fullNameAmharic = fullNameAmharic;
        this.gradeLevel = gradeLevel;
        this.gender = gender;
        this.section = section;
        this.status = status;
        this.createdAt = createdAt;
        if (gradeLevel < 4 || gradeLevel > 10) {
            throw new DomainException_1.InvalidGradeLevelException(gradeLevel);
        }
    }
    promote() {
        if (this.gradeLevel >= 10) {
            return new Student(this.id, this.studentCode, this.fullName, this.fullNameAmharic, 10, this.gender, this.section, 'GRADUATED', this.createdAt);
        }
        return new Student(this.id, this.studentCode, this.fullName, this.fullNameAmharic, this.gradeLevel + 1, this.gender, this.section, 'PROMOTED', this.createdAt);
    }
    retain() {
        return new Student(this.id, this.studentCode, this.fullName, this.fullNameAmharic, this.gradeLevel, this.gender, this.section, 'RETAINED', this.createdAt);
    }
}
exports.Student = Student;
//# sourceMappingURL=Student.js.map