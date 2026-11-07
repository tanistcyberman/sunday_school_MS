import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';

@Injectable()
export class CourseOwnershipGuard implements CanActivate {
  constructor(private readonly courseRepo: PostgresCourseRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthenticated request');
    }

    // Admins bypass course ownership checks
    if (user.role === 'ADMIN') {
      return true;
    }

    // Only teachers are subject to course ownership validation
    if (user.role !== 'TEACHER') {
      throw new ForbiddenException('Only teachers and administrators can perform this action');
    }

    const courseId = request.params?.courseId || request.body?.courseId || request.query?.courseId;
    if (!courseId) {
      throw new BadRequestException('Course ID is required to verify ownership authorization');
    }

    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const userId = user.sub || user.id;
    if (!course.isOwnedBy(userId)) {
      throw new ForbiddenException('ይህንን ትምህርት ለማስተካከል ፈቃድ የለዎትም (You are not authorized to modify this course)');
    }

    // Attach course to request for downstream controller usage
    request.course = course;
    return true;
  }
}
