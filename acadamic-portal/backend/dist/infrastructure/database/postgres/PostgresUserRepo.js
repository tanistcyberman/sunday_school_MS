"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepo = void 0;
const common_1 = require("@nestjs/common");
const User_1 = require("../../../domain/entities/User");
const DatabaseService_1 = require("./DatabaseService");
let PostgresUserRepo = class PostgresUserRepo {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        if (!id)
            return null;
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
            }
            catch (err) { }
        }
        return null;
    }
    async findByUsername(username) {
        if (!username)
            return null;
        const clean = username.trim().toLowerCase();
        const mem = this.db.getMemoryStore().users.find(u => (u.username && u.username.toLowerCase() === clean) ||
            (u.email && u.email.toLowerCase() === clean));
        if (mem) {
            return this.mapRow(mem);
        }
        if (this.db.getIsConnected()) {
            try {
                const res = await this.db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)', [clean]);
                if (res.rows && res.rows.length > 0) {
                    return this.mapRow(res.rows[0]);
                }
            }
            catch (err) { }
        }
        return null;
    }
    async findAllTeachers() {
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
            }
            catch (err) { }
        }
        return [];
    }
    async save(user) {
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
        if (idx >= 0)
            memList[idx] = row;
        else
            memList.push(row);
        return user;
    }
    mapRow(row) {
        return new User_1.User(row.id, row.username, row.email, row.password_hash || row.passwordHash || '', row.role, row.full_name || row.fullName || '', row.full_name_amharic || row.fullNameAmharic || '', row.student_id || row.studentId || null, new Date(row.created_at || row.createdAt || Date.now()));
    }
};
exports.PostgresUserRepo = PostgresUserRepo;
exports.PostgresUserRepo = PostgresUserRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DatabaseService_1.DatabaseService])
], PostgresUserRepo);
//# sourceMappingURL=PostgresUserRepo.js.map