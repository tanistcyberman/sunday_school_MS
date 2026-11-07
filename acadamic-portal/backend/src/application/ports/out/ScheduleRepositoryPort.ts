import { Schedule } from '../../../domain/entities/Schedule';

export interface ScheduleRepositoryPort {
  findById(id: string): Promise<Schedule | null>;
  findByGrade(gradeLevel: number): Promise<Schedule[]>;
  findByCourse(courseId: string): Promise<Schedule | null>;
  findAll(): Promise<Schedule[]>;
  save(schedule: Schedule): Promise<Schedule>;
}
