// backend/src/business-settings/blocked-times.controller.ts
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard"; // עדכני נתיב
import { BlockedTimesService } from "./blocked-times.service";
import { CreateBlockedTimeDto } from "./dto/create-blocked-time.dto";
import { UpdateBlockedTimeDto } from "./dto/update-blocked-time.dto";

@UseGuards(JwtAuthGuard)
@Controller("business-settings/blocked-times")
export class BlockedTimesController {
  constructor(private readonly service: BlockedTimesService) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== "admin") {
      throw new ForbiddenException("Admins only");
    }
  }

  @Get()
  findAll(@Req() req) {
    this.ensureAdmin(req);
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateBlockedTimeDto, @Req() req) {
    this.ensureAdmin(req);
    return this.service.create(dto);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBlockedTimeDto,
    @Req() req,
  ) {
    this.ensureAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id: number, @Req() req) {
    this.ensureAdmin(req);
    return this.service.delete(id);
  }
}
