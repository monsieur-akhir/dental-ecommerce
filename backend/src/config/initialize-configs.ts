import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConfigService } from './config.service';

async function initializeConfigurations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);

  try {
    console.log('Initialisation des configurations par défaut...');
    await configService.initializeDefaultConfigurations();
    console.log('✅ Configurations initialisées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des configurations:', error);
  } finally {
    await app.close();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeConfigurations();
}

export { initializeConfigurations }; 