"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresScheduleRepo = void 0;
const common_1 = require("@nestjs/common");
const Schedule_1 = require("../../../domain/entities/Schedule");
const DatabaseService_1 = require("./DatabaseService");
let PostgresScheduleRepo = class PostgresScheduleRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().schedules.find(s => s.id === id);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query(`SELECT s.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = $1`, [id]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByGrade(gradeLevel) {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().schedules
                .filter(s => s.grade_level === gradeLevel)
                .map(s => this.mapRow(s));
        }
        const res = await this.db.query(`SELECT s.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.grade_level = $1
       ORDER BY s.start_date ASC`, [gradeLevel]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().schedules
                .filter(s => s.grade_level === gradeLevel)
                .map(s => this.mapRow(s));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findByCourse(courseId) {
        const res = await this.db.query(`SELECT s.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.course_id = $1`, [courseId]);
        if (res.rows.length === 0) {
            const mem = this.db.getMemoryStore().schedules.find(s => s.course_id === courseId);
            return mem ? this.mapRow(mem) : null;
        }
        return this.mapRow(res.rows[0]);
    }
    async findAll() {
        const res = await this.db.query(`SELECT s.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM schedules s
       LEFT JOIN courses c ON s.course_id = c.id
       ORDER BY s.grade_level ASC, s.start_date ASC`);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().schedules.map(s => this.mapRow(s));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async save(schedule) {
        const query = `
      INSERT INTO schedules (id, course_id, grade_level, academic_year, semester, start_date, mid_exam_date, final_exam_date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        course_id = EXCLUDED.course_id,
        grade_level = EXCLUDED.grade_level,
        academic_year = EXCLUDED.academic_year,
        semester = EXCLUDED.semester,
        start_date = EXCLUDED.start_date,
        mid_exam_date = EXCLUDED.mid_exam_date,
        final_exam_date = EXCLUDED.final_exam_date;
    `;
        await this.db.query(query, [
            schedule.id,
            schedule.courseId,
            schedule.gradeLevel,
            schedule.academicYear,
            schedule.semester,
            schedule.startDate,
            schedule.midExamDate,
            schedule.finalExamDate,
            schedule.createdAt
        ]);
        const memList = this.db.getMemoryStore().schedules;
        const idx = memList.findIndex(s => s.id === schedule.id);
        const row = {
            id: schedule.id,
            course_id: schedule.courseId,
            grade_level: schedule.gradeLevel,
            academic_year: schedule.academicYear,
            semester: schedule.semester,
            start_date: schedule.startDate,
            mid_exam_date: schedule.midExamDate,
            final_exam_date: schedule.finalExamDate,
            course_name: schedule.courseName,
            course_name_amharic: schedule.courseNameAmharic,
            created_at: schedule.createdAt
        };
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return schedule;
    }
    mapRow(row) {
        return new Schedule_1.Schedule(row.id, row.course_id, parseInt(row.grade_level, 10), row.academic_year, row.semester, new Date(row.start_date), new Date(row.mid_exam_date), new Date(row.final_exam_date), row.course_name, row.course_name_amharic, new Date(row.created_at));
    }
};
exports.PostgresScheduleRepo = PostgresScheduleRepo;
exports.PostgresScheduleRepo = PostgresScheduleRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresScheduleRepo);
//# sourceMappingURL=PostgresScheduleRepo.js.map