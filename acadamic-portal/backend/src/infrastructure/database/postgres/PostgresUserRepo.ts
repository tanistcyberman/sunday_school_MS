import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../../application/ports/out/UserRepositoryPort';
import { User, UserRole } from '../../../domain/entities/User';
import { DatabaseService } from './DatabaseService';

@Injectable()
export class PostgresUserRepo implements UserRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<User | null> {
    if (!id) return null;

    // Check in-memory store first
    const mem = this.db.getMemoryStore().users.find(u => u.id === id);
    if (mem) {
      return this.mapRow(mem);
    }

    if (this.db.getIsConnected()) {
      try {
        const res = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows && res.rows.length > 0) {
          return this.mapRow(res.rows[0]);
        }
      } catch (err) {}
    }

    return null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    if (!username) return null;
    const clean = username.trim().toLowerCase();

    // Check in-memory store (checks username and email)
    const mem = this.db.getMemoryStore().users.find(u => 
      (u.username && u.username.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean)
    );
    if (mem) {
      return this.mapRow(mem);
    }

    if (this.db.getIsConnected()) {
      try {
        const res = await this.db.query(
          'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
          [clean]
        );
        if (res.rows && res.rows.length > 0) {
          return this.mapRow(res.rows[0]);
        }
      } catch (err) {}
    }

    return null;
  }

  public async findAllTeachers(): Promise<User[]> {
    const memTeachers = this.db.getMemoryStore().users
      .filter(u => u.role === 'TEACHER')
      .map(u => this.mapRow(u));

    if (memTeachers.length > 0) {
      return memTeachers;
    }

    if (this.db.getIsConnected()) {
      try {
        const res = await this.db.query("SELECT * FROM users WHERE role = 'TEACHER' ORDER BY full_name ASC");
        if (res.rows && res.rows.length > 0) {
          return res.rows.map(r => this.mapRow(r));
        }
      } catch (err) {}
    }

    return [];
  }

  public async save(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, username, email, password_hash, role, full_name, full_name_amharic, student_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        full_name_amharic = EXCLUDED.full_name_amharic,
        student_id = EXCLUDED.student_id;
    `;
    await this.db.query(query, [
      user.id,
      user.username,
      user.email,
      user.passwordHash,
      user.role,
      user.fullName,
      user.fullNameAmharic,
      user.studentId || null,
      user.createdAt
    ]);

    const memList = this.db.getMemoryStore().users;
    const idx = memList.findIndex(u => u.id === user.id);
    const row = {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      passwordHash: user.passwordHash,
      role: user.role,
      full_name: user.fullName,
      fullName: user.fullName,
      full_name_amharic: user.fullNameAmharic,
      fullNameAmharic: user.fullNameAmharic,
      student_id: user.studentId,
      studentId: user.studentId,
      created_at: user.createdAt
    };
    if (idx >= 0) memList[idx] = row;
    else memList.push(row);

    return user;
  }

  private mapRow(row: any): User {
    return new User(
      row.id,
      row.username,
      row.email,
      row.password_hash || row.passwordHash || '',
      row.role as UserRole,
      row.full_name || row.fullName || '',
      row.full_name_amharic || row.fullNameAmharic || '',
      row.student_id || row.studentId || null,
      new Date(row.created_at || row.createdAt || Date.now())
    );
  }
}
