import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SmtpConfigService } from './smtp-config.service';

async function initializeSmtpConfig() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const smtpConfigService = app.get(SmtpConfigService);

  try {
    console.log('🔧 Initialisation de la configuration SMTP...');

    // Vérifier s'il existe déjà une configuration
    const existingConfigs = await smtpConfigService.findAll();
    
    if (existingConfigs.length > 0) {
      console.log('✅ Des configurations SMTP existent déjà');
      console.log(`📊 Nombre de configurations: ${existingConfigs.length}`);
      
      const activeConfig = existingConfigs.find(config => config.isActive);
      if (activeConfig) {
        console.log(`✅ Configuration active: ${activeConfig.description || activeConfig.host}`);
      } else {
        console.log('⚠️  Aucune configuration active trouvée');
      }
      
      return;
    }

    // Créer une configuration par défaut
    const defaultConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      username: 'dental.ecommerce@gmail.com',
      password: 'your-app-password-here',
      adminEmail: 'admin@dental-ecommerce.com',
      secure: false,
      auth: true,
      starttls: true,
      connectionTimeout: 5000,
      timeout: 3000,
      writeTimeout: 5000,
      debug: false,
      isActive: true,
      description: 'Configuration Gmail par défaut'
    };

    console.log('📝 Création de la configuration par défaut...');
    const newConfig = await smtpConfigService.create(defaultConfig);
    
    console.log('✅ Configuration SMTP créée avec succès !');
    console.log(`📧 ID: ${newConfig.id}`);
    console.log(`🌐 Host: ${newConfig.host}:${newConfig.port}`);
    console.log(`👤 Username: ${newConfig.username}`);
    console.log(`📋 Description: ${newConfig.description}`);
    console.log(`✅ Active: ${newConfig.isActive ? 'Oui' : 'Non'}`);
    
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Connectez-vous à l\'interface d\'administration');
    console.log('2. Allez dans "Configuration SMTP"');
    console.log('3. Modifiez la configuration avec vos vraies informations');
    console.log('4. Testez la connexion et l\'envoi d\'email');
    console.log('5. Activez la configuration');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    await app.close();
  }
}

// Exécuter le script
initializeSmtpConfig().catch(console.error); 