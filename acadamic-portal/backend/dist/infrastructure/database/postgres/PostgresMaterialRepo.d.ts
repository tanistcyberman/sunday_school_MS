import { MaterialRepositoryPort } from '../../../application/ports/out/MaterialRepositoryPort';
import { Material } from '../../../domain/entities/Material';
import { DatabaseService } from './DatabaseService';
export declare class PostgresMaterialRepo implements MaterialRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<Material | null>;
    findByGrade(gradeLevel: number): Promise<Material[]>;
    findByCourse(courseId: string): Promise<Material[]>;
    findAll(): Promise<Material[]>;
    save(material: Material): Promise<Material>;
    delete(id: string): Promise<void>;
    private mapRow;
}
