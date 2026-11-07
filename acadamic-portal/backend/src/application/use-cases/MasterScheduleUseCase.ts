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

export class MasterScheduleUseCase {
  constructor(
    private readonly scheduleRepo: ScheduleRepositoryPort,
    private readonly courseRepo: CourseRepositoryPort
  ) {}

  public async getSchedulesByGrade(gradeLevel: number): Promise<Schedule[]> {
    const schedules = await this.scheduleRepo.findByGrade(gradeLevel);
    const courses = await this.courseRepo.findByGrade(gradeLevel);
    const courseMap = new Map(courses.map(c => [c.id, c]));

    return schedules.map(s => {
      const course = courseMap.get(s.courseId);
      return new Schedule(
        s.id,
        s.courseId,
        s.gradeLevel,
        s.academicYear,
        s.semester,
        s.startDate,
        s.midExamDate,
        s.finalExamDate,
        course?.name,
        course?.nameAmharic,
        s.createdAt
      );
    });
  }

  public async getAllSchedules(): Promise<Schedule[]> {
    const schedules = await this.scheduleRepo.findAll();
    const courses = await this.courseRepo.findAll();
    const courseMap = new Map(courses.map(c => [c.id, c]));

    return schedules.map(s => {
      const course = courseMap.get(s.courseId);
      return new Schedule(
        s.id,
        s.courseId,
        s.gradeLevel,
        s.academicYear,
        s.semester,
        s.startDate,
        s.midExamDate,
        s.finalExamDate,
        course?.name,
        course?.nameAmharic,
        s.createdAt
      );
    });
  }

  public async saveSchedule(dto: SaveScheduleDto): Promise<Schedule> {
    const id = dto.id || `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const schedule = new Schedule(
      id,
      dto.courseId,
      dto.gradeLevel,
      dto.academicYear,
      dto.semester,
      new Date(dto.startDate),
      new Date(dto.midExamDate),
      new Date(dto.finalExamDate)
    );
    return await this.scheduleRepo.save(schedule);
  }
}
