import { User } from '../../../domain/entities/User';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAllTeachers(): Promise<User[]>;
  save(user: User): Promise<User>;
}
