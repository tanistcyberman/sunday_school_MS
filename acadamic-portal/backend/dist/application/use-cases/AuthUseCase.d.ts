import { UserRepositoryPort } from '../ports/out/UserRepositoryPort';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../domain/entities/User';
export interface LoginDto {
    username: string;
    password: string;
}
export interface AuthResult {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
        fullName: string;
        fullNameAmharic: string;
        studentId?: string;
    };
}
export declare class AuthUseCase {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: UserRepositoryPort, jwtService: JwtService);
    login(dto: LoginDto): Promise<AuthResult>;
    getProfile(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: UserRole;
        fullName: string;
        fullNameAmharic: string;
        studentId: string;
    }>;
}
