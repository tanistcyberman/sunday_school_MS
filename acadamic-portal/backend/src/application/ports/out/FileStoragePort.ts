export interface StoredFileResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface FileStoragePort {
  saveFile(file: Express.Multer.File, subfolder?: string): Promise<StoredFileResult>;
  deleteFile(filePath: string): Promise<void>;
  getAbsolutePath(filePath: string): string;
}
