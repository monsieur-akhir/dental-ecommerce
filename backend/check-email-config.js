require('dotenv').config();

console.log('🔧 Vérification de la Configuration Email');
console.log('=' .repeat(50));

// Vérification des variables d'environnement
const requiredVars = [
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD'
];

const optionalVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_ADMIN'
];

console.log('\n📋 Variables d\'environnement requises :');
let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'EMAIL_PASSWORD' ? '***Défini***' : value}`);
  } else {
    console.log(`❌ ${varName}: Non défini`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Variables d\'environnement optionnelles :');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: Non défini (valeur par défaut utilisée)`);
  }
});

// Configuration actuelle
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  username: process.env.EMAIL_USERNAME || 'dental.ecommerce@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'your-app-password-here',
  adminEmail: process.env.EMAIL_ADMIN || 'admin@dental-ecommerce.com',
};

console.log('\n🔧 Configuration actuelle :');
console.log(`📧 Host: ${emailConfig.host}`);
console.log(`🔌 Port: ${emailConfig.port}`);
console.log(`👤 Username: ${emailConfig.username}`);
console.log(`🔑 Password: ${emailConfig.password ? '***Défini***' : '❌ Non défini'}`);
console.log(`👨‍💼 Admin Email: ${emailConfig.adminEmail}`);

// Vérifications spécifiques
console.log('\n🔍 Vérifications spécifiques :');

// Vérification Gmail
if (emailConfig.host === 'smtp.gmail.com') {
  console.log('📧 Configuration Gmail détectée');
  
  if (!emailConfig.username.includes('@gmail.com')) {
    console.log('⚠️  EMAIL_USERNAME ne semble pas être une adresse Gmail');
  } else {
    console.log('✅ EMAIL_USERNAME semble être une adresse Gmail valide');
  }
  
  if (emailConfig.password === 'your-app-password-here') {
    console.log('❌ EMAIL_PASSWORD n\'a pas été configuré');
    console.log('💡 Pour Gmail, vous devez :');
    console.log('   1. Activer l\'authentification à 2 facteurs');
    console.log('   2. Générer un mot de passe d\'application');
    console.log('   3. Utiliser ce mot de passe d\'application');
  } else if (emailConfig.password.length < 16) {
    console.log('⚠️  EMAIL_PASSWORD semble trop court pour un mot de passe d\'application Gmail');
  } else {
    console.log('✅ EMAIL_PASSWORD semble être configuré');
  }
}

// Vérification du port
if (emailConfig.port === 587) {
  console.log('✅ Port 587 (TLS) - Configuration standard');
} else if (emailConfig.port === 465) {
  console.log('✅ Port 465 (SSL) - Configuration alternative');
} else {
  console.log(`⚠️  Port ${emailConfig.port} - Port non standard`);
}

// Résumé
console.log('\n📊 Résumé :');
if (allRequiredPresent) {
  console.log('✅ Toutes les variables requises sont définies');
  console.log('🎯 Configuration prête pour les tests');
  console.log('\n💡 Prochaines étapes :');
  console.log('   1. Testez la connexion : npm run test:email');
  console.log('   2. Vérifiez les logs du backend');
  console.log('   3. Testez l\'envoi d\'un email');
} else {
  console.log('❌ Variables manquantes détectées');
  console.log('🔧 Actions requises :');
  console.log('   1. Configurez les variables manquantes dans .env');
  console.log('   2. Pour Gmail, générez un mot de passe d\'application');
  console.log('   3. Relancez cette vérification');
}

// Suggestions d'amélioration
console.log('\n💡 Suggestions d\'amélioration :');

if (!process.env.EMAIL_ADMIN) {
  console.log('   - Définissez EMAIL_ADMIN pour les notifications admin');
}

if (process.env.NODE_ENV !== 'production') {
  console.log('   - En production, assurez-vous que NODE_ENV=production');
}

console.log('\n📚 Documentation :');
console.log('   - Guide complet : DIAGNOSTIC_SMTP.md');
console.log('   - Test d\'email : npm run test:email');
console.log('   - Logs backend : npm run start:dev');

console.log('\n' + '=' .repeat(50));
console.log('🔧 Vérification terminée'); 