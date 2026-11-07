import { ScheduleRepositoryPort } from '../../../application/ports/out/ScheduleRepositoryPort';
import { Schedule } from '../../../domain/entities/Schedule';
import { DatabaseService } from './DatabaseService';
export declare class PostgresScheduleRepo implements ScheduleRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<Schedule | null>;
    findByGrade(gradeLevel: number): Promise<Schedule[]>;
    findByCourse(courseId: string): Promise<Schedule | null>;
    findAll(): Promise<Schedule[]>;
    save(schedule: Schedule): Promise<Schedule>;
    private mapRow;
}
