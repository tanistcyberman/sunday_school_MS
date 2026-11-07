import { Injectable } from '@nestjs/common';
import { CourseRepositoryPort } from '../../../application/ports/out/CourseRepositoryPort';
import { Course } from '../../../domain/entities/Course';
import { DatabaseService } from './DatabaseService';

@Injectable()
export class PostgresCourseRepo implements CourseRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<Course | null> {
    if (!this.db.getIsConnected()) {
      const mem = this.db.getMemoryStore().courses.find(c => c.id === id);
      return mem ? this.mapRow(mem) : null;
    }
    const res = await this.db.query('SELECT * FROM courses WHERE id = $1', [id]);
    return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
  }

  public async findByGrade(gradeLevel: number): Promise<Course[]> {
    if (!this.db.getIsConnected()) {
      return this.db.getMemoryStore().courses
        .filter(c => c.grade_level === gradeLevel)
        .map(c => this.mapRow(c));
    }
    const res = await this.db.query(
      'SELECT * FROM courses WHERE grade_level = $1 ORDER BY code ASC',
      [gradeLevel]
    );
    return res.rows.map(r => this.mapRow(r));
  }

  public async findByTeacherId(teacherId: string): Promise<Course[]> {
    if (!this.db.getIsConnected()) {
      return this.db.getMemoryStore().courses
        .filter(c => c.teacher_id === teacherId)
        .map(c => this.mapRow(c));
    }
    const res = await this.db.query(
      'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY grade_level ASC, code ASC',
      [teacherId]
    );
    return res.rows.map(r => this.mapRow(r));
  }

  public async findAll(): Promise<Course[]> {
    if (!this.db.getIsConnected()) {
      return this.db.getMemoryStore().courses.map(c => this.mapRow(c));
    }
    const res = await this.db.query('SELECT * FROM courses ORDER BY grade_level ASC, code ASC');
    return res.rows.map(r => this.mapRow(r));
  }

  public async assignTeacherToCourse(courseId: string, teacherId: string | null): Promise<void> {
    const memList = this.db.getMemoryStore().courses;
    const course = memList.find(c => c.id === courseId);
    if (course) {
      course.teacher_id = teacherId;
    }

    if (this.db.getIsConnected()) {
      await this.db.query(
        'UPDATE courses SET teacher_id = $1 WHERE id = $2',
        [teacherId, courseId]
      );
    }
  }

  public async save(course: Course): Promise<Course> {
    const query = `
      INSERT INTO courses (id, code, name, name_amharic, grade_level, description, description_amharic, teacher_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_amharic = EXCLUDED.name_amharic,
        description = EXCLUDED.description,
        description_amharic = EXCLUDED.description_amharic,
        teacher_id = EXCLUDED.teacher_id;
    `;
    await this.db.query(query, [
      course.id,
      course.code,
      course.name,
      course.nameAmharic,
      course.gradeLevel,
      course.description,
      course.descriptionAmharic,
      course.assignedTeacherId,
      course.createdAt
    ]);

    const memList = this.db.getMemoryStore().courses;
    const idx = memList.findIndex(c => c.id === course.id);
    const row = {
      id: course.id,
      code: course.code,
      name: course.name,
      name_amharic: course.nameAmharic,
      grade_level: course.gradeLevel,
      description: course.description,
      description_amharic: course.descriptionAmharic,
      teacher_id: course.assignedTeacherId,
      created_at: course.createdAt
    };
    if (idx >= 0) memList[idx] = row;
    else memList.push(row);

    return course;
  }

  private mapRow(row: any): Course {
    return new Course(
      row.id,
      row.code,
      row.name,
      row.name_amharic,
      parseInt(row.grade_level, 10),
      row.description || '',
      row.description_amharic || '',
      row.teacher_id || null,
      new Date(row.created_at)
    );
  }
}
