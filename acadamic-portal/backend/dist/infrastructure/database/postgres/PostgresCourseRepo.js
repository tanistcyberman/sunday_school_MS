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
exports.PostgresCourseRepo = void 0;
const common_1 = require("@nestjs/common");
const Course_1 = require("../../../domain/entities/Course");
const DatabaseService_1 = require("./DatabaseService");
let PostgresCourseRepo = class PostgresCourseRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().courses.find(c => c.id === id);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query('SELECT * FROM courses WHERE id = $1', [id]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByGrade(gradeLevel) {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().courses
                .filter(c => c.grade_level === gradeLevel)
                .map(c => this.mapRow(c));
        }
        const res = await this.db.query('SELECT * FROM courses WHERE grade_level = $1 ORDER BY code ASC', [gradeLevel]);
        return res.rows.map(r => this.mapRow(r));
    }
    async findByTeacherId(teacherId) {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().courses
                .filter(c => c.teacher_id === teacherId)
                .map(c => this.mapRow(c));
        }
        const res = await this.db.query('SELECT * FROM courses WHERE teacher_id = $1 ORDER BY grade_level ASC, code ASC', [teacherId]);
        return res.rows.map(r => this.mapRow(r));
    }
    async findAll() {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().courses.map(c => this.mapRow(c));
        }
        const res = await this.db.query('SELECT * FROM courses ORDER BY grade_level ASC, code ASC');
        return res.rows.map(r => this.mapRow(r));
    }
    async assignTeacherToCourse(courseId, teacherId) {
        const memList = this.db.getMemoryStore().courses;
        const course = memList.find(c => c.id === courseId);
        if (course) {
            course.teacher_id = teacherId;
        }
        if (this.db.getIsConnected()) {
            await this.db.query('UPDATE courses SET teacher_id = $1 WHERE id = $2', [teacherId, courseId]);
        }
    }
    async save(course) {
        const query = `
      INSERT INTO courses (id, code, name, name_amharic, grade_level, description, description_amharic, teacher_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_amharic = EXCLUDED.name_amharic,
        description = EXCLUDED.description,
        description_amharic = EXCLUDED.description_amharic,
        teacher_id = EXCLUDED.teacher_id;
    `;
        await this.db.query(query, [
            course.id,
            course.code,
            course.name,
            course.nameAmharic,
            course.gradeLevel,
            course.description,
            course.descriptionAmharic,
            course.assignedTeacherId,
            course.createdAt
        ]);
        const memList = this.db.getMemoryStore().courses;
        const idx = memList.findIndex(c => c.id === course.id);
        const row = {
            id: course.id,
            code: course.code,
            name: course.name,
            name_amharic: course.nameAmharic,
            grade_level: course.gradeLevel,
            description: course.description,
            description_amharic: course.descriptionAmharic,
            teacher_id: course.assignedTeacherId,
            created_at: course.createdAt
        };
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return course;
    }
    mapRow(row) {
        return new Course_1.Course(row.id, row.code, row.name, row.name_amharic, parseInt(row.grade_level, 10), row.description || '', row.description_amharic || '', row.teacher_id || null, new Date(row.created_at));
    }
};
exports.PostgresCourseRepo = PostgresCourseRepo;
exports.PostgresCourseRepo = PostgresCourseRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresCourseRepo);
//# sourceMappingURL=PostgresCourseRepo.js.map