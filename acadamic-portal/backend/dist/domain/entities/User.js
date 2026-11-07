"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, username, email, passwordHash, role, fullName, fullNameAmharic, studentId, createdAt = new Date()) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.fullName = fullName;
        this.fullNameAmharic = fullNameAmharic;
        this.studentId = studentId;
        this.createdAt = createdAt;
    }
    isAdmin() {
        return this.role === 'ADMIN';
    }
    isTeacher() {
        return this.role === 'TEACHER';
    }
    isStudent() {
        return this.role === 'STUDENT';
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map