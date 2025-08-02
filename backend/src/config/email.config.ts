export interface EmailConfig {
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
}

export const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  username: process.env.EMAIL_USERNAME || 'dental.ecommerce@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'your-app-password-here',
  adminEmail: process.env.EMAIL_ADMIN || 'admin@dental-ecommerce.com',
  secure: false,
  auth: true,
  starttls: true,
  connectionTimeout: 5000,
  timeout: 3000,
  writeTimeout: 5000,
  debug: process.env.NODE_ENV === 'development',
}; 