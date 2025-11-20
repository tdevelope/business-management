import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
    JwtModule.register({
        secret: 'SUPER_SECRET_KEY',
        signOptions: { expiresIn: '3h' },
    }),
    PrismaModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
