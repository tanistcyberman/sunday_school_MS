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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const JwtAuthGuard_1 = require("../../../infrastructure/security/JwtAuthGuard");
const RolesGuard_1 = require("../../../infrastructure/security/RolesGuard");
const RolesDecorator_1 = require("../../../infrastructure/security/RolesDecorator");
const MasterScheduleUseCase_1 = require("../../../application/use-cases/MasterScheduleUseCase");
const ImportStudentsUseCase_1 = require("../../../application/use-cases/ImportStudentsUseCase");
const ExportGradesUseCase_1 = require("../../../application/use-cases/ExportGradesUseCase");
const PromoteStudentsUseCase_1 = require("../../../application/use-cases/PromoteStudentsUseCase");
const PostgresCourseRepo_1 = require("../../../infrastructure/database/postgres/PostgresCourseRepo");
const PostgresStudentRepo_1 = require("../../../infrastructure/database/postgres/PostgresStudentRepo");
const PostgresUserRepo_1 = require("../../../infrastructure/database/postgres/PostgresUserRepo");
let AdminController = class AdminController {
    constructor(masterScheduleUseCase, importStudentsUseCase, exportGradesUseCase, promoteStudentsUseCase, courseRepo, studentRepo, userRepo) {
        this.masterScheduleUseCase = masterScheduleUseCase;
        this.importStudentsUseCase = importStudentsUseCase;
        this.exportGradesUseCase = exportGradesUseCase;
        this.promoteStudentsUseCase = promoteStudentsUseCase;
        this.courseRepo = courseRepo;
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
    }
    async getSchedule(grade) {
        if (grade) {
            return await this.masterScheduleUseCase.getSchedulesByGrade(parseInt(grade, 10));
        }
        return await this.masterScheduleUseCase.getAllSchedules();
    }
    async saveSchedule(dto) {
        return await this.masterScheduleUseCase.saveSchedule(dto);
    }
    async getCourses(grade) {
        if (grade) {
            return await this.courseRepo.findByGrade(parseInt(grade, 10));
        }
        return await this.courseRepo.findAll();
    }
    async getTeachers() {
        const teachers = await this.userRepo.findAllTeachers();
        return teachers.map(t => ({
            id: t.id,
            username: t.username,
            fullName: t.fullName,
            fullNameAmharic: t.fullNameAmharic,
            email: t.email
        }));
    }
    async assignTeacher(courseId, teacherId) {
        if (!courseId) {
            throw new common_1.BadRequestException('Course ID is required');
        }
        await this.courseRepo.assignTeacherToCourse(courseId, teacherId || null);
        const updated = await this.courseRepo.findById(courseId);
        return {
            success: true,
            courseId,
            assignedTeacherId: teacherId || null,
            course: updated
        };
    }
    async getStudents(grade) {
        if (grade) {
            return await this.studentRepo.findByGrade(parseInt(grade, 10));
        }
        return await this.studentRepo.findAll();
    }
    async previewCsv(file, csvText) {
        let content = csvText;
        if (file && file.buffer) {
            content = file.buffer.toString('utf-8');
        }
        if (!content) {
            throw new common_1.BadRequestException('Please provide a valid CSV file or content');
        }
        return await this.importStudentsUseCase.previewCsv(content);
    }
    async commitImport(rows) {
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            throw new common_1.BadRequestException('No valid rows provided to commit');
        }
        const saved = await this.importStudentsUseCase.commitImport(rows);
        return {
            success: true,
            importedCount: saved.length,
            students: saved
        };
    }
    async getConsolidatedGrades(grade, year) {
        const gradeLevel = grade ? parseInt(grade, 10) : undefined;
        return await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
    }
    async exportCsv(res, grade, year) {
        const gradeLevel = grade ? parseInt(grade, 10) : undefined;
        const data = await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
        const buffer = this.exportGradesUseCase.generateCsv(data);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="student_grades_${grade || 'all'}.csv"`);
        res.send(buffer);
    }
    async exportExcel(res, grade, year) {
        const gradeLevel = grade ? parseInt(grade, 10) : undefined;
        const data = await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
        const buffer = this.exportGradesUseCase.generateExcel(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="student_grades_${grade || 'all'}.xlsx"`);
        res.send(buffer);
    }
    async getPromotionCandidates(grade) {
        const gradeLevel = grade ? parseInt(grade, 10) : undefined;
        return await this.promoteStudentsUseCase.evaluatePromotionCandidates(gradeLevel);
    }
    async executePromotion(grade) {
        return await this.promoteStudentsUseCase.executeBulkPromotion(grade);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('schedule'),
    __param(0, (0, common_1.Query)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "saveSchedule", null);
__decorate([
    (0, common_1.Get)('courses'),
    __param(0, (0, common_1.Query)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Patch)('courses/:courseId/assign-teacher'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignTeacher", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Query)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Post)('students/preview-csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('csvText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "previewCsv", null);
__decorate([
    (0, common_1.Post)('students/import'),
    __param(0, (0, common_1.Body)('rows')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "commitImport", null);
__decorate([
    (0, common_1.Get)('grades/consolidated'),
    __param(0, (0, common_1.Query)('grade')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getConsolidatedGrades", null);
__decorate([
    (0, common_1.Get)('grades/export/csv'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('grade')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('grades/export/excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('grade')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('promotion/candidates'),
    __param(0, (0, common_1.Query)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPromotionCandidates", null);
__decorate([
    (0, common_1.Post)('promotion/execute'),
    __param(0, (0, common_1.Body)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "executePromotion", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(JwtAuthGuard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    (0, RolesDecorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [MasterScheduleUseCase_1.MasterScheduleUseCase,
        ImportStudentsUseCase_1.ImportStudentsUseCase,
        ExportGradesUseCase_1.ExportGradesUseCase,
        PromoteStudentsUseCase_1.PromoteStudentsUseCase,
        PostgresCourseRepo_1.PostgresCourseRepo,
        PostgresStudentRepo_1.PostgresStudentRepo,
        PostgresUserRepo_1.PostgresUserRepo])
], AdminController);
//# sourceMappingURL=AdminController.js.map