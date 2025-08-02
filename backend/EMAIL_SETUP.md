# Configuration Email - Dental E-commerce

## 📧 Configuration Gmail SMTP

Ce projet utilise Gmail SMTP pour l'envoi d'emails automatiques (bienvenue, confirmation de commande, etc.).

### 🔧 Étapes de configuration

#### 1. Préparer votre compte Gmail

1. **Activez l'authentification à 2 facteurs** sur votre compte Google :
   - Allez sur [myaccount.google.com](https://myaccount.google.com)
   - Sécurité > Authentification à 2 facteurs
   - Activez l'authentification à 2 facteurs

2. **Générez un mot de passe d'application** :
   - Allez dans Sécurité > Authentification à 2 facteurs
   - Cliquez sur "Mots de passe d'application"
   - Sélectionnez "Mail" dans le menu déroulant
   - Cliquez sur "Générer"
   - Copiez le mot de passe généré (16 caractères)

#### 2. Configuration des variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` avec les variables suivantes :

```env
# Configuration Email Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-d-application
```

#### 3. Variables disponibles

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `EMAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Port SMTP | `587` |
| `EMAIL_USERNAME` | Votre email Gmail | `dental.ecommerce@gmail.com` |
| `EMAIL_PASSWORD` | Mot de passe d'application | `your-app-password-here` |

### 🧪 Test de la configuration

#### Test avec le script Node.js

```bash
# Dans le dossier backend/
node test-email.js
```

#### Test via l'API

```bash
# Test d'envoi d'email (nécessite un token JWT)
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "Ceci est un test"
  }'

# Test d'email de bienvenue
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John"
  }'
```

### 📧 Types d'emails disponibles

#### 1. Email de bienvenue
- **Déclencheur** : Inscription d'un nouvel utilisateur
- **Endpoint** : Automatique lors de l'inscription
- **Test** : `POST /api/email/welcome`

#### 2. Email de confirmation de commande
- **Déclencheur** : Création d'une nouvelle commande
- **Endpoint** : `POST /api/email/order-confirmation`
- **Données** : email, firstName, orderNumber, orderTotal

#### 3. Email de réinitialisation de mot de passe
- **Déclencheur** : Demande de réinitialisation
- **Endpoint** : À implémenter dans le service d'authentification

#### 4. Email de notification de livraison
- **Déclencheur** : Mise à jour du statut de commande
- **Endpoint** : À implémenter dans le service de commandes

### 🔒 Sécurité

- **Ne commitez jamais** votre fichier `.env` dans Git
- **Utilisez des mots de passe d'application** spécifiques pour chaque service
- **Limitez l'accès** aux endpoints d'email en production
- **Surveillez les logs** pour détecter les abus

### 🚨 Dépannage

#### Erreur d'authentification (EAUTH)
```
❌ Erreur lors du test email: Invalid login
```

**Solutions :**
- Vérifiez que l'authentification à 2 facteurs est activée
- Vérifiez que le mot de passe d'application est correct
- Régénérez un nouveau mot de passe d'application

#### Erreur de connexion (ECONNECTION)
```
❌ Erreur lors du test email: Connection timeout
```

**Solutions :**
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par votre pare-feu
- Essayez avec le port 465 (SSL) si nécessaire

#### Erreur de quota dépassé
```
❌ Erreur lors du test email: Quota exceeded
```

**Solutions :**
- Gmail limite à 500 emails par jour pour les comptes gratuits
- Utilisez un compte Gmail Business pour plus de quota
- Implémentez une file d'attente pour les emails

### 📝 Notes importantes

1. **Environnement de développement** : Les emails sont envoyés en arrière-plan pour ne pas bloquer les requêtes
2. **Logs** : Tous les envois d'emails sont loggés dans la console
3. **Templates** : Les templates HTML sont inclus dans le service EmailService
4. **Internationalisation** : Les emails sont en français par défaut

### 🔄 Intégration avec les services

Le service EmailService est intégré dans :
- **AuthService** : Email de bienvenue lors de l'inscription
- **OrdersService** : Email de confirmation de commande (à implémenter)
- **UsersService** : Email de réinitialisation de mot de passe (à implémenter)

### 📊 Monitoring

Pour surveiller l'envoi d'emails en production :
1. Activez les logs détaillés : `EMAIL_DEBUG=true`
2. Surveillez les métriques d'envoi
3. Configurez des alertes en cas d'échec 