import { MaterialRepositoryPort } from '../ports/out/MaterialRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
import { FileStoragePort } from '../ports/out/FileStoragePort';
import { Material } from '../../domain/entities/Material';
import { UnauthorizedCourseAccessException } from '../../domain/exceptions/UnauthorizedCourseAccessException';

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

export class MaterialUseCase {
  constructor(
    private readonly materialRepo: MaterialRepositoryPort,
    private readonly courseRepo: CourseRepositoryPort,
    private readonly fileStorage: FileStoragePort
  ) {}

  public async uploadMaterial(dto: UploadMaterialDto): Promise<Material> {
    const TEN_MB = 10 * 1024 * 1024;
    if (dto.file.size > TEN_MB) {
      throw new Error('File exceeds the 10MB limit per course specification');
    }

    const course = await this.courseRepo.findById(dto.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Enforce Course Ownership Authorization
    if (dto.requesterRole !== 'ADMIN' && !course.isOwnedBy(dto.uploadedByTeacherId)) {
      throw new UnauthorizedCourseAccessException();
    }

    const storedFile = await this.fileStorage.saveFile(dto.file, 'course-materials');

    const material = new Material(
      `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dto.courseId,
      dto.gradeLevel,
      dto.title,
      dto.titleAmharic || dto.title,
      dto.description || '',
      storedFile.fileName,
      storedFile.filePath,
      storedFile.fileSize,
      storedFile.mimeType,
      dto.uploadedByTeacherId,
      course?.name,
      course?.nameAmharic
    );

    return await this.materialRepo.save(material);
  }

  public async getMaterialsByGrade(gradeLevel: number): Promise<Material[]> {
    const materials = await this.materialRepo.findByGrade(gradeLevel);
    const courses = await this.courseRepo.findByGrade(gradeLevel);
    const courseMap = new Map(courses.map(c => [c.id, c]));

    return materials.map(m => {
      const course = courseMap.get(m.courseId);
      return new Material(
        m.id,
        m.courseId,
        m.gradeLevel,
        m.title,
        m.titleAmharic,
        m.description,
        m.fileName,
        m.filePath,
        m.fileSize,
        m.mimeType,
        m.uploadedByTeacherId,
        course?.name || m.courseName,
        course?.nameAmharic || m.courseNameAmharic,
        m.createdAt
      );
    });
  }

  public async getMaterialsByTeacher(teacherId: string): Promise<Material[]> {
    const teacherCourses = await this.courseRepo.findByTeacherId(teacherId);
    const courseIds = new Set(teacherCourses.map(c => c.id));
    const allMaterials = await this.materialRepo.findAll();
    const courseMap = new Map(teacherCourses.map(c => [c.id, c]));

    return allMaterials
      .filter(m => courseIds.has(m.courseId))
      .map(m => {
        const course = courseMap.get(m.courseId);
        return new Material(
          m.id,
          m.courseId,
          m.gradeLevel,
          m.title,
          m.titleAmharic,
          m.description,
          m.fileName,
          m.filePath,
          m.fileSize,
          m.mimeType,
          m.uploadedByTeacherId,
          course?.name || m.courseName,
          course?.nameAmharic || m.courseNameAmharic,
          m.createdAt
        );
      });
  }

  public async getAllMaterials(): Promise<Material[]> {
    const materials = await this.materialRepo.findAll();
    const courses = await this.courseRepo.findAll();
    const courseMap = new Map(courses.map(c => [c.id, c]));

    return materials.map(m => {
      const course = courseMap.get(m.courseId);
      return new Material(
        m.id,
        m.courseId,
        m.gradeLevel,
        m.title,
        m.titleAmharic,
        m.description,
        m.fileName,
        m.filePath,
        m.fileSize,
        m.mimeType,
        m.uploadedByTeacherId,
        course?.name || m.courseName,
        course?.nameAmharic || m.courseNameAmharic,
        m.createdAt
      );
    });
  }

  public async getMaterialById(id: string): Promise<Material | null> {
    return await this.materialRepo.findById(id);
  }

  public async deleteMaterial(id: string, requesterId?: string, requesterRole?: string): Promise<void> {
    const material = await this.materialRepo.findById(id);
    if (material) {
      if (requesterRole !== 'ADMIN' && requesterId) {
        const course = await this.courseRepo.findById(material.courseId);
        if (!course || !course.isOwnedBy(requesterId)) {
          throw new UnauthorizedCourseAccessException();
        }
      }
      await this.fileStorage.deleteFile(material.filePath);
      await this.materialRepo.delete(id);
    }
  }
}
