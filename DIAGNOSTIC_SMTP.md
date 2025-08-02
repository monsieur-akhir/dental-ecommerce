# 🔧 Guide de Diagnostic SMTP

## 🚨 Problème : "Je ne reçois pas les emails SMTP"

Ce guide vous aidera à diagnostiquer et résoudre les problèmes d'envoi d'emails.

## 📋 Checklist de Diagnostic

### 1. **Configuration des Variables d'Environnement**

Vérifiez que votre fichier `.env` contient :

```env
# Configuration SMTP Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-d-application
EMAIL_ADMIN=admin@votre-domaine.com

# Configuration de l'application
NODE_ENV=development
```

### 2. **Configuration Gmail**

#### ✅ Étapes pour configurer Gmail :

1. **Activez l'authentification à deux facteurs** :
   - Allez sur [myaccount.google.com](https://myaccount.google.com)
   - Sécurité → Authentification à 2 facteurs → Activer

2. **Générez un mot de passe d'application** :
   - Sécurité → Authentification à 2 facteurs → Mots de passe d'application
   - Sélectionnez "Mail" comme application
   - Copiez le mot de passe généré (16 caractères)

3. **Utilisez le mot de passe d'application** :
   - Remplacez `EMAIL_PASSWORD` par le mot de passe d'application
   - **NE PAS** utiliser votre mot de passe Gmail normal

### 3. **Tests de Diagnostic**

#### A. Test de Connexion SMTP

```bash
# Dans le dossier backend
npm run test:email
```

#### B. Test via l'API (Admin uniquement)

```bash
# Test de connexion
curl -X GET http://localhost:3000/api/email/test-connection \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

# Test d'envoi d'email
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "type": "welcome"
  }'
```

### 4. **Logs Détaillés**

Le système génère maintenant des logs détaillés. Vérifiez les logs du backend :

```bash
# Démarrez le backend en mode développement
npm run start:dev
```

#### Exemples de Logs de Succès :
```
[EmailService] 🔧 Création du transporteur SMTP...
[EmailService] 🔧 Host: smtp.gmail.com
[EmailService] 🔧 Port: 587
[EmailService] 🔧 Username: votre-email@gmail.com
[EmailService] 📧 Tentative d'envoi d'email à test@example.com
[EmailService] 📧 Sujet: Bienvenue sur Dental E-commerce
[EmailService] 📤 Envoi en cours...
[EmailService] ✅ Email envoyé avec succès à test@example.com
[EmailService] 📨 Message ID: <abc123@mail.gmail.com>
[EmailService] 📬 Destinataires acceptés: test@example.com
```

#### Exemples de Logs d'Erreur :
```
[EmailService] ❌ Erreur lors de l'envoi d'email à test@example.com:
[EmailService] ❌ Type d'erreur: Error
[EmailService] ❌ Message d'erreur: Invalid login
[EmailService] ❌ Code d'erreur: EAUTH
[EmailService] 🔐 Erreur d'authentification SMTP - Vérifiez EMAIL_USERNAME et EMAIL_PASSWORD
```

### 5. **Codes d'Erreur Courants**

| Code | Signification | Solution |
|------|---------------|----------|
| `EAUTH` | Erreur d'authentification | Vérifiez EMAIL_USERNAME et EMAIL_PASSWORD |
| `ECONNECTION` | Erreur de connexion | Vérifiez EMAIL_HOST et EMAIL_PORT |
| `ETIMEDOUT` | Timeout de connexion | Vérifiez votre connexion internet |
| `ENOTFOUND` | Serveur introuvable | Vérifiez EMAIL_HOST |

### 6. **Tests Spécifiques**

#### Test Email de Bienvenue
```bash
npm run test:email:welcome votre-email@example.com
```

#### Test Email de Commande
```bash
npm run test:email:order votre-email@example.com
```

#### Test Email de Changement de Mot de Passe
```bash
npm run test:email:password votre-email@example.com
```

### 7. **Vérifications Supplémentaires**

#### A. Vérifiez les Spams
- Les emails peuvent être dans le dossier "Spam" ou "Indésirables"
- Ajoutez `dental.ecommerce@gmail.com` à vos contacts

#### B. Vérifiez les Paramètres Gmail
- Assurez-vous que l'envoi d'emails via SMTP est autorisé
- Vérifiez qu'il n'y a pas de restrictions de sécurité

#### C. Vérifiez le Pare-feu
- Assurez-vous que le port 587 n'est pas bloqué
- Vérifiez les paramètres de votre antivirus

### 8. **Configuration Alternative (SendGrid)**

Si Gmail pose problème, vous pouvez utiliser SendGrid :

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=votre-api-key-sendgrid
```

### 9. **Debug Avancé**

#### A. Test de Connexion Directe
```bash
# Test avec telnet (Windows)
telnet smtp.gmail.com 587

# Test avec openssl (Linux/Mac)
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

#### B. Vérification des Variables d'Environnement
```bash
# Dans le backend
node -e "console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME)"
node -e "console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Défini' : 'Non défini')"
```

### 10. **Solutions Courantes**

#### Problème : "Invalid login"
- ✅ Utilisez un mot de passe d'application Gmail
- ✅ Vérifiez que l'authentification à 2 facteurs est activée

#### Problème : "Connection timeout"
- ✅ Vérifiez votre connexion internet
- ✅ Vérifiez que le port 587 n'est pas bloqué

#### Problème : "Authentication failed"
- ✅ Vérifiez EMAIL_USERNAME (doit être votre email Gmail complet)
- ✅ Vérifiez EMAIL_PASSWORD (doit être le mot de passe d'application)

### 11. **Contact Support**

Si le problème persiste :

1. **Collectez les logs** :
   ```bash
   npm run start:dev > logs.txt 2>&1
   ```

2. **Testez la configuration** :
   ```bash
   npm run test:email
   ```

3. **Fournissez** :
   - Les logs d'erreur complets
   - Le résultat du test de connexion
   - Votre configuration (sans les mots de passe)

## 🎯 Résumé des Actions

1. ✅ Configurez l'authentification à 2 facteurs Gmail
2. ✅ Générez un mot de passe d'application
3. ✅ Mettez à jour votre fichier `.env`
4. ✅ Testez avec `npm run test:email`
5. ✅ Vérifiez les logs du backend
6. ✅ Vérifiez vos spams

Le système d'emails est maintenant équipé de logs détaillés pour faciliter le diagnostic ! 🚀 