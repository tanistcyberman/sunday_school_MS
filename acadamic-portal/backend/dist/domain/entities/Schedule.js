"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
class Schedule {
    constructor(id, courseId, gradeLevel, academicYear, semester, startDate, midExamDate, finalExamDate, courseName, courseNameAmharic, createdAt = new Date()) {
        this.id = id;
        this.courseId = courseId;
        this.gradeLevel = gradeLevel;
        this.academicYear = academicYear;
        this.semester = semester;
        this.startDate = startDate;
        this.midExamDate = midExamDate;
        this.finalExamDate = finalExamDate;
        this.courseName = courseName;
        this.courseNameAmharic = courseNameAmharic;
        this.createdAt = createdAt;
    }
}
exports.Schedule = Schedule;
//# sourceMappingURL=Schedule.js.map