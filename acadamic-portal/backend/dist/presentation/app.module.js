"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const configuration_1 = require("../infrastructure/config/configuration");
const DatabaseService_1 = require("../infrastructure/database/postgres/DatabaseService");
const PostgresStudentRepo_1 = require("../infrastructure/database/postgres/PostgresStudentRepo");
const PostgresGradeRepo_1 = require("../infrastructure/database/postgres/PostgresGradeRepo");
const PostgresCourseRepo_1 = require("../infrastructure/database/postgres/PostgresCourseRepo");
const PostgresScheduleRepo_1 = require("../infrastructure/database/postgres/PostgresScheduleRepo");
const PostgresMaterialRepo_1 = require("../infrastructure/database/postgres/PostgresMaterialRepo");
const PostgresUserRepo_1 = require("../infrastructure/database/postgres/PostgresUserRepo");
const LocalFileStorageAdapter_1 = require("../infrastructure/storage/LocalFileStorageAdapter");
const JwtAuthGuard_1 = require("../infrastructure/security/JwtAuthGuard");
const RolesGuard_1 = require("../infrastructure/security/RolesGuard");
const CourseOwnershipGuard_1 = require("./http/guards/CourseOwnershipGuard");
const AuthUseCase_1 = require("../application/use-cases/AuthUseCase");
const PromoteStudentsUseCase_1 = require("../application/use-cases/PromoteStudentsUseCase");
const CalculateFinalGradeUseCase_1 = require("../application/use-cases/CalculateFinalGradeUseCase");
const ImportStudentsUseCase_1 = require("../application/use-cases/ImportStudentsUseCase");
const ExportGradesUseCase_1 = require("../application/use-cases/ExportGradesUseCase");
const MasterScheduleUseCase_1 = require("../application/use-cases/MasterScheduleUseCase");
const MaterialUseCase_1 = require("../application/use-cases/MaterialUseCase");
const AuthController_1 = require("./http/controllers/AuthController");
const AdminController_1 = require("./http/controllers/AdminController");
const TeacherController_1 = require("./http/controllers/TeacherController");
const StudentController_1 = require("./http/controllers/StudentController");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: configuration_1.configuration.jwtSecret,
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [
            AuthController_1.AuthController,
            AdminController_1.AdminController,
            TeacherController_1.TeacherController,
            StudentController_1.StudentController,
        ],
        providers: [
            DatabaseService_1.DatabaseService,
            PostgresStudentRepo_1.PostgresStudentRepo,
            PostgresGradeRepo_1.PostgresGradeRepo,
            PostgresCourseRepo_1.PostgresCourseRepo,
            PostgresScheduleRepo_1.PostgresScheduleRepo,
            PostgresMaterialRepo_1.PostgresMaterialRepo,
            PostgresUserRepo_1.PostgresUserRepo,
            LocalFileStorageAdapter_1.LocalFileStorageAdapter,
            JwtAuthGuard_1.JwtAuthGuard,
            RolesGuard_1.RolesGuard,
            CourseOwnershipGuard_1.CourseOwnershipGuard,
            {
                provide: AuthUseCase_1.AuthUseCase,
                useFactory: (userRepo, jwtService) => {
                    return new AuthUseCase_1.AuthUseCase(userRepo, jwtService);
                },
                inject: [PostgresUserRepo_1.PostgresUserRepo, jwt_1.JwtService],
            },
            {
                provide: PromoteStudentsUseCase_1.PromoteStudentsUseCase,
                useFactory: (studentRepo, gradeRepo) => {
                    return new PromoteStudentsUseCase_1.PromoteStudentsUseCase(studentRepo, gradeRepo);
                },
                inject: [PostgresStudentRepo_1.PostgresStudentRepo, PostgresGradeRepo_1.PostgresGradeRepo],
            },
            {
                provide: CalculateFinalGradeUseCase_1.CalculateFinalGradeUseCase,
                useFactory: (gradeRepo, courseRepo) => {
                    return new CalculateFinalGradeUseCase_1.CalculateFinalGradeUseCase(gradeRepo, courseRepo);
                },
                inject: [PostgresGradeRepo_1.PostgresGradeRepo, PostgresCourseRepo_1.PostgresCourseRepo],
            },
            {
                provide: ImportStudentsUseCase_1.ImportStudentsUseCase,
                useFactory: (studentRepo) => {
                    return new ImportStudentsUseCase_1.ImportStudentsUseCase(studentRepo);
                },
                inject: [PostgresStudentRepo_1.PostgresStudentRepo],
            },
            {
                provide: ExportGradesUseCase_1.ExportGradesUseCase,
                useFactory: (gradeRepo, studentRepo, courseRepo) => {
                    return new ExportGradesUseCase_1.ExportGradesUseCase(gradeRepo, studentRepo, courseRepo);
                },
                inject: [PostgresGradeRepo_1.PostgresGradeRepo, PostgresStudentRepo_1.PostgresStudentRepo, PostgresCourseRepo_1.PostgresCourseRepo],
            },
            {
                provide: MasterScheduleUseCase_1.MasterScheduleUseCase,
                useFactory: (schedRepo, courseRepo) => {
                    return new MasterScheduleUseCase_1.MasterScheduleUseCase(schedRepo, courseRepo);
                },
                inject: [PostgresScheduleRepo_1.PostgresScheduleRepo, PostgresCourseRepo_1.PostgresCourseRepo],
            },
            {
                provide: MaterialUseCase_1.MaterialUseCase,
                useFactory: (materialRepo, courseRepo, fileStorage) => {
                    return new MaterialUseCase_1.MaterialUseCase(materialRepo, courseRepo, fileStorage);
                },
                inject: [PostgresMaterialRepo_1.PostgresMaterialRepo, PostgresCourseRepo_1.PostgresCourseRepo, LocalFileStorageAdapter_1.LocalFileStorageAdapter],
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map