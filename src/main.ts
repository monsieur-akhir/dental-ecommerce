import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité - Helmet pour les headers de sécurité
  app.use(helmet());

  // CORS - Configuration pour permettre les requêtes cross-origin
  app.enableCors({
    origin: true, // En production, spécifier les domaines autorisés
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Supprime les propriétés non définies dans les DTOs
    forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
    transform: true, // Transforme automatiquement les types
    disableErrorMessages: false, // Affiche les messages d'erreur détaillés
  }));

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Dental E-commerce API')
    .setDescription('API pour l\'application e-commerce de matériel dentaire')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application démarrée sur le port ${port}`);
  console.log(`📚 Documentation API: http://localhost:${port}/api/docs`);
}

bootstrap();
