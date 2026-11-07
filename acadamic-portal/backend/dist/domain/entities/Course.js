"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const DomainException_1 = require("../exceptions/DomainException");
class Course {
    constructor(id, code, name, nameAmharic, gradeLevel, description = '', descriptionAmharic = '', assignedTeacherId = null, createdAt = new Date()) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.nameAmharic = nameAmharic;
        this.gradeLevel = gradeLevel;
        this.description = description;
        this.descriptionAmharic = descriptionAmharic;
        this.assignedTeacherId = assignedTeacherId;
        this.createdAt = createdAt;
        if (gradeLevel < 4 || gradeLevel > 10) {
            throw new DomainException_1.InvalidGradeLevelException(gradeLevel);
        }
    }
    isOwnedBy(teacherId) {
        return this.assignedTeacherId === teacherId;
    }
}
exports.Course = Course;
//# sourceMappingURL=Course.js.map