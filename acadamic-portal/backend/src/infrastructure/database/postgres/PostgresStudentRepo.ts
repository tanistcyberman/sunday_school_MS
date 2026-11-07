    import { Injectable } from '@nestjs/common';
import { StudentRepositoryPort } from '../../../application/ports/out/StudentRepositoryPort';
import { Student, StudentStatus } from '../../../domain/entities/Student';
import { DatabaseService } from './DatabaseService';

@Injectable()
export class PostgresStudentRepo implements StudentRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<Student | null> {
    if (!this.db.getIsConnected()) {
      const mem = this.db.getMemoryStore().students.find(s => s.id === id);
      return mem ? this.mapRow(mem) : null;
    }
    const res = await this.db.query('SELECT * FROM students WHERE id = $1', [id]);
    return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
  }

  public async findByCode(code: string): Promise<Student | null> {
    if (!this.db.getIsConnected()) {
      const mem = this.db.getMemoryStore().students.find(s => s.student_code === code);
      return mem ? this.mapRow(mem) : null;
    }
    const res = await this.db.query('SELECT * FROM students WHERE student_code = $1', [code]);
    return res.rows.length > 0 ? this.mapRow(res.rows[0]) : null;
  }

  public async findByGrade(gradeLevel: number): Promise<Student[]> {
    const res = await this.db.query(
      'SELECT * FROM students WHERE grade_level = $1 ORDER BY student_code ASC',
      [gradeLevel]
    );
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().students
        .filter(s => s.grade_level === gradeLevel)
        .map(s => this.mapRow(s));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async findAll(): Promise<Student[]> {
    const res = await this.db.query('SELECT * FROM students ORDER BY grade_level ASC, student_code ASC');
    if (res.rows.length === 0 && !this.db.getIsConnected()) {
      return this.db.getMemoryStore().students.map(s => this.mapRow(s));
    }
    return res.rows.map(r => this.mapRow(r));
  }

  public async save(student: Student): Promise<Student> {
    const query = `
      INSERT INTO students (id, student_code, full_name, full_name_amharic, grade_level, gender, section, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        full_name_amharic = EXCLUDED.full_name_amharic,
        grade_level = EXCLUDED.grade_level,
        gender = EXCLUDED.gender,
        section = EXCLUDED.section,
        status = EXCLUDED.status;
    `;
    await this.db.query(query, [
      student.id,
      student.studentCode,
      student.fullName,
      student.fullNameAmharic,
      student.gradeLevel,
      student.gender,
      student.section,
      student.status,
      student.createdAt
    ]);

    // Update memory cache
    const memList = this.db.getMemoryStore().students;
    const idx = memList.findIndex(s => s.id === student.id);
    const row = {
      id: student.id,
      student_code: student.studentCode,
      full_name: student.fullName,
      full_name_amharic: student.fullNameAmharic,
      grade_level: student.gradeLevel,
      gender: student.gender,
      section: student.section,
      status: student.status,
      created_at: student.createdAt
    };
    if (idx >= 0) memList[idx] = row;
    else memList.push(row);

    return student;
  }

  public async saveMany(students: Student[]): Promise<Student[]> {
    for (const student of students) {
      await this.save(student);
    }
    return students;
  }

  public async updateGradeAndStatus(id: string, gradeLevel: number, status: string): Promise<void> {
    await this.db.query(
      'UPDATE students SET grade_level = $1, status = $2 WHERE id = $3',
      [gradeLevel, status, id]
    );

    const mem = this.db.getMemoryStore().students.find(s => s.id === id);
    if (mem) {
      mem.grade_level = gradeLevel;
      mem.status = status;
    }
  }

  private mapRow(row: any): Student {
    return new Student(
      row.id,
      row.student_code,
      row.full_name,
      row.full_name_amharic,
      parseInt(row.grade_level, 10),
      row.gender,
      row.section,
      row.status as StudentStatus,
      new Date(row.created_at)
    );
  }
}
