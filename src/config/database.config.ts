import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Role, User, Category, Product, Image, Order, OrderItem } from '../entities';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dental_ecommerce',
  entities: [Role, User, Category, Product, Image, Order, OrderItem],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: '+00:00',
};

