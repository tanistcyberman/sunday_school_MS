import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../infrastructure/security/JwtAuthGuard';
import { RolesGuard } from '../../../infrastructure/security/RolesGuard';
import { Roles } from '../../../infrastructure/security/RolesDecorator';
import { CourseOwnershipGuard } from '../guards/CourseOwnershipGuard';
import { CalculateFinalGradeUseCase, UpdateGradeDto } from '../../../application/use-cases/CalculateFinalGradeUseCase';
import { MaterialUseCase } from '../../../application/use-cases/MaterialUseCase';
import { PostgresGradeRepo } from '../../../infrastructure/database/postgres/PostgresGradeRepo';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
import { PostgresStudentRepo } from '../../../infrastructure/database/postgres/PostgresStudentRepo';

@Controller('api/teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN')
export class TeacherController {
  constructor(
    private readonly calculateGradeUseCase: CalculateFinalGradeUseCase,
    private readonly materialUseCase: MaterialUseCase,
    private readonly gradeRepo: PostgresGradeRepo,
    private readonly courseRepo: PostgresCourseRepo,
    private readonly studentRepo: PostgresStudentRepo
  ) {}

  // 1. Return ONLY courses assigned to the authenticated teacher
  @Get('my-courses')
  async getMyCourses(@Req() req: any) {
    const teacherId = req.user.sub || req.user.id;
    if (req.user.role === 'ADMIN') {
      return await this.courseRepo.findAll();
    }
    return await this.courseRepo.findByTeacherId(teacherId);
  }

  @Get('courses')
  async getCourses(@Query('grade') grade?: string) {
    if (grade) {
      return await this.courseRepo.findByGrade(parseInt(grade, 10));
    }
    return await this.courseRepo.findAll();
  }

  // 2. Fetch students specifically enrolled in the course's grade level
  @Get('courses/:courseId/students')
  @UseGuards(CourseOwnershipGuard)
  async getCourseStudents(
    @Param('courseId') courseId: string, 
    @Query('year') year?: string
  ) {
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const gradeLevel = course.gradeLevel;
    const academicYear = year || '2026 E.C.';

    const students = await this.studentRepo.findByGrade(gradeLevel);
    const existingGrades = await this.gradeRepo.findByCourseAndGrade(courseId, gradeLevel);

    return students.map(student => {
      const g = existingGrades.find(record => record.studentId === student.id && record.academicYear === academicYear);
      return {
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        fullNameAmharic: student.fullNameAmharic,
        gradeLevel: student.gradeLevel,
        courseId,
        academicYear,
        midMark: g?.midMark ? g.midMark.getValue() : null,
        finalMark: g?.finalMark ? g.finalMark.getValue() : null,
        totalScore: g?.totalScore ? g.totalScore.getValue() : null,
        passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
      };
    });
  }

  // 3. Digital Gradebook: Fetch student grades for given course and grade
  @Get('gradebook')
  async getGradebook(
    @Query('courseId') courseId: string,
    @Query('grade') grade: string,
    @Query('year') year?: string
  ) {
    if (!courseId || !grade) {
      throw new BadRequestException('courseId and grade are required parameters');
    }
    const gradeLevel = parseInt(grade, 10);
    const academicYear = year || '2026 E.C.';

    const students = await this.studentRepo.findByGrade(gradeLevel);
    const existingGrades = await this.gradeRepo.findByCourseAndGrade(courseId, gradeLevel);

    const rows = students.map(student => {
      const g = existingGrades.find(record => record.studentId === student.id && record.academicYear === academicYear);
      return {
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        fullNameAmharic: student.fullNameAmharic,
        gradeLevel: student.gradeLevel,
        courseId,
        academicYear,
        midMark: g?.midMark ? g.midMark.getValue() : null,
        finalMark: g?.finalMark ? g.finalMark.getValue() : null,
        totalScore: g?.totalScore ? g.totalScore.getValue() : null,
        passStatus: g?.passStatus ? g.passStatus.getStatus() : 'PENDING'
      };
    });

    return rows;
  }

  // 4. Update grade for course (Restful endpoint with CourseOwnershipGuard)
  @Post('courses/:courseId/grades')
  @UseGuards(CourseOwnershipGuard)
  async saveCourseGrade(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateGradeDto,
    @Req() req: any
  ) {
    return await this.calculateGradeUseCase.saveOrUpdateGrade({
      ...dto,
      courseId,
      requesterTeacherId: req.user.sub || req.user.id,
      requesterRole: req.user.role
    });
  }

  // Legacy/compatibility endpoint with CourseOwnershipGuard
  @Post('gradebook/update')
  @UseGuards(CourseOwnershipGuard)
  async updateGrade(@Body() dto: UpdateGradeDto, @Req() req: any) {
    return await this.calculateGradeUseCase.saveOrUpdateGrade({
      ...dto,
      requesterTeacherId: req.user.sub || req.user.id,
      requesterRole: req.user.role
    });
  }

  @Post('gradebook/batch')
  async batchUpdateGrades(@Body('grades') grades: UpdateGradeDto[], @Req() req: any) {
    if (!grades || !Array.isArray(grades)) {
      throw new BadRequestException('Grades array is required');
    }
    const teacherId = req.user.sub || req.user.id;
    const enriched = grades.map(g => ({
      ...g,
      requesterTeacherId: teacherId,
      requesterRole: req.user.role
    }));
    await this.calculateGradeUseCase.batchSaveGrades(enriched);
    return { success: true, count: grades.length };
  }

  // 5. Course Materials
  @Get('materials')
  async getMaterials(
    @Query('grade') grade?: string, 
    @Query('courseId') courseId?: string,
    @Req() req?: any
  ) {
    const teacherId = req?.user?.sub || req?.user?.id;
    if (courseId) {
      return await this.materialUseCase.getAllMaterials().then(m => m.filter(x => x.courseId === courseId));
    }
    if (req?.user?.role === 'TEACHER' && teacherId) {
      return await this.materialUseCase.getMaterialsByTeacher(teacherId);
    }
    if (grade) {
      return await this.materialUseCase.getMaterialsByGrade(parseInt(grade, 10));
    }
    return await this.materialUseCase.getAllMaterials();
  }

  // Restful upload endpoint with CourseOwnershipGuard
  @Post('courses/:courseId/materials')
  @UseGuards(CourseOwnershipGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit as per FR-3
  }))
  async uploadCourseMaterial(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('Material file is required');
    }
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return await this.materialUseCase.uploadMaterial({
      courseId,
      gradeLevel: course.gradeLevel,
      title: title || file.originalname,
      titleAmharic: title || file.originalname,
      description: description || '',
      uploadedByTeacherId: req.user.sub || req.user.id,
      requesterRole: req.user.role,
      file
    });
  }

  // Material upload with CourseOwnershipGuard
  @Post('materials/upload')
  @UseGuards(CourseOwnershipGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit as per FR-3
  }))
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body('courseId') courseId: string,
    @Body('gradeLevel') gradeLevel: string,
    @Body('title') title: string,
    @Body('titleAmharic') titleAmharic: string,
    @Body('description') description: string,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('Material file is required');
    }
    if (!courseId || !title) {
      throw new BadRequestException('courseId and title are required');
    }
    const course = await this.courseRepo.findById(courseId);

    return await this.materialUseCase.uploadMaterial({
      courseId,
      gradeLevel: course ? course.gradeLevel : parseInt(gradeLevel || '4', 10),
      title: titleAmharic || title,
      titleAmharic: titleAmharic || title,
      description: description || '',
      uploadedByTeacherId: req.user.sub || req.user.id,
      requesterRole: req.user.role,
      file
    });
  }

  @Delete('materials/:id')
  async deleteMaterial(@Param('id') id: string, @Req() req: any) {
    await this.materialUseCase.deleteMaterial(id, req.user.sub || req.user.id, req.user.role);
    return { success: true, id };
  }
}
