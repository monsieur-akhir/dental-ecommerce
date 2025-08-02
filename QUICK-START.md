# 🚀 Démarrage Rapide - Dental E-commerce

## Configuration des Ports ✅

- **Backend (NestJS)** : Port 3000
- **Frontend (React)** : Port 3001

## Installation et Démarrage

### 1. Installation des dépendances
```bash
npm run install:all
```

### 2. Configuration de la base de données
Assurez-vous que MySQL est démarré et configuré dans `backend/.env`

### 3. Initialisation des configurations
```bash
npm run init:configs
```

### 4. Démarrage des services
```bash
npm run start:dev
```

## URLs d'accès

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000/api
- **Documentation API** : http://localhost:3000/api/docs

## Scripts disponibles

```bash
# Démarrage automatique des deux services
npm run start:dev

# Démarrage manuel du backend
npm run start:backend

# Démarrage manuel du frontend
npm run start:frontend

# Initialisation des configurations
npm run init:configs
```

## Dépannage rapide

### Ports déjà utilisés
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
lsof -i :3001
kill -9 <PID>
```

### Erreur de connexion API
1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez la variable `REACT_APP_API_URL` dans le frontend
3. Vérifiez la configuration CORS dans le backend

## Structure des ports

```
Frontend (3001) ←→ Backend (3000)
```

## Support

- **Guide complet** : `README-DEVELOPMENT.md`
- **Documentation technique** : `REMOVAL_OF_MOCK_DATA.md`
- **API Docs** : http://localhost:3000/api/docs 