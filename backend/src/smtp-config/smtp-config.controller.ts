import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SmtpConfigService } from './smtp-config.service';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@Controller('smtp-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class SmtpConfigController {
  constructor(private readonly smtpConfigService: SmtpConfigService) {}

  @Post()
  create(@Body() createSmtpConfigDto: CreateSmtpConfigDto) {
    return this.smtpConfigService.create(createSmtpConfigDto);
  }

  @Get()
  findAll() {
    return this.smtpConfigService.findAll();
  }

  @Get('active')
  findActive() {
    return this.smtpConfigService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smtpConfigService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmtpConfigDto: UpdateSmtpConfigDto) {
    return this.smtpConfigService.update(+id, updateSmtpConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smtpConfigService.remove(+id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.smtpConfigService.activate(+id);
  }

  @Post(':id/test-connection')
  testConnection(@Param('id') id: string) {
    return this.smtpConfigService.testConnection(+id);
  }

  @Post(':id/test-email')
  testEmail(
    @Param('id') id: string,
    @Body() body: { email: string }
  ) {
    return this.smtpConfigService.testEmail(+id, body.email);
  }
} 