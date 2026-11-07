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
exports.PostgresGradeRepo = void 0;
const common_1 = require("@nestjs/common");
const GradeRecord_1 = require("../../../domain/entities/GradeRecord");
const MidMark_1 = require("../../../domain/value-objects/MidMark");
const FinalMark_1 = require("../../../domain/value-objects/FinalMark");
const TotalScore_1 = require("../../../domain/value-objects/TotalScore");
const PassStatus_1 = require("../../../domain/value-objects/PassStatus");
const DatabaseService_1 = require("./DatabaseService");
let PostgresGradeRepo = class PostgresGradeRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().grade_records.find(g => g.id === id);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query(`SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       WHERE g.id = $1`, [id]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByStudentId(studentId) {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().grade_records
                .filter(g => g.student_id === studentId)
                .map(g => this.mapRow(g));
        }
        const res = await this.db.query(`SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       WHERE g.student_id = $1
       ORDER BY c.code ASC`, [studentId]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().grade_records
                .filter(g => g.student_id === studentId)
                .map(g => this.mapRow(g));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findByCourseAndGrade(courseId, gradeLevel) {
        const res = await this.db.query(`SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       JOIN students s ON g.student_id = s.id
       JOIN courses c ON g.course_id = c.id
       WHERE g.course_id = $1 AND s.grade_level = $2
       ORDER BY s.student_code ASC`, [courseId, gradeLevel]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().grade_records
                .filter(g => g.course_id === courseId && g.grade_level === gradeLevel)
                .map(g => this.mapRow(g));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findAll() {
        const res = await this.db.query(`SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       ORDER BY s.grade_level ASC, s.student_code ASC`);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().grade_records.map(g => this.mapRow(g));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async save(grade) {
        const query = `
      INSERT INTO grade_records (id, student_id, course_id, academic_year, mid_mark, final_mark, total_score, pass_status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (student_id, course_id, academic_year) DO UPDATE SET
        mid_mark = EXCLUDED.mid_mark,
        final_mark = EXCLUDED.final_mark,
        total_score = EXCLUDED.total_score,
        pass_status = EXCLUDED.pass_status,
        updated_at = EXCLUDED.updated_at;
    `;
        await this.db.query(query, [
            grade.id,
            grade.studentId,
            grade.courseId,
            grade.academicYear,
            grade.midMark ? grade.midMark.getValue() : null,
            grade.finalMark ? grade.finalMark.getValue() : null,
            grade.totalScore ? grade.totalScore.getValue() : null,
            grade.passStatus.getStatus(),
            grade.updatedAt
        ]);
        const memList = this.db.getMemoryStore().grade_records;
        const idx = memList.findIndex(g => g.student_id === grade.studentId && g.course_id === grade.courseId && g.academic_year === grade.academicYear);
        const row = {
            id: grade.id,
            student_id: grade.studentId,
            course_id: grade.courseId,
            academic_year: grade.academicYear,
            mid_mark: grade.midMark ? grade.midMark.getValue() : null,
            final_mark: grade.finalMark ? grade.finalMark.getValue() : null,
            total_score: grade.totalScore ? grade.totalScore.getValue() : null,
            pass_status: grade.passStatus.getStatus(),
            updated_at: grade.updatedAt
        };
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return grade;
    }
    async saveBatch(grades) {
        for (const g of grades) {
            await this.save(g);
        }
    }
    async getStudentCourseGrades(academicYear) {
        const res = await this.db.query(`SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       JOIN students s ON g.student_id = s.id
       JOIN courses c ON g.course_id = c.id
       WHERE g.academic_year = $1`, [academicYear]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().grade_records
                .filter(g => g.academic_year === academicYear)
                .map(g => this.mapRow(g));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    mapRow(row) {
        const mid = row.mid_mark !== null && row.mid_mark !== undefined ? new MidMark_1.MidMark(parseFloat(row.mid_mark)) : null;
        const final = row.final_mark !== null && row.final_mark !== undefined ? new FinalMark_1.FinalMark(parseFloat(row.final_mark)) : null;
        const total = row.total_score !== null && row.total_score !== undefined ? new TotalScore_1.TotalScore(parseFloat(row.total_score)) : null;
        const status = PassStatus_1.PassStatus.fromString(row.pass_status);
        return new GradeRecord_1.GradeRecord(row.id, row.student_id, row.course_id, row.academic_year, mid, final, total, status, new Date(row.updated_at || Date.now()), row.student_code, row.student_name, row.student_name_amharic, row.grade_level ? parseInt(row.grade_level, 10) : undefined, row.course_name, row.course_name_amharic);
    }
};
exports.PostgresGradeRepo = PostgresGradeRepo;
exports.PostgresGradeRepo = PostgresGradeRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresGradeRepo);
//# sourceMappingURL=PostgresGradeRepo.js.map