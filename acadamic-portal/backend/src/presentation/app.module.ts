import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { configuration } from '../infrastructure/config/configuration';

// Infrastructure
import { DatabaseService } from '../infrastructure/database/postgres/DatabaseService';
import { PostgresStudentRepo } from '../infrastructure/database/postgres/PostgresStudentRepo';
import { PostgresGradeRepo } from '../infrastructure/database/postgres/PostgresGradeRepo';
import { PostgresCourseRepo } from '../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresScheduleRepo } from '../infrastructure/database/postgres/PostgresScheduleRepo';
import { PostgresMaterialRepo } from '../infrastructure/database/postgres/PostgresMaterialRepo';
import { PostgresUserRepo } from '../infrastructure/database/postgres/PostgresUserRepo';
import { LocalFileStorageAdapter } from '../infrastructure/storage/LocalFileStorageAdapter';
import { JwtAuthGuard } from '../infrastructure/security/JwtAuthGuard';
import { RolesGuard } from '../infrastructure/security/RolesGuard';
import { CourseOwnershipGuard } from './http/guards/CourseOwnershipGuard';

// Use Cases
import { AuthUseCase } from '../application/use-cases/AuthUseCase';
import { PromoteStudentsUseCase } from '../application/use-cases/PromoteStudentsUseCase';
import { CalculateFinalGradeUseCase } from '../application/use-cases/CalculateFinalGradeUseCase';
import { ImportStudentsUseCase } from '../application/use-cases/ImportStudentsUseCase';
import { ExportGradesUseCase } from '../application/use-cases/ExportGradesUseCase';
import { MasterScheduleUseCase } from '../application/use-cases/MasterScheduleUseCase';
import { MaterialUseCase } from '../application/use-cases/MaterialUseCase';

// Controllers
import { AuthController } from './http/controllers/AuthController';
import { AdminController } from './http/controllers/AdminController';
import { TeacherController } from './http/controllers/TeacherController';
import { StudentController } from './http/controllers/StudentController';

@Module({
  imports: [
    JwtModule.register({
      secret: configuration.jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    AdminController,
    TeacherController,
    StudentController,
  ],
  providers: [
    DatabaseService,
    PostgresStudentRepo,
    PostgresGradeRepo,
    PostgresCourseRepo,
    PostgresScheduleRepo,
    PostgresMaterialRepo,
    PostgresUserRepo,
    LocalFileStorageAdapter,
    JwtAuthGuard,
    RolesGuard,
    CourseOwnershipGuard,

    // Use Case factories
    {
      provide: AuthUseCase,
      useFactory: (userRepo: PostgresUserRepo, jwtService: any) => {
        return new AuthUseCase(userRepo, jwtService);
      },
      inject: [PostgresUserRepo, JwtService],
    },
    {
      provide: PromoteStudentsUseCase,
      useFactory: (studentRepo: PostgresStudentRepo, gradeRepo: PostgresGradeRepo) => {
        return new PromoteStudentsUseCase(studentRepo, gradeRepo);
      },
      inject: [PostgresStudentRepo, PostgresGradeRepo],
    },
    {
      provide: CalculateFinalGradeUseCase,
      useFactory: (gradeRepo: PostgresGradeRepo, courseRepo: PostgresCourseRepo) => {
        return new CalculateFinalGradeUseCase(gradeRepo, courseRepo);
      },
      inject: [PostgresGradeRepo, PostgresCourseRepo],
    },
    {
      provide: ImportStudentsUseCase,
      useFactory: (studentRepo: PostgresStudentRepo) => {
        return new ImportStudentsUseCase(studentRepo);
      },
      inject: [PostgresStudentRepo],
    },
    {
      provide: ExportGradesUseCase,
      useFactory: (gradeRepo: PostgresGradeRepo, studentRepo: PostgresStudentRepo, courseRepo: PostgresCourseRepo) => {
        return new ExportGradesUseCase(gradeRepo, studentRepo, courseRepo);
      },
      inject: [PostgresGradeRepo, PostgresStudentRepo, PostgresCourseRepo],
    },
    {
      provide: MasterScheduleUseCase,
      useFactory: (schedRepo: PostgresScheduleRepo, courseRepo: PostgresCourseRepo) => {
        return new MasterScheduleUseCase(schedRepo, courseRepo);
      },
      inject: [PostgresScheduleRepo, PostgresCourseRepo],
    },
    {
      provide: MaterialUseCase,
      useFactory: (materialRepo: PostgresMaterialRepo, courseRepo: PostgresCourseRepo, fileStorage: LocalFileStorageAdapter) => {
        return new MaterialUseCase(materialRepo, courseRepo, fileStorage);
      },
      inject: [PostgresMaterialRepo, PostgresCourseRepo, LocalFileStorageAdapter],
    },
  ],
})
export class AppModule {}
