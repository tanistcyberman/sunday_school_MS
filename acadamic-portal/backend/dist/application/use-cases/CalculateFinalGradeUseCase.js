"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateFinalGradeUseCase = void 0;
const GradeRecord_1 = require("../../domain/entities/GradeRecord");
const MidMark_1 = require("../../domain/value-objects/MidMark");
const FinalMark_1 = require("../../domain/value-objects/FinalMark");
const TotalScore_1 = require("../../domain/value-objects/TotalScore");
const PassStatus_1 = require("../../domain/value-objects/PassStatus");
const UnauthorizedCourseAccessException_1 = require("../../domain/exceptions/UnauthorizedCourseAccessException");
class CalculateFinalGradeUseCase {
    constructor(gradeRepo, courseRepo) {
        this.gradeRepo = gradeRepo;
        this.courseRepo = courseRepo;
    }
    async saveOrUpdateGrade(dto) {
        if (dto.requesterRole !== 'ADMIN' && dto.requesterTeacherId) {
            const course = await this.courseRepo.findById(dto.courseId);
            if (!course || !course.isOwnedBy(dto.requesterTeacherId)) {
                throw new UnauthorizedCourseAccessException_1.UnauthorizedCourseAccessException();
            }
        }
        const studentGrades = await this.gradeRepo.findByStudentId(dto.studentId);
        let record = studentGrades.find(g => g.courseId === dto.courseId && g.academicYear === dto.academicYear);
        const midObj = dto.midMark !== null && dto.midMark !== undefined ? new MidMark_1.MidMark(dto.midMark) : null;
        const finalObj = dto.finalMark !== null && dto.finalMark !== undefined ? new FinalMark_1.FinalMark(dto.finalMark) : null;
        let totalObj = null;
        let passStatusObj = PassStatus_1.PassStatus.determine(null);
        if (midObj !== null && finalObj !== null) {
            totalObj = TotalScore_1.TotalScore.calculate(midObj, finalObj);
            passStatusObj = PassStatus_1.PassStatus.determine(totalObj);
        }
        if (!record) {
            const newId = `grd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            record = new GradeRecord_1.GradeRecord(newId, dto.studentId, dto.courseId, dto.academicYear, midObj, finalObj, totalObj, passStatusObj);
        }
        else {
            record.updateMarks(dto.midMark, dto.finalMark);
        }
        return await this.gradeRepo.save(record);
    }
    async batchSaveGrades(gradesDto) {
        for (const dto of gradesDto) {
            await this.saveOrUpdateGrade(dto);
        }
    }
}
exports.CalculateFinalGradeUseCase = CalculateFinalGradeUseCase;
//# sourceMappingURL=CalculateFinalGradeUseCase.js.map