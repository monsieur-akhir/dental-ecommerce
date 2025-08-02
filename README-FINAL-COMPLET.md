# 🦷 Dental E-commerce - Application Complète

## 📋 Vue d'ensemble

Application e-commerce complète pour matériel dentaire développée avec **NestJS** (backend) et **React** (frontend), incluant des fonctionnalités avancées et une architecture moderne.

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification & Autorisation
- **JWT Authentication** avec refresh tokens
- **Système de rôles** (Admin/Client) avec guards
- **Rate limiting** sur les endpoints sensibles
- **Validation** et sanitisation des données
- **Sécurité avancée** avec Helmet et CORS

### 🛍️ E-commerce Core
- **Catalogue produits** avec recherche et filtres
- **Gestion des catégories** hiérarchiques
- **Panier d'achat** persistant avec localStorage
- **Système de commandes** complet avec statuts
- **Gestion des stocks** avec vérifications
- **Upload d'images** sécurisé pour les produits

### ❤️ Fonctionnalités Utilisateur Avancées
- **Wishlist/Favoris** avec statistiques
- **Comparaison de produits** (jusqu'à 4 produits)
- **Notifications push** avec types et statuts
- **Chat support client** en temps réel
- **Système de promotions** et codes promo

### 🎯 Système de Promotions Complet
- **Types de promotions** :
  - Réduction en pourcentage (avec plafond)
  - Montant fixe de réduction
  - Livraison gratuite
  - Offres "Achetez X, obtenez Y"
- **Codes promo** avec limites d'usage
- **Conditions d'application** (montant minimum, produits/catégories)
- **Validation en temps réel** et calculs précis
- **Statistiques d'usage** détaillées

### 🔔 Notifications & Communication
- **Notifications push** avec types multiples
- **Chat support** avec assignation d'agents
- **Statuts de session** (attente, actif, fermé, résolu)
- **Messages temps réel** avec support de fichiers
- **Interface admin** pour gestion des conversations

### 👨‍💼 Administration Complète
- **Dashboard admin** avec statistiques
- **CRUD complet** pour tous les modules
- **Gestion des utilisateurs** avec rôles
- **Gestion des commandes** et statuts
- **Gestion des promotions** et codes promo
- **Interface de chat support**

### 🛡️ Sécurité & Performance
- **Rate limiting** global et spécifique
- **Headers de sécurité** avec Helmet
- **Validation** et sanitisation renforcées
- **Cache en mémoire** pour optimisation
- **Gestion d'erreurs** centralisée
- **Documentation API** Swagger complète

### 🐳 Déploiement & Infrastructure
- **Docker** multi-stage pour dev/prod
- **Nginx** avec SSL/TLS et rate limiting
- **MariaDB** avec données de test
- **Configuration** d'environnement sécurisée
- **Scripts de déploiement** automatisés

## 🏗️ Architecture Technique

### Backend (NestJS)
```
src/
├── auth/                 # Authentification JWT
├── users/               # Gestion des utilisateurs
├── products/            # Catalogue produits
├── categories/          # Gestion des catégories
├── orders/              # Système de commandes
├── wishlist/            # Liste de souhaits
├── comparison/          # Comparaison de produits
├── notifications/       # Notifications push
├── chat/                # Chat support client
├── promotions/          # Système de promotions
├── uploads/             # Upload d'images
├── entities/            # Entités TypeORM
├── common/              # Guards, filters, decorators
└── config/              # Configuration
```

### Frontend (React)
```
src/
├── components/          # Composants réutilisables
├── pages/               # Pages de l'application
│   ├── admin/          # Interface d'administration
│   └── ...             # Pages client
├── contexts/            # Contextes React (Auth, Cart, Wishlist)
├── services/            # Services API
├── types/               # Types TypeScript
└── ...
```

## 🚀 Installation & Démarrage

### Prérequis
- Docker & Docker Compose
- Node.js 18+ (pour développement local)
- Git

### Démarrage Rapide
```bash
# Cloner le projet
git clone <repository-url>
cd dental-ecommerce

# Développement
./deploy.sh dev

# Production
cp .env.prod.example .env.prod
# Configurer les variables d'environnement
./deploy.sh prod
```

### Accès
- **Frontend** : http://localhost:3001 (dev) / https://localhost (prod)
- **API** : http://localhost:3000/api
- **Documentation API** : http://localhost:3000/api/docs
- **Base de données** : localhost:3306

### Comptes de Test
- **Admin** : admin@dental-ecommerce.com / admin123
- **Client** : client@dental-ecommerce.com / client123

## 📊 Base de Données

### Entités Principales
- **Users** : Utilisateurs avec rôles
- **Products** : Catalogue produits
- **Categories** : Catégories hiérarchiques
- **Orders** : Commandes avec items
- **Wishlist** : Listes de souhaits
- **Comparison** : Comparaisons de produits
- **Notifications** : Notifications utilisateur
- **ChatSession/ChatMessage** : Support client
- **Promotion/PromoCode** : Système de promotions
- **Images** : Gestion des médias

### Relations
- Relations **Many-to-Many** pour wishlist/comparison
- Relations **One-to-Many** pour commandes/items
- **Cascade** et contraintes d'intégrité
- **Index** pour optimisation des requêtes

## 🔧 Configuration

### Variables d'Environnement
```env
# Base de données
DB_HOST=mariadb
DB_PORT=3306
DB_USERNAME=dental_user
DB_PASSWORD=dental_password
DB_DATABASE=dental_ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Docker Compose
- **Services** : Backend, Frontend, MariaDB, Nginx
- **Volumes** : Persistance des données et uploads
- **Networks** : Isolation des services
- **Health checks** : Monitoring des services

## 📈 Performances & Monitoring

### Optimisations Implémentées
- **Cache en mémoire** pour requêtes fréquentes
- **Pagination** sur toutes les listes
- **Lazy loading** des relations
- **Index** de base de données optimisés
- **Compression** des réponses API

### Monitoring
- **Logs** structurés avec Winston
- **Health checks** Docker
- **Métriques** d'usage des promotions
- **Statistiques** temps réel

## 🛠️ Développement

### Scripts Disponibles
```bash
# Backend
npm run start:dev      # Développement avec hot reload
npm run build          # Build de production
npm run test           # Tests unitaires
npm run lint           # Linting ESLint

# Frontend
npm start              # Développement
npm run build          # Build de production
npm test               # Tests React
```

### Standards de Code
- **TypeScript** strict mode
- **ESLint** + Prettier
- **Conventional Commits**
- **Tests unitaires** Jest
- **Documentation** JSDoc

## 🔒 Sécurité

### Mesures Implémentées
- **JWT** avec expiration et refresh
- **Rate limiting** adaptatif
- **Validation** stricte des entrées
- **Sanitisation** des données
- **Headers de sécurité** (HSTS, CSP, etc.)
- **CORS** configuré pour production
- **Upload** sécurisé avec validation

### Bonnes Pratiques
- **Mots de passe** hachés avec bcrypt
- **Tokens** stockés de manière sécurisée
- **Permissions** par rôle
- **Audit trail** des actions sensibles

## 📚 Documentation API

### Swagger/OpenAPI
- **Interface interactive** sur `/api/docs`
- **Authentification** JWT intégrée
- **Exemples** pour tous les endpoints
- **Schémas** détaillés des DTOs
- **Codes de réponse** documentés

### Endpoints Principaux
- `POST /auth/login` - Connexion
- `GET /products` - Liste des produits
- `POST /orders` - Créer une commande
- `POST /wishlist` - Ajouter aux favoris
- `POST /promotions/apply` - Appliquer un code promo
- `POST /chat/sessions` - Créer une session de chat

## 🚀 Déploiement Production

### Configuration SSL/HTTPS
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # Configuration SSL optimisée
}
```

### Variables de Production
- **Secrets** sécurisés avec Docker secrets
- **Base de données** avec réplication
- **Cache** Redis pour sessions
- **CDN** pour les assets statiques
- **Monitoring** avec Prometheus/Grafana

## 🔄 Roadmap Fonctionnalités Futures

### Phase 1 - Export & Rapports
- [ ] Export CSV/Excel des données
- [ ] Rapports de ventes avancés
- [ ] Tableaux de bord analytiques
- [ ] Métriques de performance

### Phase 2 - Paiement
- [ ] Intégration Stripe/PayPal
- [ ] Gestion des remboursements
- [ ] Facturation automatique
- [ ] Abonnements récurrents

### Phase 3 - Reviews & Social
- [ ] Système d'avis clients
- [ ] Notes et commentaires
- [ ] Partage social
- [ ] Programme de fidélité

### Phase 4 - Stocks Avancés
- [ ] Gestion multi-entrepôts
- [ ] Alertes de stock
- [ ] Prévisions de demande
- [ ] Intégration fournisseurs

### Phase 5 - Mobile & PWA
- [ ] Application mobile React Native
- [ ] Progressive Web App
- [ ] Notifications push natives
- [ ] Mode hors ligne

## 🤝 Contribution

### Guide de Contribution
1. **Fork** le projet
2. **Créer** une branche feature
3. **Développer** avec tests
4. **Documenter** les changements
5. **Soumettre** une pull request

### Standards
- **Tests** obligatoires pour nouvelles fonctionnalités
- **Documentation** mise à jour
- **Code review** requis
- **CI/CD** validation automatique

## 📞 Support

### Ressources
- **Documentation** : `/docs`
- **API Reference** : `/api/docs`
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions

### Contact
- **Email** : support@dental-ecommerce.com
- **Chat** : Interface intégrée
- **Documentation** : Wiki du projet

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour la communauté dentaire**

