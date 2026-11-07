"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const fs = require("fs");
const path = require("path");
const configuration_1 = require("../../config/configuration");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor() {
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.pool = null;
        this.isConnected = false;
        this.memoryTables = {
            users: [],
            students: [],
            courses: [],
            schedules: [],
            materials: [],
            grade_records: []
        };
    }
    async onModuleInit() {
        await this.initializeDatabase();
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
        }
    }
    getIsConnected() {
        return this.isConnected;
    }
    async initializeDatabase() {
        try {
            this.pool = new pg_1.Pool({
                host: configuration_1.configuration.database.host,
                port: configuration_1.configuration.database.port,
                user: configuration_1.configuration.database.user,
                password: configuration_1.configuration.database.password,
                database: configuration_1.configuration.database.name,
                client_encoding: 'UTF8',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 3000
            });
            const client = await this.pool.connect();
            await client.query("SET client_encoding = 'UTF8';");
            this.isConnected = true;
            this.logger.log(`Successfully connected to PostgreSQL at ${configuration_1.configuration.database.host}:${configuration_1.configuration.database.port}/${configuration_1.configuration.database.name} with UTF-8 encoding`);
            const schemaPath = path.resolve(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
                await client.query(schemaSql);
                this.logger.log('PostgreSQL schema tables verified and ready.');
            }
            client.release();
        }
        catch (err) {
            this.isConnected = false;
            this.logger.warn(`PostgreSQL connection failed: ${err.message}. Using resilient fallback storage for development/demonstration mode.`);
        }
    }
    async query(text, params) {
        if (this.isConnected && this.pool) {
            try {
                return await this.pool.query(text, params);
            }
            catch (err) {
                this.logger.error(`PostgreSQL query error: ${err.message}. Falling back to internal memory state.`);
            }
        }
        return this.simulateQuery(text, params);
    }
    getMemoryStore() {
        return this.memoryTables;
    }
    simulateQuery(text, params = []) {
        const trimmed = text.trim();
        const upper = trimmed.toUpperCase();
        let targetTable = 'users';
        if (upper.includes('USERS'))
            targetTable = 'users';
        else if (upper.includes('STUDENTS'))
            targetTable = 'students';
        else if (upper.includes('COURSES'))
            targetTable = 'courses';
        else if (upper.includes('SCHEDULES'))
            targetTable = 'schedules';
        else if (upper.includes('MATERIALS'))
            targetTable = 'materials';
        else if (upper.includes('GRADE_RECORDS'))
            targetTable = 'grade_records';
        const rows = this.memoryTables[targetTable] || [];
        if (upper.startsWith('SELECT')) {
            if (params && params.length > 0 && targetTable === 'users') {
                const val = String(params[0]).toLowerCase();
                if (upper.includes('USERNAME') || upper.includes('EMAIL')) {
                    const filtered = rows.filter(r => (r.username && r.username.toLowerCase() === val) ||
                        (r.email && r.email.toLowerCase() === val));
                    return { rows: filtered, rowCount: filtered.length };
                }
                if (upper.includes('ROLE')) {
                    const filtered = rows.filter(r => r.role === params[0]);
                    return { rows: filtered, rowCount: filtered.length };
                }
                if (upper.includes('ID =') || upper.includes('ID=')) {
                    const filtered = rows.filter(r => r.id === params[0]);
                    return { rows: filtered, rowCount: filtered.length };
                }
            }
            return { rows: [...rows], rowCount: rows.length };
        }
        return { rows: [], rowCount: 1 };
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=DatabaseService.js.map