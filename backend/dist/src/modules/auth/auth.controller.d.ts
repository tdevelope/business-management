import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: {
        name: string;
        email: string;
        password: string;
        role: string;
    }): Promise<{
        token: string;
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
    }>;
}
