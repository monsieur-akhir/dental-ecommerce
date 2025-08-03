import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmtpConfig } from '../entities/smtp-config.entity';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpConfigService {
  private readonly logger = new Logger(SmtpConfigService.name);

  constructor(
    @InjectRepository(SmtpConfig)
    private smtpConfigRepository: Repository<SmtpConfig>,
  ) {}

  async create(createSmtpConfigDto: CreateSmtpConfigDto): Promise<SmtpConfig> {
    // Vérifier s'il n'y a qu'une seule configuration active
    if (createSmtpConfigDto.isActive) {
      await this.smtpConfigRepository.update(
        { isActive: true },
        { isActive: false }
      );
    }

    const smtpConfig = this.smtpConfigRepository.create(createSmtpConfigDto);
    return this.smtpConfigRepository.save(smtpConfig);
  }

  async findAll(): Promise<SmtpConfig[]> {
    return this.smtpConfigRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<SmtpConfig> {
    const smtpConfig = await this.smtpConfigRepository.findOne({ where: { id } });
    if (!smtpConfig) {
      throw new NotFoundException(`Configuration SMTP avec l'ID ${id} non trouvée`);
    }
    return smtpConfig;
  }

  async findActive(): Promise<SmtpConfig | null> {
    return this.smtpConfigRepository.findOne({ where: { isActive: true } });
  }

  async update(id: number, updateSmtpConfigDto: UpdateSmtpConfigDto): Promise<SmtpConfig> {
    const smtpConfig = await this.findOne(id);

    // Si on active cette configuration, désactiver les autres
    if (updateSmtpConfigDto.isActive) {
      await this.smtpConfigRepository.update(
        { isActive: true },
        { isActive: false }
      );
    }

    Object.assign(smtpConfig, updateSmtpConfigDto);
    return this.smtpConfigRepository.save(smtpConfig);
  }

  async remove(id: number): Promise<void> {
    const smtpConfig = await this.findOne(id);
    await this.smtpConfigRepository.remove(smtpConfig);
  }

  async activate(id: number): Promise<SmtpConfig> {
    const smtpConfig = await this.findOne(id);

    // Désactiver toutes les autres configurations
    await this.smtpConfigRepository.update(
      { isActive: true },
      { isActive: false }
    );

    // Activer cette configuration
    smtpConfig.isActive = true;
    return this.smtpConfigRepository.save(smtpConfig);
  }

  async testConnection(id: number): Promise<{ success: boolean; message: string; details?: any }> {
    const smtpConfig = await this.findOne(id);
    
    this.logger.log(`🔧 Test de connexion SMTP - Configuration ID: ${id}`);
    this.logger.log(`🔧 Host: ${smtpConfig.host}:${smtpConfig.port}`);
    this.logger.log(`🔧 Username: ${smtpConfig.username}`);
    this.logger.log(`🔧 Secure: ${smtpConfig.secure}`);
    this.logger.log(`🔧 Timeout: ${smtpConfig.timeout}ms`);
    
    try {
      // Créer un transporteur temporaire pour le test
      this.logger.log(`🔧 Création du transporteur SMTP...`);
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        },
        connectionTimeout: smtpConfig.connectionTimeout,
        timeout: smtpConfig.timeout,
        writeTimeout: smtpConfig.writeTimeout,
        debug: smtpConfig.debug,
      } as any);

      // Tester la connexion
      this.logger.log(`🔧 Test de vérification de la connexion...`);
      await transporter.verify();
      
      this.logger.log(`✅ Connexion SMTP réussie pour ${smtpConfig.host}:${smtpConfig.port}`);
      
      return {
        success: true,
        message: 'Connexion SMTP réussie',
        details: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          username: smtpConfig.username
        }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors du test de connexion SMTP: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      this.logger.error(`❌ Nom de l'erreur: ${error.name}`);
      
      return {
        success: false,
        message: `Erreur lors du test de connexion: ${error.message}`,
        details: {
          error: error.message,
          code: error.code,
          name: error.name,
          config: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            username: smtpConfig.username
          }
        }
      };
    }
  }

  async testEmail(id: number, testEmail: string): Promise<{ success: boolean; message: string; details?: any }> {
    const smtpConfig = await this.findOne(id);
    
    this.logger.log(`📧 Test d'envoi d'email - Configuration ID: ${id}`);
    this.logger.log(`📧 Destinataire: ${testEmail}`);
    this.logger.log(`📧 Expéditeur: ${smtpConfig.username}`);
    this.logger.log(`📧 Host: ${smtpConfig.host}:${smtpConfig.port}`);
    
    try {
      // Créer un transporteur temporaire pour le test
      this.logger.log(`🔧 Création du transporteur SMTP pour l'envoi...`);
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        },
        connectionTimeout: smtpConfig.connectionTimeout,
        timeout: smtpConfig.timeout,
        writeTimeout: smtpConfig.writeTimeout,
        debug: smtpConfig.debug,
      } as any);

      // Envoyer un email de test
      const mailOptions = {
        from: `"Test SMTP" <${smtpConfig.username}>`,
        to: testEmail,
        subject: 'Test de configuration SMTP - Dental E-commerce',
        html: `
          <h2>Test de configuration SMTP</h2>
          <p>Cet email confirme que votre configuration SMTP fonctionne correctement.</p>
          <p><strong>Configuration utilisée :</strong></p>
          <ul>
            <li>Host: ${smtpConfig.host}</li>
            <li>Port: ${smtpConfig.port}</li>
            <li>Username: ${smtpConfig.username}</li>
          </ul>
          <p>Date du test: ${new Date().toLocaleString('fr-FR')}</p>
        `,
        text: `
          Test de configuration SMTP
          
          Cet email confirme que votre configuration SMTP fonctionne correctement.
          
          Configuration utilisée :
          - Host: ${smtpConfig.host}
          - Port: ${smtpConfig.port}
          - Username: ${smtpConfig.username}
          
          Date du test: ${new Date().toLocaleString('fr-FR')}
        `
      };

      this.logger.log(`📧 Préparation de l'email de test...`);
      this.logger.log(`📧 Sujet: ${mailOptions.subject}`);
      this.logger.log(`📧 De: ${mailOptions.from}`);
      this.logger.log(`📧 À: ${mailOptions.to}`);

      this.logger.log(`📧 Envoi de l'email de test...`);
      const result = await transporter.sendMail(mailOptions);
      
      this.logger.log(`✅ Email de test envoyé avec succès !`);
      this.logger.log(`✅ Message ID: ${result.messageId}`);
      this.logger.log(`✅ Acceptés: ${result.accepted?.length || 0}`);
      this.logger.log(`✅ Rejetés: ${result.rejected?.length || 0}`);
      
      return {
        success: true,
        message: 'Email de test envoyé avec succès',
        details: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          host: smtpConfig.host,
          port: smtpConfig.port,
          username: smtpConfig.username
        }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email de test: ${error.message}`);
      this.logger.error(`❌ Code d'erreur: ${error.code}`);
      this.logger.error(`❌ Nom de l'erreur: ${error.name}`);
      this.logger.error(`❌ Configuration utilisée: ${smtpConfig.host}:${smtpConfig.port}`);
      
      return {
        success: false,
        message: `Erreur lors de l'envoi de l'email de test: ${error.message}`,
        details: {
          error: error.message,
          code: error.code,
          name: error.name,
          config: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            username: smtpConfig.username
          }
        }
      };
    }
  }

  async getConfigForEmailService(): Promise<any> {
    const activeConfig = await this.findActive();
    if (!activeConfig) {
      throw new BadRequestException('Aucune configuration SMTP active trouvée');
    }

    return {
      host: activeConfig.host,
      port: activeConfig.port,
      username: activeConfig.username,
      password: activeConfig.password,
      adminEmail: activeConfig.adminEmail,
      secure: activeConfig.secure,
      auth: activeConfig.auth,
      starttls: activeConfig.starttls,
      connectionTimeout: activeConfig.connectionTimeout,
      timeout: activeConfig.timeout,
      writeTimeout: activeConfig.writeTimeout,
      debug: activeConfig.debug,
    };
  }
} 