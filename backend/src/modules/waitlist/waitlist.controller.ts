import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistService } from './waitlist.service';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';

@Controller('waitlist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WaitlistController {
    constructor(private readonly waitlistService: WaitlistService) { }

    @Post()
    @Roles('customer', 'admin')
    create(@Req() req, @Body() dto: CreateWaitlistDto) {
        dto.userId = req.user.id;
        return this.waitlistService.create(dto);
    }

    @Get()
    @Roles('admin')
    findAll() {
        return this.waitlistService.findAll();
    }

    @Get(':id')
    @Roles('admin')
    findOne(@Param('id') id: string) {
        return this.waitlistService.findOne(+id);
    }

    @Get('my-waitlist')
    @Roles('customer')
    getMyWaitlist(@Req() req) {
        const userId = req.user.id;
        return this.waitlistService.findManyByUser(userId);
    }

    @Post('update/:id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateWaitlistDto) {
        return this.waitlistService.update(+id, dto);
    }

    @Post('update-my/:id')
    @Roles('customer')
    updateMy(@Req() req, @Param('id') id: string, @Body() dto: UpdateWaitlistDto) {
        const userId = req.user.id;
        return this.waitlistService.updateIfOwner(+id, userId, dto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.waitlistService.remove(+id);
    }
}
