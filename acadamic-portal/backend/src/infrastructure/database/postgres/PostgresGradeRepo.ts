import { Injectable } from '@nestjs/common';
import { GradeRepositoryPort } from '../../../application/ports/out/GradeRepositoryPort';
import { GradeRecord } from '../../../domain/entities/GradeRecord';
import { MidMark } from '../../../domain/value-objects/MidMark';
import { FinalMark } from '../../../domain/value-objects/FinalMark';
import { TotalScore } from '../../../domain/value-objects/TotalScore';
import { PassStatus } from '../../../domain/value-objects/PassStatus';
import { DatabaseService } from './DatabaseService';

@Injectable()
export class PostgresGradeRepo implements GradeRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<GradeRecord | null> {
    if (!this.db.getIsConnected()) {
      const mem = this.db.getMemoryStore().grade_records.find(g => g.id === id);
      return mem ? this.mapRow(mem) : null;
    }
    const res = await this.db.query(
      `SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       WHERE g.id = $1`,
      [id]
    );
    return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
  }

  public async findByStudentId(studentId: string): Promise<GradeRecord[]> {
    if (!this.db.getIsConnected()) {
      return this.db.getMemoryStore().grade_records
        .filter(g => g.student_id === studentId)
        .map(g => this.mapRow(g));
    }
    const res = await this.db.query(
      `SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       WHERE g.student_id = $1
       ORDER BY c.code ASC`,
      [studentId]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().grade_records
        .filter(g => g.student_id === studentId)
        .map(g => this.mapRow(g));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async findByCourseAndGrade(courseId: string, gradeLevel: number): Promise<GradeRecord[]> {
    const res = await this.db.query(
      `SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       JOIN students s ON g.student_id = s.id
       JOIN courses c ON g.course_id = c.id
       WHERE g.course_id = $1 AND s.grade_level = $2
       ORDER BY s.student_code ASC`,
      [courseId, gradeLevel]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().grade_records
        .filter(g => g.course_id === courseId && g.grade_level === gradeLevel)
        .map(g => this.mapRow(g));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async findAll(): Promise<GradeRecord[]> {
    const res = await this.db.query(
      `SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN courses c ON g.course_id = c.id
       ORDER BY s.grade_level ASC, s.student_code ASC`
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().grade_records.map(g => this.mapRow(g));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async save(grade: GradeRecord): Promise<GradeRecord> {
    const query = `
      INSERT INTO grade_records (id, student_id, course_id, academic_year, mid_mark, final_mark, total_score, pass_status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (student_id, course_id, academic_year) DO UPDATE SET
        mid_mark = EXCLUDED.mid_mark,
        final_mark = EXCLUDED.final_mark,
        total_score = EXCLUDED.total_score,
        pass_status = EXCLUDED.pass_status,
        updated_at = EXCLUDED.updated_at;
    `;
    await this.db.query(query, [
      grade.id,
      grade.studentId,
      grade.courseId,
      grade.academicYear,
      grade.midMark ? grade.midMark.getValue() : null,
      grade.finalMark ? grade.finalMark.getValue() : null,
      grade.totalScore ? grade.totalScore.getValue() : null,
      grade.passStatus.getStatus(),
      grade.updatedAt
    ]);

    // Memory update
    const memList = this.db.getMemoryStore().grade_records;
    const idx = memList.findIndex(g => g.student_id === grade.studentId && g.course_id === grade.courseId && g.academic_year === grade.academicYear);
    const row = {
      id: grade.id,
      student_id: grade.studentId,
      course_id: grade.courseId,
      academic_year: grade.academicYear,
      mid_mark: grade.midMark ? grade.midMark.getValue() : null,
      final_mark: grade.finalMark ? grade.finalMark.getValue() : null,
      total_score: grade.totalScore ? grade.totalScore.getValue() : null,
      pass_status: grade.passStatus.getStatus(),
      updated_at: grade.updatedAt
    };
    if (idx >= 0) memList[idx] = row;
    else memList.push(row);

    return grade;
  }

  public async saveBatch(grades: GradeRecord[]): Promise<void> {
    for (const g of grades) {
      await this.save(g);
    }
  }

  public async getStudentCourseGrades(academicYear: string): Promise<GradeRecord[]> {
    const res = await this.db.query(
      `SELECT g.*, s.student_code, s.full_name as student_name, s.full_name_amharic as student_name_amharic, s.grade_level,
              c.name as course_name, c.name_amharic as course_name_amharic
       FROM grade_records g
       JOIN students s ON g.student_id = s.id
       JOIN courses c ON g.course_id = c.id
       WHERE g.academic_year = $1`,
      [academicYear]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().grade_records
        .filter(g => g.academic_year === academicYear)
        .map(g => this.mapRow(g));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  private mapRow(row: any): GradeRecord {
    const mid = row.mid_mark !== null && row.mid_mark !== undefined ? new MidMark(parseFloat(row.mid_mark)) : null;
    const final = row.final_mark !== null && row.final_mark !== undefined ? new FinalMark(parseFloat(row.final_mark)) : null;
    const total = row.total_score !== null && row.total_score !== undefined ? new TotalScore(parseFloat(row.total_score)) : null;
    const status = PassStatus.fromString(row.pass_status);

    return new GradeRecord(
      row.id,
      row.student_id,
      row.course_id,
      row.academic_year,
      mid,
      final,
      total,
      status,
      new Date(row.updated_at || Date.now()),
      row.student_code,
      row.student_name,
      row.student_name_amharic,
      row.grade_level ? parseInt(row.grade_level, 10) : undefined,
      row.course_name,
      row.course_name_amharic
    );
  }
}
