"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();
exports.configuration = {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'academic_portal_secret_key_2026_ethiopia_hahucloud',
    uploadDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'academic_portal'
    }
};
//# sourceMappingURL=configuration.js.map