import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

interface TestEmailDto {
  email: string;
  firstName: string;
  type: 'welcome' | 'order' | 'password' | 'reset' | 'shipping';
  orderNumber?: string;
  orderTotal?: number;
  resetToken?: string;
  trackingNumber?: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test-connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async testConnection() {
    return this.emailService.testConnection();
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async testEmail(@Body() testEmailDto: TestEmailDto) {
    const { email, firstName, type, orderNumber, orderTotal, resetToken, trackingNumber } = testEmailDto;

    try {
      let result;

      switch (type) {
        case 'welcome':
          result = await this.emailService.sendWelcomeEmail(email, firstName);
          break;
        
        case 'order':
          if (!orderNumber || !orderTotal) {
            return {
              success: false,
              message: 'orderNumber et orderTotal sont requis pour le type "order"'
            };
          }
          result = await this.emailService.sendOrderConfirmationEmail(email, firstName, orderNumber, orderTotal);
          break;
        
        case 'password':
          result = await this.emailService.sendPasswordChangeEmail(email, firstName);
          break;
        
        case 'reset':
          if (!resetToken) {
            return {
              success: false,
              message: 'resetToken est requis pour le type "reset"'
            };
          }
          result = await this.emailService.sendPasswordResetEmail(email, firstName, resetToken);
          break;
        
        case 'shipping':
          if (!orderNumber) {
            return {
              success: false,
              message: 'orderNumber est requis pour le type "shipping"'
            };
          }
          result = await this.emailService.sendShippingNotificationEmail(email, firstName, orderNumber, trackingNumber);
          break;
        
        default:
          return {
            success: false,
            message: `Type d'email non supporté: ${type}. Types supportés: welcome, order, password, reset, shipping`
          };
      }

      return {
        success: result.success,
        message: result.message,
        details: result.details,
        testInfo: {
          type,
          email,
          firstName,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test d'email: ${error.message}`,
        details: {
          error: error.message,
          stack: error.stack
        }
      };
    }
  }

  @Post('test-admin-notification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async testAdminNotification(@Body() orderData: any) {
    try {
      const result = await this.emailService.sendOrderNotificationToAdmin(orderData);
      
      return {
        success: result.success,
        message: result.message,
        details: result.details,
        testInfo: {
          type: 'admin-notification',
          orderData,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test de notification admin: ${error.message}`,
        details: {
          error: error.message,
          stack: error.stack
        }
      };
    }
  }
} 