import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmtpConfig } from '../entities';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SmtpConfigService {
  constructor(
    @InjectRepository(SmtpConfig)
    private smtpConfigRepository: Repository<SmtpConfig>,
    private emailService: EmailService,
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
    
    // Créer une configuration temporaire pour le test
    const tempConfig = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      username: smtpConfig.username,
      password: smtpConfig.password,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
      starttls: smtpConfig.starttls,
      connectionTimeout: smtpConfig.connectionTimeout,
      timeout: smtpConfig.timeout,
      writeTimeout: smtpConfig.writeTimeout,
      debug: smtpConfig.debug,
    };

    try {
      // Utiliser le service email pour tester la connexion
      const result = await this.emailService.testConnectionWithConfig(tempConfig);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test de connexion: ${error.message}`,
        details: {
          error: error.message,
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
    
    // Créer une configuration temporaire pour le test
    const tempConfig = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      username: smtpConfig.username,
      password: smtpConfig.password,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
      starttls: smtpConfig.starttls,
      connectionTimeout: smtpConfig.connectionTimeout,
      timeout: smtpConfig.timeout,
      writeTimeout: smtpConfig.writeTimeout,
      debug: smtpConfig.debug,
    };

    try {
      // Utiliser le service email pour envoyer un email de test
      const result = await this.emailService.sendTestEmailWithConfig(tempConfig, testEmail);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'envoi de l'email de test: ${error.message}`,
        details: {
          error: error.message,
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