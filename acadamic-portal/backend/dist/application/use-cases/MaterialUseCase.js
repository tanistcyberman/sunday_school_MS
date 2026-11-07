"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialUseCase = void 0;
const Material_1 = require("../../domain/entities/Material");
const UnauthorizedCourseAccessException_1 = require("../../domain/exceptions/UnauthorizedCourseAccessException");
class MaterialUseCase {
    constructor(materialRepo, courseRepo, fileStorage) {
        this.materialRepo = materialRepo;
        this.courseRepo = courseRepo;
        this.fileStorage = fileStorage;
    }
    async uploadMaterial(dto) {
        const TEN_MB = 10 * 1024 * 1024;
        if (dto.file.size > TEN_MB) {
            throw new Error('File exceeds the 10MB limit per course specification');
        }
        const course = await this.courseRepo.findById(dto.courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        if (dto.requesterRole !== 'ADMIN' && !course.isOwnedBy(dto.uploadedByTeacherId)) {
            throw new UnauthorizedCourseAccessException_1.UnauthorizedCourseAccessException();
        }
        const storedFile = await this.fileStorage.saveFile(dto.file, 'course-materials');
        const material = new Material_1.Material(`mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, dto.courseId, dto.gradeLevel, dto.title, dto.titleAmharic || dto.title, dto.description || '', storedFile.fileName, storedFile.filePath, storedFile.fileSize, storedFile.mimeType, dto.uploadedByTeacherId, course?.name, course?.nameAmharic);
        return await this.materialRepo.save(material);
    }
    async getMaterialsByGrade(gradeLevel) {
        const materials = await this.materialRepo.findByGrade(gradeLevel);
        const courses = await this.courseRepo.findByGrade(gradeLevel);
        const courseMap = new Map(courses.map(c => [c.id, c]));
        return materials.map(m => {
            const course = courseMap.get(m.courseId);
            return new Material_1.Material(m.id, m.courseId, m.gradeLevel, m.title, m.titleAmharic, m.description, m.fileName, m.filePath, m.fileSize, m.mimeType, m.uploadedByTeacherId, course?.name || m.courseName, course?.nameAmharic || m.courseNameAmharic, m.createdAt);
        });
    }
    async getMaterialsByTeacher(teacherId) {
        const teacherCourses = await this.courseRepo.findByTeacherId(teacherId);
        const courseIds = new Set(teacherCourses.map(c => c.id));
        const allMaterials = await this.materialRepo.findAll();
        const courseMap = new Map(teacherCourses.map(c => [c.id, c]));
        return allMaterials
            .filter(m => courseIds.has(m.courseId))
            .map(m => {
            const course = courseMap.get(m.courseId);
            return new Material_1.Material(m.id, m.courseId, m.gradeLevel, m.title, m.titleAmharic, m.description, m.fileName, m.filePath, m.fileSize, m.mimeType, m.uploadedByTeacherId, course?.name || m.courseName, course?.nameAmharic || m.courseNameAmharic, m.createdAt);
        });
    }
    async getAllMaterials() {
        const materials = await this.materialRepo.findAll();
        const courses = await this.courseRepo.findAll();
        const courseMap = new Map(courses.map(c => [c.id, c]));
        return materials.map(m => {
            const course = courseMap.get(m.courseId);
            return new Material_1.Material(m.id, m.courseId, m.gradeLevel, m.title, m.titleAmharic, m.description, m.fileName, m.filePath, m.fileSize, m.mimeType, m.uploadedByTeacherId, course?.name || m.courseName, course?.nameAmharic || m.courseNameAmharic, m.createdAt);
        });
    }
    async getMaterialById(id) {
        return await this.materialRepo.findById(id);
    }
    async deleteMaterial(id, requesterId, requesterRole) {
        const material = await this.materialRepo.findById(id);
        if (material) {
            if (requesterRole !== 'ADMIN' && requesterId) {
                const course = await this.courseRepo.findById(material.courseId);
                if (!course || !course.isOwnedBy(requesterId)) {
                    throw new UnauthorizedCourseAccessException_1.UnauthorizedCourseAccessException();
                }
            }
            await this.fileStorage.deleteFile(material.filePath);
            await this.materialRepo.delete(id);
        }
    }
}
exports.MaterialUseCase = MaterialUseCase;
//# sourceMappingURL=MaterialUseCase.js.map