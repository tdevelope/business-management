import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService);
    private generateToken;
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
