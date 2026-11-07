import { AuthUseCase, LoginDto } from '../../../application/use-cases/AuthUseCase';
export declare class AuthController {
    private readonly authUseCase;
    constructor(authUseCase: AuthUseCase);
    login(dto: LoginDto): Promise<import("../../../application/use-cases/AuthUseCase").AuthResult>;
    getMe(req: any): Promise<{
        id: string;
        username: string;
        email: string;
        role: import("../../../domain/entities/User").UserRole;
        fullName: string;
        fullNameAmharic: string;
        studentId: string;
    }>;
}
