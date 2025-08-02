const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration email
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  username: process.env.EMAIL_USERNAME || 'dental.ecommerce@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'your-app-password-here',
  secure: false,
  auth: true,
  starttls: true,
  connectionTimeout: 5000,
  timeout: 3000,
  writeTimeout: 5000,
  debug: process.env.NODE_ENV === 'development',
};

// Créer le transporteur
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
});

// Template d'email de test
const createTestEmail = (type) => {
  const templates = {
    welcome: {
      subject: 'Test - Email de Bienvenue',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bienvenue sur Dental E-commerce !</h1>
          <p>Bonjour Test User,</p>
          <p>Ceci est un email de test pour vérifier le système d'emails.</p>
          <p>Votre compte a été créé avec succès et vous pouvez dès maintenant :</p>
          <ul>
            <li>Parcourir notre catalogue de produits</li>
            <li>Ajouter des articles à votre panier</li>
            <li>Suivre vos commandes</li>
            <li>Gérer votre liste de souhaits</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="http://localhost:3001/products" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Commencer mes achats
            </a>
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Cet email a été envoyé par Dental E-commerce
          </p>
        </div>
      `
    },
    order: {
      subject: 'Test - Confirmation de Commande',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Commande confirmée !</h1>
          <p>Bonjour Test User,</p>
          <p>Nous avons bien reçu votre commande et nous vous remercions pour votre confiance.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Détails de la commande</h3>
            <p><strong>Numéro de commande :</strong> TEST-001</p>
            <p><strong>Date de commande :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Total :</strong> 150.00 €</p>
            <p><strong>Statut :</strong> En cours de traitement</p>
          </div>
          <p style="margin-top: 30px;">
            <a href="http://localhost:3001/orders/TEST-001" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Voir ma commande
            </a>
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Cet email a été envoyé par Dental E-commerce
          </p>
        </div>
      `
    },
    password: {
      subject: 'Test - Changement de Mot de Passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Mot de passe modifié !</h1>
          <p>Bonjour Test User,</p>
          <p>Nous confirmons que votre mot de passe a été modifié avec succès.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Informations de sécurité</h3>
            <p><strong>Date de modification :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure de modification :</strong> ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p><strong>IP de connexion :</strong> Votre appareil actuel</p>
          </div>
          <p style="margin-top: 30px;">
            <a href="http://localhost:3001/profile" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Accéder à mon compte
            </a>
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Cet email a été envoyé par Dental E-commerce
          </p>
        </div>
      `
    }
  };

  return templates[type] || templates.welcome;
};

// Fonction de test de connexion SMTP
async function testConnection() {
  try {
    console.log('🔍 Test de connexion SMTP...');
    console.log(`🔧 Configuration : ${emailConfig.host}:${emailConfig.port}`);
    console.log(`👤 Utilisateur : ${emailConfig.username}`);
    
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !');
    return true;
  } catch (error) {
    console.error('❌ Échec de la connexion SMTP :');
    console.error(`❌ Type d'erreur : ${error.name}`);
    console.error(`❌ Message d'erreur : ${error.message}`);
    console.error(`❌ Code d'erreur : ${error.code}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Problème d\'authentification SMTP :');
      console.log('1. Vérifiez votre EMAIL_USERNAME et EMAIL_PASSWORD');
      console.log('2. Pour Gmail, utilisez un mot de passe d\'application');
      console.log('3. Activez l\'authentification à deux facteurs sur votre compte Gmail');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Problème de connexion SMTP :');
      console.log('1. Vérifiez votre connexion internet');
      console.log('2. Vérifiez les paramètres EMAIL_HOST et EMAIL_PORT');
      console.log('3. Vérifiez que le service SMTP est accessible');
    }
    
    return false;
  }
}

// Fonction de test d'envoi d'email
async function testEmail(type = 'welcome', recipientEmail) {
  try {
    console.log(`🧪 Test d'envoi d'email : ${type}`);
    console.log(`📧 Destinataire : ${recipientEmail}`);
    console.log(`🔧 Configuration SMTP : ${emailConfig.host}:${emailConfig.port}`);

    // Vérifier la configuration
    if (!emailConfig.username || !emailConfig.password) {
      console.error('❌ Configuration email manquante !');
      console.log('📝 Veuillez configurer EMAIL_USERNAME et EMAIL_PASSWORD dans votre fichier .env');
      return false;
    }

    // Tester d'abord la connexion
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Impossible de se connecter au serveur SMTP');
      return false;
    }

    // Créer l'email de test
    const testEmail = createTestEmail(type);

    // Options de l'email
    const mailOptions = {
      from: `"Dental E-commerce Test" <${emailConfig.username}>`,
      to: recipientEmail,
      subject: testEmail.subject,
      html: testEmail.html,
    };

    // Envoyer l'email
    console.log('📤 Envoi en cours...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email envoyé avec succès !');
    console.log(`📨 Message ID : ${result.messageId}`);
    console.log(`📧 Destinataire : ${result.accepted.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Problème d\'authentification SMTP :');
      console.log('1. Vérifiez votre EMAIL_USERNAME et EMAIL_PASSWORD');
      console.log('2. Pour Gmail, utilisez un mot de passe d\'application');
      console.log('3. Activez l\'authentification à deux facteurs sur votre compte Gmail');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Problème de connexion SMTP :');
      console.log('1. Vérifiez votre connexion internet');
      console.log('2. Vérifiez les paramètres EMAIL_HOST et EMAIL_PORT');
      console.log('3. Vérifiez que le service SMTP est accessible');
    }
    
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test du Système d\'Emails - Dental E-commerce');
  console.log('=' .repeat(50));

  // Récupérer les arguments
  const args = process.argv.slice(2);
  const type = args[0] || 'welcome';
  const recipientEmail = args[1] || 'test@example.com';

  console.log(`📋 Type d'email : ${type}`);
  console.log(`📧 Email de test : ${recipientEmail}`);
  console.log('');

  // Types d'emails disponibles
  const availableTypes = ['welcome', 'order', 'password'];
  
  if (!availableTypes.includes(type)) {
    console.error(`❌ Type d'email invalide : ${type}`);
    console.log(`📝 Types disponibles : ${availableTypes.join(', ')}`);
    process.exit(1);
  }

  // Tester l'envoi d'email
  const success = await testEmail(type, recipientEmail);

  if (success) {
    console.log('\n🎉 Test réussi ! Le système d\'emails fonctionne correctement.');
    console.log('📝 Vérifiez votre boîte de réception (et les spams) pour voir l\'email de test.');
  } else {
    console.log('\n💥 Test échoué ! Veuillez vérifier la configuration.');
    process.exit(1);
  }
}

// Instructions d'utilisation
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('📧 Test du Système d\'Emails - Dental E-commerce');
  console.log('');
  console.log('Usage :');
  console.log('  node test-email.js [type] [email]');
  console.log('');
  console.log('Arguments :');
  console.log('  type    Type d\'email à tester (welcome, order, password) [défaut: welcome]');
  console.log('  email   Adresse email de test [défaut: test@example.com]');
  console.log('');
  console.log('Exemples :');
  console.log('  node test-email.js');
  console.log('  node test-email.js welcome user@example.com');
  console.log('  node test-email.js order client@example.com');
  console.log('  node test-email.js password user@example.com');
  console.log('');
  console.log('Configuration :');
  console.log('  Assurez-vous d\'avoir configuré les variables d\'environnement :');
  console.log('  - EMAIL_USERNAME');
  console.log('  - EMAIL_PASSWORD');
  console.log('  - EMAIL_HOST (optionnel)');
  console.log('  - EMAIL_PORT (optionnel)');
  process.exit(0);
}

// Exécuter le test
main().catch(console.error); 