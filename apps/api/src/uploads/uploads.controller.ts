import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UploadsService } from './uploads.service';
import { PresignDto, StaffPresignDto } from './dto/presign.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('worker-photo-presign')
  presignWorkerPhoto(@Body() dto: PresignDto) {
    return this.uploads.presign('workers', dto.contentType);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('presign')
  presign(@Body() dto: StaffPresignDto) {
    return this.uploads.presign(dto.folder, dto.contentType);
  }
}
