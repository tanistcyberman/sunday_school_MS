import { MaterialRepositoryPort } from '../ports/out/MaterialRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
import { FileStoragePort } from '../ports/out/FileStoragePort';
import { Material } from '../../domain/entities/Material';
export interface UploadMaterialDto {
    courseId: string;
    gradeLevel: number;
    title: string;
    titleAmharic: string;
    description: string;
    uploadedByTeacherId: string;
    requesterRole?: string;
    file: Express.Multer.File;
}
export declare class MaterialUseCase {
    private readonly materialRepo;
    private readonly courseRepo;
    private readonly fileStorage;
    constructor(materialRepo: MaterialRepositoryPort, courseRepo: CourseRepositoryPort, fileStorage: FileStoragePort);
    uploadMaterial(dto: UploadMaterialDto): Promise<Material>;
    getMaterialsByGrade(gradeLevel: number): Promise<Material[]>;
    getMaterialsByTeacher(teacherId: string): Promise<Material[]>;
    getAllMaterials(): Promise<Material[]>;
    getMaterialById(id: string): Promise<Material | null>;
    deleteMaterial(id: string, requesterId?: string, requesterRole?: string): Promise<void>;
}
