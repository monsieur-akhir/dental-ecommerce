import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TemplateService } from './template.service';

@Module({
  providers: [EmailService, TemplateService],
  controllers: [EmailController],
  exports: [EmailService, TemplateService],
})
export class EmailModule {} 