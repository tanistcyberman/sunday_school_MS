import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Param,
  Body, 
  Query, 
  Res, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../infrastructure/security/JwtAuthGuard';
import { RolesGuard } from '../../../infrastructure/security/RolesGuard';
import { Roles } from '../../../infrastructure/security/RolesDecorator';
import { MasterScheduleUseCase, SaveScheduleDto } from '../../../application/use-cases/MasterScheduleUseCase';
import { ImportStudentsUseCase, CSVStudentRow } from '../../../application/use-cases/ImportStudentsUseCase';
import { ExportGradesUseCase } from '../../../application/use-cases/ExportGradesUseCase';
import { PromoteStudentsUseCase } from '../../../application/use-cases/PromoteStudentsUseCase';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';
import { PostgresUserRepo } from '../../../infrastructure/database/postgres/PostgresUserRepo';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly masterScheduleUseCase: MasterScheduleUseCase,
    private readonly importStudentsUseCase: ImportStudentsUseCase,
    private readonly exportGradesUseCase: ExportGradesUseCase,
    private readonly promoteStudentsUseCase: PromoteStudentsUseCase,
    private readonly courseRepo: PostgresCourseRepo,
    private readonly studentRepo: PostgresStudentRepo,
    private readonly userRepo: PostgresUserRepo
  ) {}

  // Master Schedule
  @Get('schedule')
  async getSchedule(@Query('grade') grade?: string) {
    if (grade) {
      return await this.masterScheduleUseCase.getSchedulesByGrade(parseInt(grade, 10));
    }
    return await this.masterScheduleUseCase.getAllSchedules();
  }

  @Post('schedule')
  async saveSchedule(@Body() dto: SaveScheduleDto) {
    return await this.masterScheduleUseCase.saveSchedule(dto);
  }

  // Courses
  @Get('courses')
  async getCourses(@Query('grade') grade?: string) {
    if (grade) {
      return await this.courseRepo.findByGrade(parseInt(grade, 10));
    }
    return await this.courseRepo.findAll();
  }

  // List all registered teachers for Course Assignment
  @Get('teachers')
  async getTeachers() {
    const teachers = await this.userRepo.findAllTeachers();
    return teachers.map(t => ({
      id: t.id,
      username: t.username,
      fullName: t.fullName,
      fullNameAmharic: t.fullNameAmharic,
      email: t.email
    }));
  }

  // Assign or reassign Teacher to Course
  @Patch('courses/:courseId/assign-teacher')
  async assignTeacher(
    @Param('courseId') courseId: string,
    @Body('teacherId') teacherId: string | null
  ) {
    if (!courseId) {
      throw new BadRequestException('Course ID is required');
    }
    await this.courseRepo.assignTeacherToCourse(courseId, teacherId || null);
    const updated = await this.courseRepo.findById(courseId);
    return {
      success: true,
      courseId,
      assignedTeacherId: teacherId || null,
      course: updated
    };
  }

  // Students
  @Get('students')
  async getStudents(@Query('grade') grade?: string) {
    if (grade) {
      return await this.studentRepo.findByGrade(parseInt(grade, 10));
    }
    return await this.studentRepo.findAll();
  }

  // Student CSV Import
  @Post('students/preview-csv')
  @UseInterceptors(FileInterceptor('file'))
  async previewCsv(
    @UploadedFile() file?: Express.Multer.File,
    @Body('csvText') csvText?: string
  ) {
    let content = csvText;
    if (file && file.buffer) {
      content = file.buffer.toString('utf-8');
    }
    if (!content) {
      throw new BadRequestException('Please provide a valid CSV file or content');
    }

    return await this.importStudentsUseCase.previewCsv(content);
  }

  @Post('students/import')
  async commitImport(@Body('rows') rows: CSVStudentRow[]) {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('No valid rows provided to commit');
    }
    const saved = await this.importStudentsUseCase.commitImport(rows);
    return {
      success: true,
      importedCount: saved.length,
      students: saved
    };
  }

  // Consolidated Grades View & Export
  @Get('grades/consolidated')
  async getConsolidatedGrades(
    @Query('grade') grade?: string,
    @Query('year') year?: string
  ) {
    const gradeLevel = grade ? parseInt(grade, 10) : undefined;
    return await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
  }

  @Get('grades/export/csv')
  async exportCsv(
    @Res() res: Response,
    @Query('grade') grade?: string,
    @Query('year') year?: string
  ) {
    const gradeLevel = grade ? parseInt(grade, 10) : undefined;
    const data = await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
    const buffer = this.exportGradesUseCase.generateCsv(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="student_grades_${grade || 'all'}.csv"`);
    res.send(buffer);
  }

  @Get('grades/export/excel')
  async exportExcel(
    @Res() res: Response,
    @Query('grade') grade?: string,
    @Query('year') year?: string
  ) {
    const gradeLevel = grade ? parseInt(grade, 10) : undefined;
    const data = await this.exportGradesUseCase.getConsolidatedGrades(gradeLevel, year || '2026 E.C.');
    const buffer = this.exportGradesUseCase.generateExcel(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="student_grades_${grade || 'all'}.xlsx"`);
    res.send(buffer);
  }

  // End of Year Student Promotion
  @Get('promotion/candidates')
  async getPromotionCandidates(@Query('grade') grade?: string) {
    const gradeLevel = grade ? parseInt(grade, 10) : undefined;
    return await this.promoteStudentsUseCase.evaluatePromotionCandidates(gradeLevel);
  }

  @Post('promotion/execute')
  async executePromotion(@Body('grade') grade?: number) {
    return await this.promoteStudentsUseCase.executeBulkPromotion(grade);
  }
}
