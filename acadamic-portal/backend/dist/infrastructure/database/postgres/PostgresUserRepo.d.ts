import { UserRepositoryPort } from '../../../application/ports/out/UserRepositoryPort';
import { User } from '../../../domain/entities/User';
import { DatabaseService } from './DatabaseService';
export declare class PostgresUserRepo implements UserRepositoryPort {
    private readonly db;
    constructor(db: DatabaseService);
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findAllTeachers(): Promise<User[]>;
    save(user: User): Promise<User>;
    private mapRow;
}
