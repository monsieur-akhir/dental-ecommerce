import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TemplateService } from './template.service';
import { SmtpConfigModule } from '../smtp-config/smtp-config.module';

@Module({
  imports: [SmtpConfigModule],
  providers: [EmailService, TemplateService],
  controllers: [EmailController],
  exports: [EmailService, TemplateService],
})
export class EmailModule {} 