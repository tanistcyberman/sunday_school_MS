import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Req, 
  Res, 
  UseGuards, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../infrastructure/security/JwtAuthGuard';
import { RolesGuard } from '../../../infrastructure/security/RolesGuard';
import { Roles } from '../../../infrastructure/security/RolesDecorator';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';
import { PostgresGradeRepo } from '../../../infrastructure/database/postgres/PostgresGradeRepo';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresScheduleRepo } from '../../../infrastructure/database/postgres/PostgresScheduleRepo';
import { MaterialUseCase } from '../../../application/use-cases/MaterialUseCase';
import { LocalFileStorageAdapter } from '../../../infrastructure/storage/LocalFileStorageAdapter';
import * as fs from 'fs';

@Controller('api/student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT', 'TEACHER', 'ADMIN')
export class StudentController {
  constructor(
    private readonly studentRepo: PostgresStudentRepo,
    private readonly gradeRepo: PostgresGradeRepo,
    private readonly courseRepo: PostgresCourseRepo,
    private readonly scheduleRepo: PostgresScheduleRepo,
    private readonly materialUseCase: MaterialUseCase,
    private readonly fileStorage: LocalFileStorageAdapter
  ) {}

  private async resolveStudentId(req: any): Promise<string> {
    if (req.user.role === 'STUDENT') {
      if (!req.user.studentId) {
        throw new UnauthorizedException('Student profile not mapped to account');
      }
      return req.user.studentId;
    }
    // For Admin / Teacher testing, allow query parameter or fallback to first student
    if (req.query.studentId) {
      return req.query.studentId as string;
    }
    const all = await this.studentRepo.findAll();
    if (all.length > 0) return all[0].id;
    throw new NotFoundException('No students found');
  }

  // Dashboard Overview
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const studentId = await this.resolveStudentId(req);
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student record not found');
    }

    const courses = await this.courseRepo.findByGrade(student.gradeLevel);
    const schedules = await this.scheduleRepo.findByGrade(student.gradeLevel);
    const grades = await this.gradeRepo.findByStudentId(studentId);
    const materials = await this.materialUseCase.getMaterialsByGrade(student.gradeLevel);

    // Compute academic timeline
    const now = new Date();
    let minStartDate: Date | null = null;
    let maxFinalDate: Date | null = null;
    let midExamDate: Date | null = null;

    schedules.forEach(s => {
      if (!minStartDate || s.startDate < minStartDate) minStartDate = s.startDate;
      if (!maxFinalDate || s.finalExamDate > maxFinalDate) maxFinalDate = s.finalExamDate;
      if (!midExamDate) midExamDate = s.midExamDate;
    });

    let progressPercentage = 0;
    if (minStartDate && maxFinalDate) {
      const totalDuration = maxFinalDate.getTime() - minStartDate.getTime();
      const elapsed = Math.max(0, now.getTime() - minStartDate.getTime());
      progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }

    // Compute student overall summary
    const completedGrades = grades.filter(g => g.totalScore !== null);
    const averageScore = completedGrades.length > 0
      ? Math.round((completedGrades.reduce((sum, g) => sum + g.totalScore!.getValue(), 0) / completedGrades.length) * 100) / 100
      : null;

    return {
      student,
      courseCount: courses.length,
      materialsCount: materials.length,
      averageScore,
      timeline: {
        startDate: minStartDate || new Date('2026-09-15'),
        midExamDate: midExamDate || new Date('2026-11-20'),
        finalExamDate: maxFinalDate || new Date('2027-01-15'),
        progressPercentage,
        currentPhase: now < (midExamDate || new Date('2026-11-20')) ? 'PRE_MID' : (now < (maxFinalDate || new Date('2027-01-15')) ? 'MID_TO_FINAL' : 'COMPLETED')
      }
    };
  }

  // Academic Timeline
  @Get('timeline')
  async getTimeline(@Req() req: any) {
    const studentId = await this.resolveStudentId(req);
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new NotFoundException('Student record not found');

    const schedules = await this.scheduleRepo.findByGrade(student.gradeLevel);
    return schedules;
  }

  // Materials Download Hub
  @Get('materials')
  async getMaterials(@Req() req: any) {
    const studentId = await this.resolveStudentId(req);
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new NotFoundException('Student record not found');

    const materials = await this.materialUseCase.getMaterialsByGrade(student.gradeLevel);
    const courses = await this.courseRepo.findByGrade(student.gradeLevel);

    // Group materials by course
    const courseGroups = courses.map(course => ({
      course,
      materials: materials.filter(m => m.courseId === course.id)
    }));

    return {
      gradeLevel: student.gradeLevel,
      courses: courseGroups
    };
  }

  // Grade Report Card (Read-only exam results table)
  @Get('report-card')
  async getReportCard(@Req() req: any, @Query('year') year?: string) {
    const studentId = await this.resolveStudentId(req);
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new NotFoundException('Student record not found');

    const courses = await this.courseRepo.findByGrade(student.gradeLevel);
    const grades = await this.gradeRepo.findByStudentId(studentId);
    const academicYear = year || '2026 E.C.';

    const reportEntries = courses.map(course => {
      const g = grades.find(record => record.courseId === course.id && record.academicYear === academicYear);
      return {
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        courseNameAmharic: course.nameAmharic,
        midMark: g?.midMark ? g.midMark.getValue() : null,
        finalMark: g?.finalMark ? g.finalMark.getValue() : null,
        totalScore: g?.totalScore ? g.totalScore.getValue() : null,
        passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
      };
    });

    const evaluatedGrades = reportEntries.filter(r => r.totalScore !== null);
    const averageScore = evaluatedGrades.length > 0
      ? Math.round((evaluatedGrades.reduce((sum, r) => sum + r.totalScore!, 0) / evaluatedGrades.length) * 100) / 100
      : null;

    const overallStatus = averageScore !== null ? (averageScore >= 50.0 ? 'PASSED' : 'FAILED') : 'PENDING';

    return {
      student,
      academicYear,
      entries: reportEntries,
      averageScore,
      overallStatus
    };
  }

  // Material File Download
  @Get('download/:id')
  async downloadMaterial(@Param('id') id: string, @Res() res: Response) {
    const material = await this.materialUseCase.getMaterialById(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const fullPath = this.fileStorage.getAbsolutePath(material.filePath);
    if (!fs.existsSync(fullPath)) {
      // If file doesn't physically exist (e.g. initial demo sample), send generated sample buffer
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(material.fileName)}.txt"`);
      res.send(`Continuous Education Monitoring Dept\nMaterial: ${material.title}\nCourse: ${material.courseNameAmharic || ''}\n\nDescription: ${material.description}`);
      return;
    }

    res.download(fullPath, material.fileName);
  }
}
