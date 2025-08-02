# Guide de Développement - Dental E-commerce

## Configuration des Ports

Le projet utilise deux ports différents pour éviter les conflits :

- **Backend (NestJS)** : Port 3000
- **Frontend (React)** : Port 3001

## Installation

### 1. Installation des dépendances

```bash
# Installation de toutes les dépendances
npm run install:all

# Ou installation manuelle
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configuration de la base de données

Assurez-vous que votre base de données MySQL est configurée et accessible.

### 3. Initialisation des configurations

```bash
npm run init:configs
```

## Démarrage des Services

### Option 1 : Démarrage automatique (recommandé)

```bash
# Démarrer les deux services simultanément
npm run start:dev
```

### Option 2 : Démarrage manuel

**Terminal 1 - Backend :**
```bash
npm run start:backend
# ou
cd backend && npm run start:dev
```

**Terminal 2 - Frontend :**
```bash
npm run start:frontend
# ou
cd frontend && PORT=3001 npm start
```

### Option 3 : Scripts système

**Linux/Mac :**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows (PowerShell) :**
```powershell
.\start-dev.ps1
```

## URLs d'accès

Une fois les services démarrés, vous pouvez accéder à :

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000/api
- **Documentation API** : http://localhost:3000/api/docs

## Structure des Ports

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   React         │    │    NestJS       │
│   Port: 3001    │◄──►│   Port: 3000    │
│                 │    │                 │
│ http://localhost│    │ http://localhost│
│ :3001           │    │ :3000/api       │
└─────────────────┘    └─────────────────┘
```

## Variables d'environnement

### Frontend (.env.local)

Créez un fichier `.env.local` dans le dossier `frontend/` :

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### Backend (.env)

Assurez-vous que votre fichier `.env` dans le dossier `backend/` contient :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=dental_ecommerce
```

## Commandes utiles

```bash
# Initialiser les configurations
npm run init:configs

# Construire le frontend pour la production
npm run build

# Construire le backend
npm run build:backend

# Lancer les tests
npm run test

# Migrations de base de données
npm run db:migrate

# Seeding de base de données
npm run db:seed
```

## Dépannage

### Port déjà utilisé

Si vous obtenez une erreur "port already in use" :

1. **Vérifiez les processus en cours :**
   ```bash
   # Linux/Mac
   lsof -i :3000
   lsof -i :3001
   
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. **Arrêtez les processus :**
   ```bash
   # Linux/Mac
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

### Erreur de connexion à l'API

Si le frontend ne peut pas se connecter au backend :

1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez la variable `REACT_APP_API_URL` dans le frontend
3. Vérifiez la configuration CORS dans le backend

### Erreur de base de données

1. Vérifiez que MySQL est démarré
2. Vérifiez les paramètres de connexion dans le fichier `.env` du backend
3. Vérifiez que la base de données existe

## Développement

### Structure du projet

```
dental-ecommerce/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── entities/        # Entités TypeORM
│   │   ├── auth/           # Authentification
│   │   ├── products/       # Gestion des produits
│   │   ├── reviews/        # Système d'avis
│   │   └── config/         # Configuration
│   └── package.json
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   └── utils/         # Utilitaires
│   └── package.json
├── package.json           # Scripts principaux
├── start-dev.sh          # Script de démarrage (Linux/Mac)
├── start-dev.ps1         # Script de démarrage (Windows)
└── README-DEVELOPMENT.md # Ce fichier
```

### Workflow de développement

1. **Démarrez les services** : `npm run start:dev`
2. **Développez** : Les modifications sont automatiquement rechargées
3. **Testez** : Utilisez les URLs fournies ci-dessus
4. **Arrêtez** : Ctrl+C dans le terminal

## Support

Pour toute question ou problème :

1. Vérifiez ce guide de développement
2. Consultez la documentation API : http://localhost:3000/api/docs
3. Vérifiez les logs dans les terminaux
4. Consultez le fichier `REMOVAL_OF_MOCK_DATA.md` pour les détails techniques 