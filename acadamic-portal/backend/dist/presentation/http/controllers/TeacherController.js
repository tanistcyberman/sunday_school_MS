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
exports.TeacherController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const JwtAuthGuard_1 = require("../../../infrastructure/security/JwtAuthGuard");
const RolesGuard_1 = require("../../../infrastructure/security/RolesGuard");
const RolesDecorator_1 = require("../../../infrastructure/security/RolesDecorator");
const CourseOwnershipGuard_1 = require("../guards/CourseOwnershipGuard");
const CalculateFinalGradeUseCase_1 = require("../../../application/use-cases/CalculateFinalGradeUseCase");
const MaterialUseCase_1 = require("../../../application/use-cases/MaterialUseCase");
const PostgresGradeRepo_1 = require("../../../infrastructure/database/postgres/PostgresGradeRepo");
const PostgresCourseRepo_1 = require("../../../infrastructure/database/postgres/PostgresCourseRepo");
const PostgresStudentRepo_1 = require("../../../infrastructure/database/postgres/PostgresStudentRepo");
let TeacherController = class TeacherController {
    constructor(calculateGradeUseCase, materialUseCase, gradeRepo, courseRepo, studentRepo) {
        this.calculateGradeUseCase = calculateGradeUseCase;
        this.materialUseCase = materialUseCase;
        this.gradeRepo = gradeRepo;
        this.courseRepo = courseRepo;
        this.studentRepo = studentRepo;
    }
    async getMyCourses(req) {
        const teacherId = req.user.sub || req.user.id;
        if (req.user.role === 'ADMIN') {
            return await this.courseRepo.findAll();
        }
        return await this.courseRepo.findByTeacherId(teacherId);
    }
    async getCourses(grade) {
        if (grade) {
            return await this.courseRepo.findByGrade(parseInt(grade, 10));
        }
        return await this.courseRepo.findAll();
    }
    async getCourseStudents(courseId, year) {
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const gradeLevel = course.gradeLevel;
        const academicYear = year || '2026 E.C.';
        const students = await this.studentRepo.findByGrade(gradeLevel);
        const existingGrades = await this.gradeRepo.findByCourseAndGrade(courseId, gradeLevel);
        return students.map(student => {
            const g = existingGrades.find(record => record.studentId === student.id && record.academicYear === academicYear);
            return {
                studentId: student.id,
                studentCode: student.studentCode,
                fullName: student.fullName,
                fullNameAmharic: student.fullNameAmharic,
                gradeLevel: student.gradeLevel,
                courseId,
                academicYear,
                midMark: g?.midMark ? g.midMark.getValue() : null,
                finalMark: g?.finalMark ? g.finalMark.getValue() : null,
                totalScore: g?.totalScore ? g.totalScore.getValue() : null,
                passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
            };
        });
    }
    async getGradebook(courseId, grade, year) {
        if (!courseId || !grade) {
            throw new common_1.BadRequestException('courseId and grade are required parameters');
        }
        const gradeLevel = parseInt(grade, 10);
        const academicYear = year || '2026 E.C.';
        const students = await this.studentRepo.findByGrade(gradeLevel);
        const existingGrades = await this.gradeRepo.findByCourseAndGrade(courseId, gradeLevel);
        const rows = students.map(student => {
            const g = existingGrades.find(record => record.studentId === student.id && record.academicYear === academicYear);
            return {
                studentId: student.id,
                studentCode: student.studentCode,
                fullName: student.fullName,
                fullNameAmharic: student.fullNameAmharic,
                gradeLevel: student.gradeLevel,
                courseId,
                academicYear,
                midMark: g?.midMark ? g.midMark.getValue() : null,
                finalMark: g?.finalMark ? g.finalMark.getValue() : null,
                totalScore: g?.totalScore ? g.totalScore.getValue() : null,
                passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
            };
        });
        return rows;
    }
    async saveCourseGrade(courseId, dto, req) {
        return await this.calculateGradeUseCase.saveOrUpdateGrade({
            ...dto,
            courseId,
            requesterTeacherId: req.user.sub || req.user.id,
            requesterRole: req.user.role
        });
    }
    async updateGrade(dto, req) {
        return await this.calculateGradeUseCase.saveOrUpdateGrade({
            ...dto,
            requesterTeacherId: req.user.sub || req.user.id,
            requesterRole: req.user.role
        });
    }
    async batchUpdateGrades(grades, req) {
        if (!grades || !Array.isArray(grades)) {
            throw new common_1.BadRequestException('Grades array is required');
        }
        const teacherId = req.user.sub || req.user.id;
        const enriched = grades.map(g => ({
            ...g,
            requesterTeacherId: teacherId,
            requesterRole: req.user.role
        }));
        await this.calculateGradeUseCase.batchSaveGrades(enriched);
        return { success: true, count: grades.length };
    }
    async getMaterials(grade, courseId, req) {
        const teacherId = req?.user?.sub || req?.user?.id;
        if (courseId) {
            return await this.materialUseCase.getAllMaterials().then(m => m.filter(x => x.courseId === courseId));
        }
        if (req?.user?.role === 'TEACHER' && teacherId) {
            return await this.materialUseCase.getMaterialsByTeacher(teacherId);
        }
        if (grade) {
            return await this.materialUseCase.getMaterialsByGrade(parseInt(grade, 10));
        }
        return await this.materialUseCase.getAllMaterials();
    }
    async uploadCourseMaterial(courseId, file, title, description, req) {
        if (!file) {
            throw new common_1.BadRequestException('Material file is required');
        }
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        return await this.materialUseCase.uploadMaterial({
            courseId,
            gradeLevel: course.gradeLevel,
            title: title || file.originalname,
            titleAmharic: title || file.originalname,
            description: description || '',
            uploadedByTeacherId: req.user.sub || req.user.id,
            requesterRole: req.user.role,
            file
        });
    }
    async uploadMaterial(file, courseId, gradeLevel, title, titleAmharic, description, req) {
        if (!file) {
            throw new common_1.BadRequestException('Material file is required');
        }
        if (!courseId || !title) {
            throw new common_1.BadRequestException('courseId and title are required');
        }
        const course = await this.courseRepo.findById(courseId);
        return await this.materialUseCase.uploadMaterial({
            courseId,
            gradeLevel: course ? course.gradeLevel : parseInt(gradeLevel || '4', 10),
            title: titleAmharic || title,
            titleAmharic: titleAmharic || title,
            description: description || '',
            uploadedByTeacherId: req.user.sub || req.user.id,
            requesterRole: req.user.role,
            file
        });
    }
    async deleteMaterial(id, req) {
        await this.materialUseCase.deleteMaterial(id, req.user.sub || req.user.id, req.user.role);
        return { success: true, id };
    }
};
exports.TeacherController = TeacherController;
__decorate([
    (0, common_1.Get)('my-courses'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getMyCourses", null);
__decorate([
    (0, common_1.Get)('courses'),
    __param(0, (0, common_1.Query)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/students'),
    (0, common_1.UseGuards)(CourseOwnershipGuard_1.CourseOwnershipGuard),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getCourseStudents", null);
__decorate([
    (0, common_1.Get)('gradebook'),
    __param(0, (0, common_1.Query)('courseId')),
    __param(1, (0, common_1.Query)('grade')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getGradebook", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/grades'),
    (0, common_1.UseGuards)(CourseOwnershipGuard_1.CourseOwnershipGuard),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "saveCourseGrade", null);
__decorate([
    (0, common_1.Post)('gradebook/update'),
    (0, common_1.UseGuards)(CourseOwnershipGuard_1.CourseOwnershipGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateGrade", null);
__decorate([
    (0, common_1.Post)('gradebook/batch'),
    __param(0, (0, common_1.Body)('grades')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "batchUpdateGrades", null);
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Query)('grade')),
    __param(1, (0, common_1.Query)('courseId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/materials'),
    (0, common_1.UseGuards)(CourseOwnershipGuard_1.CourseOwnershipGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 }
    })),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('title')),
    __param(3, (0, common_1.Body)('description')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "uploadCourseMaterial", null);
__decorate([
    (0, common_1.Post)('materials/upload'),
    (0, common_1.UseGuards)(CourseOwnershipGuard_1.CourseOwnershipGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('courseId')),
    __param(2, (0, common_1.Body)('gradeLevel')),
    __param(3, (0, common_1.Body)('title')),
    __param(4, (0, common_1.Body)('titleAmharic')),
    __param(5, (0, common_1.Body)('description')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "uploadMaterial", null);
__decorate([
    (0, common_1.Delete)('materials/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "deleteMaterial", null);
exports.TeacherController = TeacherController = __decorate([
    (0, common_1.Controller)('api/teacher'),
    (0, common_1.UseGuards)(JwtAuthGuard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    (0, RolesDecorator_1.Roles)('TEACHER', 'ADMIN'),
    __metadata("design:paramtypes", [CalculateFinalGradeUseCase_1.CalculateFinalGradeUseCase,
        MaterialUseCase_1.MaterialUseCase,
        PostgresGradeRepo_1.PostgresGradeRepo,
        PostgresCourseRepo_1.PostgresCourseRepo,
        PostgresStudentRepo_1.PostgresStudentRepo])
], TeacherController);
//# sourceMappingURL=TeacherController.js.map