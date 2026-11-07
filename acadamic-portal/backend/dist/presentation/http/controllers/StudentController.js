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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const JwtAuthGuard_1 = require("../../../infrastructure/security/JwtAuthGuard");
const RolesGuard_1 = require("../../../infrastructure/security/RolesGuard");
const RolesDecorator_1 = require("../../../infrastructure/security/RolesDecorator");
const PostgresStudentRepo_1 = require("../../../infrastructure/database/postgres/PostgresStudentRepo");
const PostgresGradeRepo_1 = require("../../../infrastructure/database/postgres/PostgresGradeRepo");
const PostgresCourseRepo_1 = require("../../../infrastructure/database/postgres/PostgresCourseRepo");
const PostgresScheduleRepo_1 = require("../../../infrastructure/database/postgres/PostgresScheduleRepo");
const MaterialUseCase_1 = require("../../../application/use-cases/MaterialUseCase");
const LocalFileStorageAdapter_1 = require("../../../infrastructure/storage/LocalFileStorageAdapter");
const fs = require("fs");
let StudentController = class StudentController {
    constructor(studentRepo, gradeRepo, courseRepo, scheduleRepo, materialUseCase, fileStorage) {
        this.studentRepo = studentRepo;
        this.gradeRepo = gradeRepo;
        this.courseRepo = courseRepo;
        this.scheduleRepo = scheduleRepo;
        this.materialUseCase = materialUseCase;
        this.fileStorage = fileStorage;
    }
    async resolveStudentId(req) {
        if (req.user.role === 'STUDENT') {
            if (!req.user.studentId) {
                throw new common_1.UnauthorizedException('Student profile not mapped to account');
            }
            return req.user.studentId;
        }
        if (req.query.studentId) {
            return req.query.studentId;
        }
        const all = await this.studentRepo.findAll();
        if (all.length > 0)
            return all[0].id;
        throw new common_1.NotFoundException('No students found');
    }
    async getDashboard(req) {
        const studentId = await this.resolveStudentId(req);
        const student = await this.studentRepo.findById(studentId);
        if (!student) {
            throw new common_1.NotFoundException('Student record not found');
        }
        const courses = await this.courseRepo.findByGrade(student.gradeLevel);
        const schedules = await this.scheduleRepo.findByGrade(student.gradeLevel);
        const grades = await this.gradeRepo.findByStudentId(studentId);
        const materials = await this.materialUseCase.getMaterialsByGrade(student.gradeLevel);
        const now = new Date();
        let minStartDate = null;
        let maxFinalDate = null;
        let midExamDate = null;
        schedules.forEach(s => {
            if (!minStartDate || s.startDate < minStartDate)
                minStartDate = s.startDate;
            if (!maxFinalDate || s.finalExamDate > maxFinalDate)
                maxFinalDate = s.finalExamDate;
            if (!midExamDate)
                midExamDate = s.midExamDate;
        });
        let progressPercentage = 0;
        if (minStartDate && maxFinalDate) {
            const totalDuration = maxFinalDate.getTime() - minStartDate.getTime();
            const elapsed = Math.max(0, now.getTime() - minStartDate.getTime());
            progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        }
        const completedGrades = grades.filter(g => g.totalScore !== null);
        const averageScore = completedGrades.length > 0
            ? Math.round((completedGrades.reduce((sum, g) => sum + g.totalScore.getValue(), 0) / completedGrades.length) * 100) / 100
            : null;
        return {
            student,
            courseCount: courses.length,
            materialsCount: materials.length,
            averageScore,
            timeline: {
                startDate: minStartDate || new Date('2026-09-15'),
                midExamDate: midExamDate || new Date('2026-11-20'),
                finalExamDate: maxFinalDate || new Date('2027-01-15'),
                progressPercentage,
                currentPhase: now < (midExamDate || new Date('2026-11-20')) ? 'PRE_MID' : (now < (maxFinalDate || new Date('2027-01-15')) ? 'MID_TO_FINAL' : 'COMPLETED')
            }
        };
    }
    async getTimeline(req) {
        const studentId = await this.resolveStudentId(req);
        const student = await this.studentRepo.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student record not found');
        const schedules = await this.scheduleRepo.findByGrade(student.gradeLevel);
        return schedules;
    }
    async getMaterials(req) {
        const studentId = await this.resolveStudentId(req);
        const student = await this.studentRepo.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student record not found');
        const materials = await this.materialUseCase.getMaterialsByGrade(student.gradeLevel);
        const courses = await this.courseRepo.findByGrade(student.gradeLevel);
        const courseGroups = courses.map(course => ({
            course,
            materials: materials.filter(m => m.courseId === course.id)
        }));
        return {
            gradeLevel: student.gradeLevel,
            courses: courseGroups
        };
    }
    async getReportCard(req, year) {
        const studentId = await this.resolveStudentId(req);
        const student = await this.studentRepo.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student record not found');
        const courses = await this.courseRepo.findByGrade(student.gradeLevel);
        const grades = await this.gradeRepo.findByStudentId(studentId);
        const academicYear = year || '2026 E.C.';
        const reportEntries = courses.map(course => {
            const g = grades.find(record => record.courseId === course.id && record.academicYear === academicYear);
            return {
                courseId: course.id,
                courseCode: course.code,
                courseName: course.name,
                courseNameAmharic: course.nameAmharic,
                midMark: g?.midMark ? g.midMark.getValue() : null,
                finalMark: g?.finalMark ? g.finalMark.getValue() : null,
                totalScore: g?.totalScore ? g.totalScore.getValue() : null,
                passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
            };
        });
        const evaluatedGrades = reportEntries.filter(r => r.totalScore !== null);
        const averageScore = evaluatedGrades.length > 0
            ? Math.round((evaluatedGrades.reduce((sum, r) => sum + r.totalScore, 0) / evaluatedGrades.length) * 100) / 100
            : null;
        const overallStatus = averageScore !== null ? (averageScore >= 50.0 ? 'PASSED' : 'FAILED') : 'PENDING';
        return {
            student,
            academicYear,
            entries: reportEntries,
            averageScore,
            overallStatus
        };
    }
    async downloadMaterial(id, res) {
        const material = await this.materialUseCase.getMaterialById(id);
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        const fullPath = this.fileStorage.getAbsolutePath(material.filePath);
        if (!fs.existsSync(fullPath)) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(material.fileName)}.txt"`);
            res.send(`Continuous Education Monitoring Dept\nMaterial: ${material.title}\nCourse: ${material.courseNameAmharic || ''}\n\nDescription: ${material.description}`);
            return;
        }
        res.download(fullPath, material.fileName);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('timeline'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('report-card'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getReportCard", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "downloadMaterial", null);
exports.StudentController = StudentController = __decorate([
    (0, common_1.Controller)('api/student'),
    (0, common_1.UseGuards)(JwtAuthGuard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    (0, RolesDecorator_1.Roles)('STUDENT', 'TEACHER', 'ADMIN'),
    __metadata("design:paramtypes", [PostgresStudentRepo_1.PostgresStudentRepo,
        PostgresGradeRepo_1.PostgresGradeRepo,
        PostgresCourseRepo_1.PostgresCourseRepo,
        PostgresScheduleRepo_1.PostgresScheduleRepo,
        MaterialUseCase_1.MaterialUseCase,
        LocalFileStorageAdapter_1.LocalFileStorageAdapter])
], StudentController);
//# sourceMappingURL=StudentController.js.map