import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(
        @Body()
        dto: { name: string; email: string; password: string; role: string },
    ) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(
        @Body()
        dto: { email: string; password: string },
    ) {
        return this.authService.login(dto);
    }
}