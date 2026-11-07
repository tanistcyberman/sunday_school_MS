"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const configuration_1 = require("../infrastructure/config/configuration");
const DatabaseService_1 = require("../infrastructure/database/postgres/DatabaseService");
const seed_1 = require("../infrastructure/database/postgres/seed");
const common_1 = require("@nestjs/common");
const express = require("express");
async function bootstrap() {
    const logger = new common_1.Logger('AcademicPortalServer');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const uploadDir = configuration_1.configuration.uploadDir;
    app.use('/uploads', express.static(uploadDir));
    const dbService = app.get(DatabaseService_1.DatabaseService);
    try {
        await (0, seed_1.runSeed)(dbService);
        logger.log('Database verification and seed ready.');
    }
    catch (err) {
        logger.warn(`Seed process note: ${err.message}`);
    }
    const port = configuration_1.configuration.port;
    await app.listen(port);
    logger.log(`================================================================`);
    logger.log(`Academic Portal Backend running on http://localhost:${port}`);
    logger.log(`Continuous Education Monitoring Dept (Hexagonal Architecture)`);
    logger.log(`UTF-8 Database & Localization Enabled (am-ET Default)`);
    logger.log(`================================================================`);
}
if (require.main === module) {
    bootstrap();
}
//# sourceMappingURL=server.js.map