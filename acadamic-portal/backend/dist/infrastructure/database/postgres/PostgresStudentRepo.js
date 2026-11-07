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
exports.PostgresStudentRepo = void 0;
const common_1 = require("@nestjs/common");
const Student_1 = require("../../../domain/entities/Student");
const DatabaseService_1 = require("./DatabaseService");
let PostgresStudentRepo = class PostgresStudentRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().students.find(s => s.id === id);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query('SELECT * FROM students WHERE id = $1', [id]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByCode(code) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().students.find(s => s.student_code === code);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query('SELECT * FROM students WHERE student_code = $1', [code]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByGrade(gradeLevel) {
        const res = await this.db.query('SELECT * FROM students WHERE grade_level = $1 ORDER BY student_code ASC', [gradeLevel]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().students
                .filter(s => s.grade_level === gradeLevel)
                .map(s => this.mapRow(s));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findAll() {
        const res = await this.db.query('SELECT * FROM students ORDER BY grade_level ASC, student_code ASC');
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().students.map(s => this.mapRow(s));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async save(student) {
        const query = `
      INSERT INTO students (id, student_code, full_name, full_name_amharic, grade_level, gender, section, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        full_name_amharic = EXCLUDED.full_name_amharic,
        grade_level = EXCLUDED.grade_level,
        gender = EXCLUDED.gender,
        section = EXCLUDED.section,
        status = EXCLUDED.status;
    `;
        await this.db.query(query, [
            student.id,
            student.studentCode,
            student.fullName,
            student.fullNameAmharic,
            student.gradeLevel,
            student.gender,
            student.section,
            student.status,
            student.createdAt
        ]);
        const memList = this.db.getMemoryStore().students;
        const idx = memList.findIndex(s => s.id === student.id);
        const row = {
            id: student.id,
            student_code: student.studentCode,
            full_name: student.fullName,
            full_name_amharic: student.fullNameAmharic,
            grade_level: student.gradeLevel,
            gender: student.gender,
            section: student.section,
            status: student.status,
            created_at: student.createdAt
        };
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return student;
    }
    async saveMany(students) {
        for (const student of students) {
            await this.save(student);
        }
        return students;
    }
    async updateGradeAndStatus(id, gradeLevel, status) {
        await this.db.query('UPDATE students SET grade_level = $1, status = $2 WHERE id = $3', [gradeLevel, status, id]);
        const mem = this.db.getMemoryStore().students.find(s => s.id === id);
        if (mem) {
            mem.grade_level = gradeLevel;
            mem.status = status;
        }
    }
    mapRow(row) {
        return new Student_1.Student(row.id, row.student_code, row.full_name, row.full_name_amharic, parseInt(row.grade_level, 10), row.gender, row.section, row.status, new Date(row.created_at));
    }
};
exports.PostgresStudentRepo = PostgresStudentRepo;
exports.PostgresStudentRepo = PostgresStudentRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresStudentRepo);
//# sourceMappingURL=PostgresStudentRepo.js.map