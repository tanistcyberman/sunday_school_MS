import { Injectable } from '@nestjs/common';
import { MaterialRepositoryPort } from '../../../application/ports/out/MaterialRepositoryPort';
import { Material } from '../../../domain/entities/Material';
import { DatabaseService } from './DatabaseService';

@Injectable()
export class PostgresMaterialRepo implements MaterialRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<Material | null> {
    if (!this.db.getIsConnected()) {
      const mem = this.db.getMemoryStore().materials.find(m => m.id === id);
      return mem ? this.mapRow(mem) : null;
    }
    const res = await this.db.query(
      `SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.id = $1`,
      [id]
    );
    return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
  }

  public async findByGrade(gradeLevel: number): Promise<Material[]> {
    if (!this.db.getIsConnected()) {
      return this.db.getMemoryStore().materials
        .filter(m => m.grade_level === gradeLevel)
        .map(m => this.mapRow(m));
    }
    const res = await this.db.query(
      `SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.grade_level = $1
       ORDER BY m.created_at DESC`,
      [gradeLevel]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().materials
        .filter(m => m.grade_level === gradeLevel)
        .map(m => this.mapRow(m));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async findByCourse(courseId: string): Promise<Material[]> {
    const res = await this.db.query(
      `SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.course_id = $1
       ORDER BY m.created_at DESC`,
      [courseId]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().materials
        .filter(m => m.course_id === courseId)
        .map(m => this.mapRow(m));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async findAll(): Promise<Material[]> {
    const res = await this.db.query(
      `SELECT m.*, c.name as course_name, c.name_amharic as course_name_amharic
       FROM materials m
       LEFT JOIN courses c ON m.course_id = c.id
       ORDER BY m.grade_level ASC, m.created_at DESC`
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().materials.map(m => this.mapRow(m));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async save(material: Material): Promise<Material> {
    const query = `
      INSERT INTO materials (id, course_id, grade_level, title, title_amharic, description, file_name, file_path, file_size, mime_type, uploaded_by_teacher_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        title_amharic = EXCLUDED.title_amharic,
        description = EXCLUDED.description;
    `;
    await this.db.query(query, [
      material.id,
      material.courseId,
      material.gradeLevel,
      material.title,
      material.titleAmharic,
      material.description,
      material.fileName,
      material.filePath,
      material.fileSize,
      material.mimeType,
      material.uploadedByTeacherId,
      material.createdAt
    ]);

    const memList = this.db.getMemoryStore().materials;
    const idx = memList.findIndex(m => m.id === material.id);
    const row = {
      id: material.id,
      course_id: material.courseId,
      grade_level: material.gradeLevel,
      title: material.title,
      title_amharic: material.titleAmharic,
      description: material.description,
      file_name: material.fileName,
      file_path: material.filePath,
      file_size: material.fileSize,
      mime_type: material.mimeType,
      uploaded_by_teacher_id: material.uploadedByTeacherId,
      course_name: material.courseName,
      course_name_amharic: material.courseNameAmharic,
      created_at: material.createdAt
    };
    if (idx >= 0) memList[idx] = row;
    else memList.push(row);

    return material;
  }

  public async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM materials WHERE id = $1', [id]);
    const memList = this.db.getMemoryStore().materials;
    const idx = memList.findIndex(m => m.id === id);
    if (idx >= 0) memList.splice(idx, 1);
  }

  private mapRow(row: any): Material {
    return new Material(
      row.id,
      row.course_id,
      parseInt(row.grade_level, 10),
      row.title,
      row.title_amharic,
      row.description || '',
      row.file_name,
      row.file_path,
      parseInt(row.file_size, 10),
      row.mime_type,
      row.uploaded_by_teacher_id,
      row.course_name,
      row.course_name_amharic,
      new Date(row.created_at)
    );
  }
}
