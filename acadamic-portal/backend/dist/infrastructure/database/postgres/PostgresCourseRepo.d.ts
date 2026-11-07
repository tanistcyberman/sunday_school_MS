import { CourseRepositoryPort } from '../../../application/ports/out/CourseRepositoryPort';
import { Course } from '../../../domain/entities/Course';
import { DatabaseService } from './DatabaseService';
export declare class PostgresCourseRepo implements CourseRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<Course | null>;
    findByGrade(gradeLevel: number): Promise<Course[]>;
    findByTeacherId(teacherId: string): Promise<Course[]>;
    findAll(): Promise<Course[]>;
    assignTeacherToCourse(courseId: string, teacherId: string | null): Promise<void>;
    save(course: Course): Promise<Course>;
    private mapRow;
}
