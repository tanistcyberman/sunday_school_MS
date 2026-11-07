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
exports.CourseOwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const PostgresCourseRepo_1 = require("../../../infrastructure/database/postgres/PostgresCourseRepo");
let CourseOwnershipGuard = class CourseOwnershipGuard {
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Unauthenticated request');
        }
        if (user.role === 'ADMIN') {
            return true;
        }
        if (user.role !== 'TEACHER') {
            throw new common_1.ForbiddenException('Only teachers and administrators can perform this action');
        }
        const courseId = request.params?.courseId || request.body?.courseId || request.query?.courseId;
        if (!courseId) {
            throw new common_1.BadRequestException('Course ID is required to verify ownership authorization');
        }
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const userId = user.sub || user.id;
        if (!course.isOwnedBy(userId)) {
            throw new common_1.ForbiddenException('ይህንን ትምህርት ለማስተካከል ፈቃድ የለዎትም (You are not authorized to modify this course)');
        }
        request.course = course;
        return true;
    }
};
exports.CourseOwnershipGuard = CourseOwnershipGuard;
exports.CourseOwnershipGuard = CourseOwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [PostgresCourseRepo_1.PostgresCourseRepo])
], CourseOwnershipGuard);
//# sourceMappingURL=CourseOwnershipGuard.js.map