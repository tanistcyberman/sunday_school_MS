import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PostgresCourseRepo } from '../../../infrastructure/database/postgres/PostgresCourseRepo';
export declare class CourseOwnershipGuard implements CanActivate {
    private readonly courseRepo;
    constructor(courseRepo: PostgresCourseRepo);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
