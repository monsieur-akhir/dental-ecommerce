import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { 
  User, Role, Product, Category, Order, OrderItem, Image, 
  Wishlist, Comparison, Notification, ChatSession, ChatMessage,
  Promotion, PromoCode, UserPromotion 
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes par défaut
      max: 1000, // Maximum 1000 entrées en cache
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 60 secondes
          limit: 100, // 100 requêtes par minute
        },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT') || '3306'),
        username: configService.get('DB_USERNAME') || 'root',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_NAME') || 'dental_ecommerce',
        entities: [
          User, Role, Product, Category, Order, OrderItem, Image,
          Wishlist, Comparison, Notification, ChatSession, ChatMessage,
          Promotion, PromoCode, UserPromotion
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        timezone: '+00:00',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UsersModule,
    UploadsModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

