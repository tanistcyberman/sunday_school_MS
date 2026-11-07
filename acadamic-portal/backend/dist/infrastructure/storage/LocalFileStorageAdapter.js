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
exports.LocalFileStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const configuration_1 = require("../config/configuration");
let LocalFileStorageAdapter = class LocalFileStorageAdapter {
    constructor() {
        this.baseUploadDir = configuration_1.configuration.uploadDir;
        if (!fs.existsSync(this.baseUploadDir)) {
            fs.mkdirSync(this.baseUploadDir, { recursive: true });
        }
    }
    async saveFile(file, subfolder = 'general') {
        const targetDir = path.join(this.baseUploadDir, subfolder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const ext = path.extname(file.originalname);
        const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\u1200-\u137F-]/g, '_');
        const uniqueFileName = `${Date.now()}_${sanitizedBase}${ext}`;
        const destinationPath = path.join(targetDir, uniqueFileName);
        if (file.buffer) {
            await fs.promises.writeFile(destinationPath, file.buffer);
        }
        else if (file.path) {
            await fs.promises.copyFile(file.path, destinationPath);
        }
        const relativePath = path.join(subfolder, uniqueFileName);
        return {
            filePath: relativePath,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype
        };
    }
    async deleteFile(filePath) {
        const fullPath = path.join(this.baseUploadDir, filePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }
    getAbsolutePath(filePath) {
        return path.join(this.baseUploadDir, filePath);
    }
};
exports.LocalFileStorageAdapter = LocalFileStorageAdapter;
exports.LocalFileStorageAdapter = LocalFileStorageAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalFileStorageAdapter);
//# sourceMappingURL=LocalFileStorageAdapter.js.map