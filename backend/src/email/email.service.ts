import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config';
import { TemplateService } from './template.service';
import { SmtpConfigService } from '../smtp-config/smtp-config.service';

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

  constructor(
    private readonly templateService: TemplateService,
    private readonly smtpConfigService: SmtpConfigService
  ) {
    // Le transporteur sera créé lors du premier envoi d'email
  }

  private async createTransporter() {
    try {
      this.logger.log(`🔧 Création du transporteur SMTP...`);
      
      // Récupérer la configuration SMTP active depuis la base de données
      const activeConfig = await this.smtpConfigService.getConfigForEmailService();
      
      this.logger.log(`🔧 Configuration active: ${activeConfig.host}:${activeConfig.port}`);
      this.logger.log(`🔧 Username: ${activeConfig.username}`);
      this.logger.log(`🔧 Secure: ${activeConfig.secure}`);
      
      this.transporter = nodemailer.createTransport({
        host: activeConfig.host,
        port: activeConfig.port,
        secure: activeConfig.secure,
        auth: {
          user: activeConfig.username,
          pass: activeConfig.password,
        },
        connectionTimeout: activeConfig.connectionTimeout,
        timeout: activeConfig.timeout,
        writeTimeout: activeConfig.writeTimeout,
        debug: activeConfig.debug,
        logger: activeConfig.debug ? this.logger : false,
      } as any);
      
      this.logger.log(`✅ Transporteur SMTP créé avec succès !`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la création du transporteur SMTP: ${error.message}`);
      // Fallback vers la configuration par défaut
      this.logger.log(`🔄 Utilisation de la configuration par défaut...`);
      
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.username,
          pass: emailConfig.password,
        },
      } as any);
    }
  }

  // Méthode pour tester la connexion SMTP
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log(`🧪 Test de connexion SMTP...`);
      
      // Recréer le transporteur avec la configuration active
      await this.createTransporter();
      
      await this.transporter.verify();
      
      // Récupérer la configuration active pour les détails
      const activeConfig = await this.smtpConfigService.getConfigForEmailService();
      
      this.logger.log(`✅ Connexion SMTP réussie !`);
      return {
        success: true,
        message: 'Connexion SMTP réussie',
        details: {
          host: activeConfig.host,
          port: activeConfig.port,
          username: activeConfig.username
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
          name: error.name
        }
      };
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string; details?: any }> {
    const startTime = Date.now();
    const emailId = Math.random().toString(36).substring(2, 15);
    
    try {
      this.logger.log(`📧 [${emailId}] Début d'envoi d'email à ${options.to}`);
      this.logger.log(`📧 [${emailId}] Sujet: ${options.subject}`);
      this.logger.log(`📧 [${emailId}] Taille du contenu HTML: ${options.html.length} caractères`);
      
      // Recréer le transporteur avec la configuration active
      this.logger.log(`🔧 [${emailId}] Création du transporteur SMTP...`);
      await this.createTransporter();
      
      // Récupérer la configuration active
      const activeConfig = await this.smtpConfigService.getConfigForEmailService();
      
      this.logger.log(`📧 [${emailId}] Configuration SMTP: ${activeConfig.host}:${activeConfig.port}`);
      this.logger.log(`📧 [${emailId}] Utilisateur SMTP: ${activeConfig.username}`);
      this.logger.log(`📧 [${emailId}] Mode sécurisé: ${activeConfig.secure ? 'Oui' : 'Non'}`);

      const mailOptions = {
        from: `"Dental E-commerce" <${activeConfig.username}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      this.logger.log(`📤 [${emailId}] Envoi en cours...`);
      const sendStartTime = Date.now();
      const result = await this.transporter.sendMail(mailOptions);
      const sendDuration = Date.now() - sendStartTime;
      const totalDuration = Date.now() - startTime;
      
      this.logger.log(`✅ [${emailId}] Email envoyé avec succès à ${options.to}`);
      this.logger.log(`📨 [${emailId}] Message ID: ${result.messageId}`);
      this.logger.log(`📬 [${emailId}] Destinataires acceptés: ${result.accepted.join(', ')}`);
      this.logger.log(`📭 [${emailId}] Destinataires rejetés: ${result.rejected.join(', ')}`);
      this.logger.log(`📊 [${emailId}] Réponse du serveur: ${result.response}`);
      this.logger.log(`⏱️ [${emailId}] Durée d'envoi: ${sendDuration}ms`);
      this.logger.log(`⏱️ [${emailId}] Durée totale: ${totalDuration}ms`);
      
      return {
        success: true,
        message: `Email envoyé avec succès à ${options.to}`,
        details: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          response: result.response,
          sendDuration,
          totalDuration
        }
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      
      this.logger.error(`❌ [${emailId}] Erreur lors de l'envoi d'email à ${options.to}:`);
      this.logger.error(`❌ [${emailId}] Type d'erreur: ${error.name}`);
      this.logger.error(`❌ [${emailId}] Message d'erreur: ${error.message}`);
      this.logger.error(`❌ [${emailId}] Code d'erreur: ${error.code}`);
      this.logger.error(`❌ [${emailId}] Durée avant erreur: ${totalDuration}ms`);
      this.logger.error(`❌ [${emailId}] Stack trace: ${error.stack}`);
      
      // Logs spécifiques selon le type d'erreur
      if (error.code === 'EAUTH') {
        this.logger.error(`🔐 [${emailId}] Erreur d'authentification SMTP - Vérifiez les identifiants SMTP`);
      } else if (error.code === 'ECONNECTION') {
        this.logger.error(`🌐 [${emailId}] Erreur de connexion SMTP - Vérifiez l'hôte et le port SMTP`);
      } else if (error.code === 'ETIMEDOUT') {
        this.logger.error(`⏰ [${emailId}] Timeout de connexion SMTP - Vérifiez votre connexion internet`);
      } else if (error.code === 'ENOTFOUND') {
        this.logger.error(`🔍 [${emailId}] Serveur SMTP introuvable - Vérifiez l'hôte SMTP`);
      } else if (error.code === 'EAUTH') {
        this.logger.error(`🔐 [${emailId}] Erreur d'authentification - Vérifiez username/password`);
      }
      
      return {
        success: false,
        message: `Erreur lors de l'envoi d'email: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          stack: error.stack,
          totalDuration
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
    const testId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    try {
      this.logger.log(`🧪 [${testId}] Test de connexion SMTP avec configuration personnalisée...`);
      this.logger.log(`🔧 [${testId}] Configuration: ${config.host}:${config.port}`);
      this.logger.log(`🔧 [${testId}] Username: ${config.username}`);
      this.logger.log(`🔧 [${testId}] Secure: ${config.secure}`);
      this.logger.log(`🔧 [${testId}] Timeout: ${config.timeout}ms`);
      
      this.logger.log(`🔧 [${testId}] Création du transporteur temporaire...`);
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

      this.logger.log(`🔧 [${testId}] Test de vérification de la connexion...`);
      await tempTransporter.verify();
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ [${testId}] Connexion SMTP réussie avec la configuration personnalisée !`);
      this.logger.log(`⏱️ [${testId}] Durée du test: ${duration}ms`);
      
      return {
        success: true,
        message: 'Connexion SMTP réussie avec la configuration personnalisée',
        details: {
          host: config.host,
          port: config.port,
          username: config.username,
          duration
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`❌ [${testId}] Échec de la connexion SMTP avec configuration personnalisée:`);
      this.logger.error(`❌ [${testId}] Type d'erreur: ${error.name}`);
      this.logger.error(`❌ [${testId}] Message d'erreur: ${error.message}`);
      this.logger.error(`❌ [${testId}] Code d'erreur: ${error.code}`);
      this.logger.error(`❌ [${testId}] Durée avant erreur: ${duration}ms`);
      
      return {
        success: false,
        message: `Échec de la connexion SMTP: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          host: config.host,
          port: config.port,
          username: config.username,
          duration
        }
      };
    }
  }

  // Méthode pour envoyer un email de test avec une configuration spécifique
  async sendTestEmailWithConfig(config: any, testEmail: string): Promise<{ success: boolean; message: string; details?: any }> {
    const testId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    try {
      this.logger.log(`🧪 [${testId}] Envoi d'email de test avec configuration personnalisée à ${testEmail}`);
      this.logger.log(`🔧 [${testId}] Configuration: ${config.host}:${config.port}`);
      this.logger.log(`🔧 [${testId}] Username: ${config.username}`);
      this.logger.log(`🔧 [${testId}] Secure: ${config.secure}`);
      
      this.logger.log(`🔧 [${testId}] Création du transporteur temporaire...`);
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

      this.logger.log(`📧 [${testId}] Préparation de l'email de test...`);
      this.logger.log(`📧 [${testId}] Taille du contenu HTML: ${testHtml.length} caractères`);
      
      const mailOptions = {
        from: `"Test SMTP" <${config.username}>`,
        to: testEmail,
        subject: 'Test de Configuration SMTP - Dental E-commerce',
        html: testHtml,
      };

      this.logger.log(`📤 [${testId}] Envoi de l'email de test...`);
      const sendStartTime = Date.now();
      const result = await tempTransporter.sendMail(mailOptions);
      const sendDuration = Date.now() - sendStartTime;
      const totalDuration = Date.now() - startTime;

      this.logger.log(`✅ [${testId}] Email de test envoyé avec succès à ${testEmail}`);
      this.logger.log(`📨 [${testId}] Message ID: ${result.messageId}`);
      this.logger.log(`📬 [${testId}] Destinataires acceptés: ${result.accepted?.join(', ') || 'Aucun'}`);
      this.logger.log(`📭 [${testId}] Destinataires rejetés: ${result.rejected?.join(', ') || 'Aucun'}`);
      this.logger.log(`⏱️ [${testId}] Durée d'envoi: ${sendDuration}ms`);
      this.logger.log(`⏱️ [${testId}] Durée totale: ${totalDuration}ms`);

      return {
        success: true,
        message: `Email de test envoyé avec succès à ${testEmail}`,
        details: {
          messageId: result.messageId,
          host: config.host,
          port: config.port,
          username: config.username,
          sendDuration,
          totalDuration
        }
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      
      this.logger.error(`❌ [${testId}] Échec de l'envoi d'email de test avec configuration personnalisée:`);
      this.logger.error(`❌ [${testId}] Type d'erreur: ${error.name}`);
      this.logger.error(`❌ [${testId}] Message d'erreur: ${error.message}`);
      this.logger.error(`❌ [${testId}] Code d'erreur: ${error.code}`);
      this.logger.error(`❌ [${testId}] Durée avant erreur: ${totalDuration}ms`);
      
      return {
        success: false,
        message: `Échec de l'envoi d'email de test: ${error.message}`,
        details: {
          code: error.code,
          name: error.name,
          host: config.host,
          port: config.port,
          username: config.username,
          totalDuration
        }
      };
    }
  }
} 