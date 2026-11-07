import { Course } from '../../../domain/entities/Course';
export interface CourseRepositoryPort {
    findById(id: string): Promise<Course | null>;
    findByGrade(gradeLevel: number): Promise<Course[]>;
    findByTeacherId(teacherId: string): Promise<Course[]>;
    findAll(): Promise<Course[]>;
    save(course: Course): Promise<Course>;
    assignTeacherToCourse(courseId: string, teacherId: string): Promise<void>;
}
