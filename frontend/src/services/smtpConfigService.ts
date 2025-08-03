import api from './api';

export interface SmtpConfig {
  id: number;
  host: string;
  port: number;
  username: string;
  password: string;
  adminEmail?: string;
  secure: boolean;
  auth: boolean;
  starttls: boolean;
  connectionTimeout: number;
  timeout: number;
  writeTimeout: number;
  debug: boolean;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmtpConfigDto {
  host: string;
  port: number;
  username: string;
  password: string;
  adminEmail?: string;
  secure?: boolean;
  auth?: boolean;
  starttls?: boolean;
  connectionTimeout?: number;
  timeout?: number;
  writeTimeout?: number;
  debug?: boolean;
  isActive?: boolean;
  description?: string;
}

export interface UpdateSmtpConfigDto extends Partial<CreateSmtpConfigDto> {}

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

class SmtpConfigService {
  private baseUrl = '/smtp-config';

  // Récupérer toutes les configurations SMTP
  async getAll(): Promise<SmtpConfig[]> {
    const response = await api.get(this.baseUrl);
    return response.data;
  }

  // Récupérer la configuration active
  async getActive(): Promise<SmtpConfig | null> {
    const response = await api.get(`${this.baseUrl}/active`);
    return response.data;
  }

  // Récupérer une configuration par ID
  async getById(id: number): Promise<SmtpConfig> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Créer une nouvelle configuration
  async create(config: CreateSmtpConfigDto): Promise<SmtpConfig> {
    const response = await api.post(this.baseUrl, config);
    return response.data;
  }

  // Mettre à jour une configuration
  async update(id: number, config: UpdateSmtpConfigDto): Promise<SmtpConfig> {
    const response = await api.patch(`${this.baseUrl}/${id}`, config);
    return response.data;
  }

  // Supprimer une configuration
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Activer une configuration
  async activate(id: number): Promise<SmtpConfig> {
    const response = await api.post(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }

  // Tester la connexion SMTP
  async testConnection(id: number): Promise<TestResult> {
    const response = await api.post(`${this.baseUrl}/${id}/test-connection`);
    return response.data;
  }

  // Tester l'envoi d'email
  async testEmail(id: number, email: string): Promise<TestResult> {
    const response = await api.post(`${this.baseUrl}/${id}/test-email`, { email });
    return response.data;
  }

  // Obtenir les configurations prédéfinies
  getPresetConfigs() {
    return {
      gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration Gmail standard'
      },
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration Outlook/Hotmail'
      },
      yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration Yahoo Mail'
      },
      sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration SendGrid'
      },
      synelia: {
        host: 'mail.synelia.tech',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration Synelia Tech'
      },
      custom: {
        host: '',
        port: 587,
        secure: false,
        auth: true,
        starttls: true,
        connectionTimeout: 5000,
        timeout: 3000,
        writeTimeout: 5000,
        debug: false,
        description: 'Configuration personnalisée'
      }
    };
  }
}

export const smtpConfigService = new SmtpConfigService(); 