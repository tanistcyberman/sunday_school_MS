import { Material } from '../../../domain/entities/Material';
export interface MaterialRepositoryPort {
    findById(id: string): Promise<Material | null>;
    findByGrade(gradeLevel: number): Promise<Material[]>;
    findByCourse(courseId: string): Promise<Material[]>;
    findAll(): Promise<Material[]>;
    save(material: Material): Promise<Material>;
    delete(id: string): Promise<void>;
}
