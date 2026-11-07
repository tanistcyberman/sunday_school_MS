"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeRecord = void 0;
const MidMark_1 = require("../value-objects/MidMark");
const FinalMark_1 = require("../value-objects/FinalMark");
const TotalScore_1 = require("../value-objects/TotalScore");
const PassStatus_1 = require("../value-objects/PassStatus");
class GradeRecord {
    constructor(id, studentId, courseId, academicYear, midMark, finalMark, totalScore, passStatus, updatedAt = new Date(), studentCode, studentName, studentNameAmharic, gradeLevel, courseName, courseNameAmharic) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.academicYear = academicYear;
        this.midMark = midMark;
        this.finalMark = finalMark;
        this.totalScore = totalScore;
        this.passStatus = passStatus;
        this.updatedAt = updatedAt;
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.studentNameAmharic = studentNameAmharic;
        this.gradeLevel = gradeLevel;
        this.courseName = courseName;
        this.courseNameAmharic = courseNameAmharic;
    }
    updateMarks(mid, final) {
        this.midMark = mid !== null && mid !== undefined ? MidMark_1.MidMark.create(mid) : null;
        this.finalMark = final !== null && final !== undefined ? FinalMark_1.FinalMark.create(final) : null;
        if (this.midMark !== null && this.finalMark !== null) {
            this.totalScore = TotalScore_1.TotalScore.calculate(this.midMark, this.finalMark);
            this.passStatus = PassStatus_1.PassStatus.determine(this.totalScore);
        }
        else {
            this.totalScore = null;
            this.passStatus = new PassStatus_1.PassStatus(PassStatus_1.PassStatusType.PENDING);
        }
    }
    isPassed() {
        return this.passStatus.isPassed();
    }
}
exports.GradeRecord = GradeRecord;
//# sourceMappingURL=GradeRecord.js.map