"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterScheduleUseCase = void 0;
const Schedule_1 = require("../../domain/entities/Schedule");
class MasterScheduleUseCase {
    constructor(scheduleRepo, courseRepo) {
        this.scheduleRepo = scheduleRepo;
        this.courseRepo = courseRepo;
    }
    async getSchedulesByGrade(gradeLevel) {
        const schedules = await this.scheduleRepo.findByGrade(gradeLevel);
        const courses = await this.courseRepo.findByGrade(gradeLevel);
        const courseMap = new Map(courses.map(c => [c.id, c]));
        return schedules.map(s => {
            const course = courseMap.get(s.courseId);
            return new Schedule_1.Schedule(s.id, s.courseId, s.gradeLevel, s.academicYear, s.semester, s.startDate, s.midExamDate, s.finalExamDate, course?.name, course?.nameAmharic, s.createdAt);
        });
    }
    async getAllSchedules() {
        const schedules = await this.scheduleRepo.findAll();
        const courses = await this.courseRepo.findAll();
        const courseMap = new Map(courses.map(c => [c.id, c]));
        return schedules.map(s => {
            const course = courseMap.get(s.courseId);
            return new Schedule_1.Schedule(s.id, s.courseId, s.gradeLevel, s.academicYear, s.semester, s.startDate, s.midExamDate, s.finalExamDate, course?.name, course?.nameAmharic, s.createdAt);
        });
    }
    async saveSchedule(dto) {
        const id = dto.id || `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const schedule = new Schedule_1.Schedule(id, dto.courseId, dto.gradeLevel, dto.academicYear, dto.semester, new Date(dto.startDate), new Date(dto.midExamDate), new Date(dto.finalExamDate));
        return await this.scheduleRepo.save(schedule);
    }
}
exports.MasterScheduleUseCase = MasterScheduleUseCase;
//# sourceMappingURL=MasterScheduleUseCase.js.map