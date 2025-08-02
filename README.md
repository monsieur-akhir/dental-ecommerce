# Dental E-Commerce - Site E-commerce de Matériel Dentaire

Une application e-commerce complète développée avec NestJS (backend) et React (frontend) pour la vente de matériel dentaire professionnel.

## 🚀 Fonctionnalités

### Frontend (React)
- **Authentification** : Inscription, connexion, gestion des sessions JWT
- **Catalogue produits** : Navigation, filtrage par catégorie, recherche
- **Panier** : Ajout/suppression de produits, gestion des quantités
- **Commandes** : Processus de commande complet avec choix du paiement
- **Espace client** : Historique des commandes, profil utilisateur
- **Back-office admin** : Gestion des produits, catégories, commandes, utilisateurs

### Backend (NestJS)
- **API REST** : Endpoints complets pour toutes les fonctionnalités
- **Authentification JWT** : Sécurisation avec guards par rôle
- **Base de données** : TypeORM avec MariaDB
- **Upload d'images** : Gestion des images produits avec Multer
- **Validation** : DTOs avec class-validator
- **Documentation** : Swagger (optionnel)

## 🛠 Stack Technique

- **Backend** : NestJS, TypeORM, JWT, Multer, bcryptjs
- **Frontend** : React, TypeScript, Axios, React Router DOM, Tailwind CSS
- **Base de données** : MariaDB
- **Déploiement** : Docker, docker-compose
- **Authentification** : JWT avec guards par rôle (admin/client)

## 📁 Structure du Projet

```
dental-ecommerce/
├── backend/backend/          # Application NestJS
│   ├── src/
│   │   ├── entities/         # Entités TypeORM
│   │   ├── auth/            # Module d'authentification
│   │   ├── products/        # Module des produits
│   │   ├── categories/      # Module des catégories
│   │   ├── orders/          # Module des commandes
│   │   ├── users/           # Module des utilisateurs
│   │   ├── uploads/         # Module d'upload
│   │   └── dashboard/       # Module du tableau de bord
│   ├── Dockerfile
│   └── .env
├── frontend/                # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── contexts/        # Contextes React (Auth, Cart)
│   │   ├── services/        # Services API
│   │   └── types/           # Types TypeScript
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml       # Configuration Docker
```

## 🚀 Installation et Déploiement

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- Git

### 1. Cloner le projet
```bash
git clone <repository-url>
cd dental-ecommerce
```

### 2. Déploiement avec Docker (Recommandé)

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier que les services sont démarrés
docker-compose ps
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000
- **Base de données** : localhost:3306

### 3. Installation manuelle (Développement)

#### Backend
```bash
cd backend/backend
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Base de données
```bash
# Installer MariaDB localement ou utiliser Docker
docker run -d --name mariadb \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=dental_ecommerce \
  -p 3306:3306 \
  mariadb:10.9

# Importer les données initiales
mysql -h localhost -u root -p dental_ecommerce < backend/backend/src/database/seeds/initial-data.sql
```

## 🔧 Configuration

### Variables d'environnement (Backend)

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=dental_ecommerce

# JWT
JWT_SECRET=dental-ecommerce-secret-key-change-in-production

# Application
NODE_ENV=development
PORT=3000

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Variables d'environnement (Frontend)

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 👤 Comptes de démonstration

### Administrateur
- **Email** : admin@dental-ecommerce.com
- **Mot de passe** : admin123

### Client (à créer via inscription)
- Créez un compte client via la page d'inscription

## 📊 Base de Données

### Entités principales
- **User** : Utilisateurs (admin/client)
- **Role** : Rôles utilisateur
- **Product** : Produits
- **Category** : Catégories de produits
- **Order** : Commandes
- **OrderItem** : Articles de commande
- **Image** : Images des produits

### Relations
- User ↔ Role (Many-to-One)
- User ↔ Order (One-to-Many)
- Product ↔ Category (Many-to-Many)
- Product ↔ Image (One-to-Many)
- Order ↔ OrderItem (One-to-Many)
- Product ↔ OrderItem (One-to-Many)

## 🔐 Sécurité

- **Authentification JWT** avec expiration
- **Guards par rôle** (admin/client)
- **Validation des données** avec DTOs
- **Hashage des mots de passe** avec bcryptjs
- **CORS configuré** pour le frontend
- **Validation des uploads** d'images

## 📱 Fonctionnalités Détaillées

### Interface Client
- Navigation par catégories
- Recherche et filtrage des produits
- Fiche produit détaillée avec images
- Panier persistant (localStorage)
- Processus de commande sécurisé
- Historique des commandes
- Gestion du profil

### Back-office Admin
- Tableau de bord avec statistiques
- CRUD complet des produits
- Gestion des catégories
- Suivi des commandes
- Gestion des utilisateurs
- Inventaire et alertes stock
- Upload d'images multiples

### API Backend
- Endpoints RESTful complets
- Documentation Swagger
- Gestion des erreurs
- Pagination des résultats
- Filtrage et recherche
- Upload de fichiers
- Statistiques et rapports

## 🧪 Tests

```bash
# Backend
cd backend/backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm test
```

## 📦 Production

### Optimisations
- Build optimisé React
- Compression Nginx
- Cache des assets statiques
- Variables d'environnement sécurisées
- Logs structurés

### Monitoring
- Logs applicatifs
- Métriques de performance
- Surveillance de la base de données

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les issues GitHub
3. Créez une nouvelle issue si nécessaire

## 🔄 Mises à jour

### Version 1.0.0
- ✅ Authentification complète
- ✅ Gestion des produits et catégories
- ✅ Système de commandes
- ✅ Interface d'administration
- ✅ Déploiement Docker

### Roadmap
- [ ] Système de paiement réel (Stripe/PayPal)
- [ ] Notifications email
- [ ] Système de reviews/avis
- [ ] Programme de fidélité
- [ ] API mobile
- [ ] Intégration ERP

