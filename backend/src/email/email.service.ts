import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config';
import { TemplateService } from './template.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly templateService: TemplateService) {
    this.createTransporter();
  }

  private createTransporter() {
    this.logger.log(`🔧 Création du transporteur SMTP...`);
    this.logger.log(`🔧 Host: ${emailConfig.host}`);
    this.logger.log(`🔧 Port: ${emailConfig.port}`);
    this.logger.log(`🔧 Username: ${emailConfig.username}`);
    this.logger.log(`🔧 Secure: ${emailConfig.secure}`);
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
      },
    } as any);
  }

  // Méthode pour tester la connexion SMTP
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log(`🧪 Test de connexion SMTP...`);
      this.logger.log(`🔧 Configuration: ${emailConfig.host}:${emailConfig.port}`);
      
      await this.transporter.verify();
      
      this.logger.log(`✅ Connexion SMTP réussie !`);
      return {
        success: true,
        message: 'Connexion SMTP réussie',
        details: {
          host: emailConfig.host,
          port: emailConfig.port,
          username: emailConfig.username
        }
      };
    } catch (error) {
      this.logger.error(`❌ Échec de la connexion SMTP:`);
      this.logger.error(`❌ Type d'erreur: ${error.name}`);
      this.logger.error(`❌ Message d'erreur: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      
      return {
        success: false,
        message: `Échec de la connexion SMTP: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          host: emailConfig.host,
          port: emailConfig.port,
          username: emailConfig.username
        }
      };
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log(`📧 Tentative d'envoi d'email à ${options.to}`);
      this.logger.log(`📧 Sujet: ${options.subject}`);
      this.logger.log(`📧 Configuration SMTP: ${emailConfig.host}:${emailConfig.port}`);
      this.logger.log(`📧 Utilisateur SMTP: ${emailConfig.username}`);

      const mailOptions = {
        from: `"Dental E-commerce" <${emailConfig.username}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      this.logger.log(`📤 Envoi en cours...`);
      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`✅ Email envoyé avec succès à ${options.to}`);
      this.logger.log(`📨 Message ID: ${result.messageId}`);
      this.logger.log(`📬 Destinataires acceptés: ${result.accepted.join(', ')}`);
      this.logger.log(`📭 Destinataires rejetés: ${result.rejected.join(', ')}`);
      this.logger.log(`📊 Réponse du serveur: ${result.response}`);
      
      return {
        success: true,
        message: `Email envoyé avec succès à ${options.to}`,
        details: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          response: result.response
        }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi d'email à ${options.to}:`);
      this.logger.error(`❌ Type d'erreur: ${error.name}`);
      this.logger.error(`❌ Message d'erreur: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      this.logger.error(`❌ Stack trace: ${error.stack}`);
      
      // Logs spécifiques selon le type d'erreur
      if (error.code === 'EAUTH') {
        this.logger.error(`🔐 Erreur d'authentification SMTP - Vérifiez EMAIL_USERNAME et EMAIL_PASSWORD`);
      } else if (error.code === 'ECONNECTION') {
        this.logger.error(`🌐 Erreur de connexion SMTP - Vérifiez EMAIL_HOST et EMAIL_PORT`);
      } else if (error.code === 'ETIMEDOUT') {
        this.logger.error(`⏰ Timeout de connexion SMTP - Vérifiez votre connexion internet`);
      } else if (error.code === 'ENOTFOUND') {
        this.logger.error(`🔍 Serveur SMTP introuvable - Vérifiez EMAIL_HOST`);
      }
      
      return {
        success: false,
        message: `Erreur lors de l'envoi d'email: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          stack: error.stack
        }
      };
    }
  }

  // Email de bienvenue
  async sendWelcomeEmail(userEmail: string, firstName: string): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`🎉 Envoi d'email de bienvenue à ${userEmail} pour ${firstName}`);
    const html = this.templateService.renderWelcomeEmail(firstName);

    const result = await this.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur Dental E-commerce',
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de bienvenue envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de bienvenue à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de confirmation de commande
  async sendOrderConfirmationEmail(userEmail: string, firstName: string, orderNumber: string, orderTotal: number): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`🛒 Envoi d'email de confirmation de commande #${orderNumber} à ${userEmail}`);
    
    const orderData = {
      orderNumber,
      orderDate: new Date().toLocaleDateString('fr-FR'),
      total: orderTotal.toFixed(2),
      id: orderNumber // Utiliser le numéro de commande comme ID temporaire
    };
    
    const html = this.templateService.renderOrderConfirmationEmail(firstName, orderData);

    const result = await this.sendEmail({
      to: userEmail,
      subject: `Confirmation de commande #${orderNumber}`,
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de confirmation de commande envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de confirmation de commande à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de réinitialisation de mot de passe
  async sendPasswordResetEmail(userEmail: string, firstName: string, resetToken: string): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`🔐 Envoi d'email de réinitialisation de mot de passe à ${userEmail}`);
    
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`;
    const html = this.templateService.renderPasswordResetEmail(firstName, resetUrl);

    const result = await this.sendEmail({
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe',
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de réinitialisation de mot de passe envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de réinitialisation de mot de passe à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de notification de livraison
  async sendShippingNotificationEmail(userEmail: string, firstName: string, orderNumber: string, trackingNumber?: string): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`📦 Envoi d'email de notification d'expédition #${orderNumber} à ${userEmail}`);
    
    const orderData = {
      orderNumber,
      orderDate: new Date().toLocaleDateString('fr-FR'),
      total: '0.00',
      id: orderNumber
    };
    
    const trackingInfo = {
      carrier: 'Transporteur standard',
      trackingNumber: trackingNumber || 'En cours de génération',
      shippingDate: new Date().toLocaleDateString('fr-FR'),
      trackingUrl: `http://localhost:3001/orders/${orderNumber}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    };
    
    const html = this.templateService.renderShippingNotificationEmail(firstName, orderData, trackingInfo);

    const result = await this.sendEmail({
      to: userEmail,
      subject: `Commande expédiée #${orderNumber}`,
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de notification d'expédition envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de notification d'expédition à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de confirmation de réinitialisation de mot de passe réussie
  async sendPasswordResetSuccessEmail(userEmail: string, firstName: string): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`✅ Envoi d'email de confirmation de réinitialisation de mot de passe à ${userEmail}`);
    
    const html = this.templateService.renderPasswordResetSuccessEmail(firstName);

    const result = await this.sendEmail({
      to: userEmail,
      subject: 'Mot de passe mis à jour avec succès',
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de confirmation de réinitialisation envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de confirmation de réinitialisation à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de changement de mot de passe
  async sendPasswordChangeEmail(userEmail: string, firstName: string): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`🔒 Envoi d'email de changement de mot de passe à ${userEmail}`);
    
    const html = this.templateService.renderPasswordChangeEmail(firstName);

    const result = await this.sendEmail({
      to: userEmail,
      subject: 'Votre mot de passe a été modifié',
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de changement de mot de passe envoyé avec succès à ${userEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de changement de mot de passe à ${userEmail}: ${result.message}`);
    }

    return result;
  }

  // Email de notification de commande (pour l'admin)
  async sendOrderNotificationToAdmin(orderData: any): Promise<{ success: boolean; message: string; details?: any }> {
    const adminEmail = emailConfig.adminEmail || emailConfig.username;
    this.logger.log(`👨‍💼 Envoi d'email de notification admin pour commande #${orderData.orderNumber} à ${adminEmail}`);
    
    const html = this.templateService.renderOrderNotificationToAdmin(orderData);

    const result = await this.sendEmail({
      to: adminEmail,
      subject: `Nouvelle commande #${orderData.orderNumber}`,
      html,
    });

    if (result.success) {
      this.logger.log(`✅ Email de notification admin envoyé avec succès à ${adminEmail}`);
    } else {
      this.logger.error(`❌ Échec de l'envoi de l'email de notification admin à ${adminEmail}: ${result.message}`);
    }

    return result;
  }

  // Méthode pour tester la connexion avec une configuration spécifique
  async testConnectionWithConfig(config: any): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log(`🧪 Test de connexion SMTP avec configuration personnalisée...`);
      this.logger.log(`🔧 Configuration: ${config.host}:${config.port}`);
      
      const tempTransporter = nodemailer.createTransport({
        service: 'gmail',
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
        connectionTimeout: config.connectionTimeout,
        timeout: config.timeout,
        writeTimeout: config.writeTimeout,
        debug: config.debug,
      } as any);

      await tempTransporter.verify();
      
      this.logger.log(`✅ Connexion SMTP réussie avec la configuration personnalisée !`);
      return {
        success: true,
        message: 'Connexion SMTP réussie avec la configuration personnalisée',
        details: {
          host: config.host,
          port: config.port,
          username: config.username
        }
      };
    } catch (error) {
      this.logger.error(`❌ Échec de la connexion SMTP avec configuration personnalisée:`);
      this.logger.error(`❌ Type d'erreur: ${error.name}`);
      this.logger.error(`❌ Message d'erreur: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      
      return {
        success: false,
        message: `Échec de la connexion SMTP: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          host: config.host,
          port: config.port,
          username: config.username
        }
      };
    }
  }

  // Méthode pour envoyer un email de test avec une configuration spécifique
  async sendTestEmailWithConfig(config: any, testEmail: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log(`🧪 Envoi d'email de test avec configuration personnalisée à ${testEmail}`);
      
      const tempTransporter = nodemailer.createTransport({
        service: 'gmail',
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
        connectionTimeout: config.connectionTimeout,
        timeout: config.timeout,
        writeTimeout: config.writeTimeout,
        debug: config.debug,
      } as any);

      const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Test de Configuration SMTP</h1>
          <p>Ceci est un email de test pour vérifier la configuration SMTP.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Détails de la configuration</h3>
            <p><strong>Host:</strong> ${config.host}</p>
            <p><strong>Port:</strong> ${config.port}</p>
            <p><strong>Username:</strong> ${config.username}</p>
            <p><strong>Date de test:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement !</p>
        </div>
      `;

      const result = await tempTransporter.sendMail({
        from: `"Test SMTP" <${config.username}>`,
        to: testEmail,
        subject: 'Test de Configuration SMTP - Dental E-commerce',
        html: testHtml,
      });

      this.logger.log(`✅ Email de test envoyé avec succès à ${testEmail}`);
      this.logger.log(`📨 Message ID: ${result.messageId}`);

      return {
        success: true,
        message: `Email de test envoyé avec succès à ${testEmail}`,
        details: {
          messageId: result.messageId,
          host: config.host,
          port: config.port,
          username: config.username
        }
      };
    } catch (error) {
      this.logger.error(`❌ Échec de l'envoi d'email de test avec configuration personnalisée:`);
      this.logger.error(`❌ Type d'erreur: ${error.name}`);
      this.logger.error(`❌ Message d'erreur: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      
      return {
        success: false,
        message: `Échec de l'envoi d'email de test: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          host: config.host,
          port: config.port,
          username: config.username
        }
      };
    }
  }
} 