import { Injectable } from '@nestjs/common';
import { FileStoragePort, StoredFileResult } from '../../application/ports/out/FileStoragePort';
import * as fs from 'fs';
import * as path from 'path';
import { configuration } from '../config/configuration';

@Injectable()
export class LocalFileStorageAdapter implements FileStoragePort {
  private readonly baseUploadDir: string;

  constructor() {
    this.baseUploadDir = configuration.uploadDir;
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  public async saveFile(file: Express.Multer.File, subfolder: string = 'general'): Promise<StoredFileResult> {
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
    } else if (file.path) {
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

  public async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseUploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  public getAbsolutePath(filePath: string): string {
    return path.join(this.baseUploadDir, filePath);
  }
}
