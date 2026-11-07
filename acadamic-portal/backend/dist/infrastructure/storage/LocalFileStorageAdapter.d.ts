import { FileStoragePort, StoredFileResult } from '../../application/ports/out/FileStoragePort';
export declare class LocalFileStorageAdapter implements FileStoragePort {
    private readonly baseUploadDir;
    constructor();
    saveFile(file: Express.Multer.File, subfolder?: string): Promise<StoredFileResult>;
    deleteFile(filePath: string): Promise<void>;
    getAbsolutePath(filePath: string): string;
}
