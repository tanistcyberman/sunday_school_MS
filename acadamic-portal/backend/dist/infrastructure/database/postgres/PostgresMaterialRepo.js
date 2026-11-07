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
exports.PostgresMaterialRepo = void 0;
const common_1 = require("@nestjs/common");
const Material_1 = require("../../../domain/entities/Material");
const DatabaseService_1 = require("./DatabaseService");
let PostgresMaterialRepo = class PostgresMaterialRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!this.db.getIsConnected()) {
            const mem = this.db.getMemoryStore().materials.find(m => m.id === id);
            return mem ? this.mapRow(mem) : null;
        }
        const res = await this.db.query(`SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.id = $1`, [id]);
        return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
    }
    async findByGrade(gradeLevel) {
        if (!this.db.getIsConnected()) {
            return this.db.getMemoryStore().materials
                .filter(m => m.grade_level === gradeLevel)
                .map(m => this.mapRow(m));
        }
        const res = await this.db.query(`SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.grade_level = $1
       ORDER BY m.created_at DESC`, [gradeLevel]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().materials
                .filter(m => m.grade_level === gradeLevel)
                .map(m => this.mapRow(m));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findByCourse(courseId) {
        const res = await this.db.query(`SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.course_id = $1
       ORDER BY m.created_at DESC`, [courseId]);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().materials
                .filter(m => m.course_id === courseId)
                .map(m => this.mapRow(m));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async findAll() {
        const res = await this.db.query(`SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       ORDER BY m.grade_level ASC, m.created_at DESC`);
        if (res.rows.length === 0 && !this.db.getIsConnected()) {
            return this.db.getMemoryStore().materials.map(m => this.mapRow(m));
        }
        return res.rows.map(r => this.mapRow(r));
    }
    async save(material) {
        const query = `
      INSERT INTO materials (id, course_id, grade_level, title, title_amharic, description, file_name, file_path, file_size, mime_type, uploaded_by_teacher_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        title_amharic = EXCLUDED.title_amharic,
        description = EXCLUDED.description;
    `;
        await this.db.query(query, [
            material.id,
            material.courseId,
            material.gradeLevel,
            material.title,
            material.titleAmharic,
            material.description,
            material.fileName,
            material.filePath,
            material.fileSize,
            material.mimeType,
            material.uploadedByTeacherId,
            material.createdAt
        ]);
        const memList = this.db.getMemoryStore().materials;
        const idx = memList.findIndex(m => m.id === material.id);
        const row = {
            id: material.id,
            course_id: material.courseId,
            grade_level: material.gradeLevel,
            title: material.title,
            title_amharic: material.titleAmharic,
            description: material.description,
            file_name: material.fileName,
            file_path: material.filePath,
            file_size: material.fileSize,
            mime_type: material.mimeType,
            uploaded_by_teacher_id: material.uploadedByTeacherId,
            course_name: material.courseName,
            course_name_amharic: material.courseNameAmharic,
            created_at: material.createdAt
        };
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return material;
    }
    async delete(id) {
        await this.db.query('DELETE FROM materials WHERE id = $1', [id]);
        const memList = this.db.getMemoryStore().materials;
        const idx = memList.findIndex(m => m.id === id);
        if (idx >= 0)
            memList.splice(idx, 1);
    }
    mapRow(row) {
        return new Material_1.Material(row.id, row.course_id, parseInt(row.grade_level, 10), row.title, row.title_amharic, row.description || '', row.file_name, row.file_path, parseInt(row.file_size, 10), row.mime_type, row.uploaded_by_teacher_id, row.course_name, row.course_name_amharic, new Date(row.created_at));
    }
};
exports.PostgresMaterialRepo = PostgresMaterialRepo;
exports.PostgresMaterialRepo = PostgresMaterialRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresMaterialRepo);
//# sourceMappingURL=PostgresMaterialRepo.js.map