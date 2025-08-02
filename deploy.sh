#!/bin/bash

# Script de déploiement pour Dental E-commerce
# Usage: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
PROJECT_NAME="dental-ecommerce"

echo "🚀 Déploiement de $PROJECT_NAME en mode $ENVIRONMENT"

# Vérification des prérequis
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Configuration selon l'environnement
if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.prod"
    echo "📋 Mode production activé"
    
    # Vérification du fichier d'environnement
    if [ ! -f "$ENV_FILE" ]; then
        echo "❌ Fichier $ENV_FILE manquant"
        echo "Copiez .env.prod.example vers .env.prod et configurez les variables"
        exit 1
    fi
    
    # Vérification des certificats SSL
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/private.key" ]; then
        echo "⚠️  Certificats SSL manquants dans nginx/ssl/"
        echo "Génération de certificats auto-signés pour les tests..."
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/private.key \
            -out nginx/ssl/cert.pem \
            -subj "/C=FR/ST=France/L=Paris/O=Dental-Ecommerce/CN=localhost"
    fi
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env"
    echo "📋 Mode développement activé"
fi

# Arrêt des conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Construction et démarrage
echo "🔨 Construction des images..."
docker-compose -f $COMPOSE_FILE build --no-cache

echo "🚀 Démarrage des services..."
docker-compose -f $COMPOSE_FILE up -d

# Attente que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification de l'état des services
echo "🔍 Vérification de l'état des services..."
docker-compose -f $COMPOSE_FILE ps

# Tests de santé
echo "🏥 Tests de santé..."

# Test de la base de données
if docker-compose -f $COMPOSE_FILE exec -T database mysqladmin ping -h localhost --silent; then
    echo "✅ Base de données: OK"
else
    echo "❌ Base de données: ERREUR"
fi

# Test du backend
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERREUR"
fi

# Test du frontend
if [ "$ENVIRONMENT" = "dev" ]; then
    if curl -f http://localhost:3001 &> /dev/null; then
        echo "✅ Frontend: OK"
    else
        echo "❌ Frontend: ERREUR"
    fi
else
    if curl -f http://localhost &> /dev/null; then
        echo "✅ Frontend: OK"
    else
        echo "❌ Frontend: ERREUR"
    fi
fi

echo ""
echo "🎉 Déploiement terminé !"
echo ""

if [ "$ENVIRONMENT" = "dev" ]; then
    echo "📱 Application disponible sur:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend API: http://localhost:3000/api"
    echo "   Documentation API: http://localhost:3000/api/docs"
    echo "   Base de données: localhost:3306"
else
    echo "📱 Application disponible sur:"
    echo "   Frontend: https://localhost (ou votre domaine)"
    echo "   API: https://localhost/api (ou https://api.votre-domaine.com)"
    echo "   Documentation API: https://localhost/api/docs"
fi

echo ""
echo "📊 Commandes utiles:"
echo "   Logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Arrêt: docker-compose -f $COMPOSE_FILE down"
echo "   Redémarrage: docker-compose -f $COMPOSE_FILE restart"
echo "   Shell backend: docker-compose -f $COMPOSE_FILE exec backend sh"
echo "   Shell DB: docker-compose -f $COMPOSE_FILE exec database mysql -u root -p"

