"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = void 0;
class Material {
    constructor(id, courseId, gradeLevel, title, titleAmharic, description, fileName, filePath, fileSize, mimeType, uploadedByTeacherId, courseName, courseNameAmharic, createdAt = new Date()) {
        this.id = id;
        this.courseId = courseId;
        this.gradeLevel = gradeLevel;
        this.title = title;
        this.titleAmharic = titleAmharic;
        this.description = description;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.uploadedByTeacherId = uploadedByTeacherId;
        this.courseName = courseName;
        this.courseNameAmharic = courseNameAmharic;
        this.createdAt = createdAt;
    }
    isWithinSizeLimit() {
        const TEN_MB = 10 * 1024 * 1024;
        return this.fileSize <= TEN_MB;
    }
}
exports.Material = Material;
//# sourceMappingURL=Material.js.map