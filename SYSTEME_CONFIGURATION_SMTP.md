# 📧 Système de Configuration SMTP

## 🎯 Vue d'ensemble

Le système de configuration SMTP permet aux administrateurs de gérer les paramètres d'envoi d'emails directement depuis l'interface d'administration, sans avoir à modifier les fichiers de configuration ou les variables d'environnement.

## ✨ Fonctionnalités

### 🔧 **Gestion des Configurations**
- ✅ Création de multiples configurations SMTP
- ✅ Modification des paramètres existants
- ✅ Activation/désactivation de configurations
- ✅ Suppression de configurations
- ✅ Une seule configuration active à la fois

### 🧪 **Tests Intégrés**
- ✅ Test de connexion SMTP en temps réel
- ✅ Test d'envoi d'email avec configuration spécifique
- ✅ Affichage détaillé des résultats de test
- ✅ Logs d'erreur complets

### 📋 **Configurations Prédéfinies**
- ✅ Gmail (smtp.gmail.com:587)
- ✅ Outlook/Hotmail (smtp-mail.outlook.com:587)
- ✅ Yahoo Mail (smtp.mail.yahoo.com:587)
- ✅ SendGrid (smtp.sendgrid.net:587)

## 🏗️ Architecture

### **Backend (NestJS)**

#### Entité `SmtpConfig`
```typescript
@Entity('smtp_configs')
export class SmtpConfig {
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
  createdAt: Date;
  updatedAt: Date;
}
```

#### Service `SmtpConfigService`
- `create()` - Créer une nouvelle configuration
- `findAll()` - Récupérer toutes les configurations
- `findOne()` - Récupérer une configuration par ID
- `findActive()` - Récupérer la configuration active
- `update()` - Mettre à jour une configuration
- `remove()` - Supprimer une configuration
- `activate()` - Activer une configuration
- `testConnection()` - Tester la connexion SMTP
- `testEmail()` - Tester l'envoi d'email
- `getConfigForEmailService()` - Obtenir la config active pour le service email

#### Contrôleur `SmtpConfigController`
- `POST /smtp-config` - Créer une configuration
- `GET /smtp-config` - Lister toutes les configurations
- `GET /smtp-config/active` - Obtenir la configuration active
- `GET /smtp-config/:id` - Obtenir une configuration
- `PATCH /smtp-config/:id` - Mettre à jour une configuration
- `DELETE /smtp-config/:id` - Supprimer une configuration
- `POST /smtp-config/:id/activate` - Activer une configuration
- `POST /smtp-config/:id/test-connection` - Tester la connexion
- `POST /smtp-config/:id/test-email` - Tester l'envoi d'email

### **Frontend (React)**

#### Service `smtpConfigService`
```typescript
class SmtpConfigService {
  getAll(): Promise<SmtpConfig[]>
  getActive(): Promise<SmtpConfig | null>
  getById(id: number): Promise<SmtpConfig>
  create(config: CreateSmtpConfigDto): Promise<SmtpConfig>
  update(id: number, config: UpdateSmtpConfigDto): Promise<SmtpConfig>
  delete(id: number): Promise<void>
  activate(id: number): Promise<SmtpConfig>
  testConnection(id: number): Promise<TestResult>
  testEmail(id: number, email: string): Promise<TestResult>
  getPresetConfigs(): object
}
```

#### Page `SmtpConfigPage`
- Interface d'administration complète
- Formulaire de création/modification
- Liste des configurations avec actions
- Tests de connexion et d'envoi
- Configurations prédéfinies

## 🚀 Installation et Configuration

### 1. **Initialisation de la Base de Données**

La table `smtp_configs` sera créée automatiquement lors du démarrage de l'application grâce à TypeORM.

### 2. **Création d'une Configuration par Défaut**

```bash
# Dans le dossier backend
npm run init:smtp
```

### 3. **Accès à l'Interface d'Administration**

1. Connectez-vous en tant qu'administrateur
2. Allez dans le tableau de bord admin (`/admin`)
3. Cliquez sur "Configuration SMTP" dans le menu latéral

## 📝 Utilisation

### **Créer une Nouvelle Configuration**

1. Cliquez sur "Nouvelle Configuration"
2. Utilisez les configurations prédéfinies ou saisissez manuellement :
   - **Host** : Serveur SMTP (ex: smtp.gmail.com)
   - **Port** : Port SMTP (ex: 587)
   - **Username** : Adresse email
   - **Password** : Mot de passe d'application
   - **Admin Email** : Email pour les notifications admin
   - **Description** : Nom de la configuration

3. Configurez les options avancées :
   - **Secure** : Utiliser SSL/TLS
   - **Auth** : Authentification requise
   - **STARTTLS** : Utiliser STARTTLS
   - **Debug** : Activer les logs de debug
   - **Timeouts** : Délais de connexion

4. Cliquez sur "Créer"

### **Tester une Configuration**

1. Dans la liste des configurations, cliquez sur "Test Connexion"
2. Pour tester l'envoi d'email :
   - Saisissez une adresse email de test
   - Cliquez sur "Test Email"

### **Activer une Configuration**

1. Cliquez sur "Activer" dans la liste
2. La configuration précédemment active sera automatiquement désactivée

## 🔧 Configuration Gmail

### **Étapes pour Gmail**

1. **Activez l'authentification à 2 facteurs** :
   - Allez sur [myaccount.google.com](https://myaccount.google.com)
   - Sécurité → Authentification à 2 facteurs → Activer

2. **Générez un mot de passe d'application** :
   - Sécurité → Authentification à 2 facteurs → Mots de passe d'application
   - Sélectionnez "Mail" comme application
   - Copiez le mot de passe généré (16 caractères)

3. **Configurez dans l'interface admin** :
   - Host : `smtp.gmail.com`
   - Port : `587`
   - Username : Votre email Gmail
   - Password : Le mot de passe d'application (pas votre mot de passe Gmail)
   - Secure : `false`
   - Auth : `true`
   - STARTTLS : `true`

## 🧪 Tests et Diagnostic

### **Test de Connexion**
```bash
# Via l'interface admin
POST /api/smtp-config/:id/test-connection
```

### **Test d'Envoi d'Email**
```bash
# Via l'interface admin
POST /api/smtp-config/:id/test-email
Body: { "email": "test@example.com" }
```

### **Scripts de Diagnostic**
```bash
# Vérifier la configuration email
npm run check:email

# Tester l'envoi d'email
npm run test:email

# Initialiser la configuration SMTP
npm run init:smtp
```

## 🔒 Sécurité

### **Stockage des Mots de Passe**
- Les mots de passe sont stockés en base de données
- Chiffrement recommandé en production
- Accès restreint aux administrateurs uniquement

### **Validation des Données**
- Validation des adresses email
- Validation des ports (1-65535)
- Validation des timeouts
- Protection contre les injections SQL

### **Permissions**
- Seuls les administrateurs peuvent accéder à l'interface
- Authentification JWT requise
- Vérification des rôles utilisateur

## 📊 Monitoring

### **Logs d'Activité**
- Création de configurations
- Modifications de configurations
- Tests de connexion
- Tests d'envoi d'email
- Activations/désactivations

### **Métriques**
- Nombre de configurations
- Configuration active
- Dernière modification
- Statut des tests

## 🚨 Dépannage

### **Problèmes Courants**

#### Configuration non active
```
Erreur: Aucune configuration SMTP active trouvée
Solution: Activez une configuration dans l'interface admin
```

#### Erreur d'authentification
```
Erreur: Invalid login
Solution: Vérifiez le mot de passe d'application (Gmail)
```

#### Erreur de connexion
```
Erreur: Connection timeout
Solution: Vérifiez le host et le port
```

### **Logs de Debug**
Activez l'option "Debug" dans la configuration pour obtenir des logs détaillés.

## 🔄 Migration depuis les Variables d'Environnement

### **Ancien Système**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=user@gmail.com
EMAIL_PASSWORD=password
EMAIL_ADMIN=admin@example.com
```

### **Nouveau Système**
1. Créez une configuration via l'interface admin
2. Utilisez les mêmes paramètres
3. Activez la configuration
4. Supprimez les variables d'environnement email

## 📈 Améliorations Futures

### **Fonctionnalités Avancées**
- [ ] Chiffrement des mots de passe en base
- [ ] Rotation automatique des configurations
- [ ] Monitoring en temps réel
- [ ] Notifications de changement de configuration
- [ ] Historique des modifications
- [ ] Export/import de configurations

### **Intégrations**
- [ ] Support OAuth2 pour Gmail
- [ ] Intégration avec des services tiers (SendGrid, Mailgun)
- [ ] Webhooks pour les notifications
- [ ] API REST complète

## 📞 Support

### **En Cas de Problème**
1. Vérifiez les logs de l'application
2. Testez la configuration via l'interface admin
3. Consultez la documentation de diagnostic SMTP
4. Contactez l'équipe de support

### **Ressources**
- [Guide de Diagnostic SMTP](DIAGNOSTIC_SMTP.md)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation TypeORM](https://typeorm.io/)
- [Documentation Nodemailer](https://nodemailer.com/)

---

**Le système de configuration SMTP est maintenant opérationnel ! 🎉**

Vous pouvez gérer vos configurations d'email directement depuis l'interface d'administration sans avoir à modifier les fichiers de configuration. 