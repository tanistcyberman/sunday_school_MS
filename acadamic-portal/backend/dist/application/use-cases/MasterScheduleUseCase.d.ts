import { ScheduleRepositoryPort } from '../ports/out/ScheduleRepositoryPort';
import { CourseRepositoryPort } from '../ports/out/CourseRepositoryPort';
import { Schedule } from '../../domain/entities/Schedule';
export interface SaveScheduleDto {
    id?: string;
    courseId: string;
    gradeLevel: number;
    academicYear: string;
    semester: string;
    startDate: string | Date;
    midExamDate: string | Date;
    finalExamDate: string | Date;
}
export declare class MasterScheduleUseCase {
    private readonly scheduleRepo;
    private readonly courseRepo;
    constructor(scheduleRepo: ScheduleRepositoryPort, courseRepo: CourseRepositoryPort);
    getSchedulesByGrade(gradeLevel: number): Promise<Schedule[]>;
    getAllSchedules(): Promise<Schedule[]>;
    saveSchedule(dto: SaveScheduleDto): Promise<Schedule>;
}
