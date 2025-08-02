#!/bin/bash

# Script pour démarrer le backend et le frontend en mode développement

echo "🚀 Démarrage des services en mode développement..."

# Fonction pour arrêter les processus au signal d'interruption
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer le signal d'interruption (Ctrl+C)
trap cleanup SIGINT

# Démarrer le backend
echo "📦 Démarrage du backend sur le port 3000..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Attendre un peu que le backend démarre
sleep 5

# Démarrer le frontend
echo "⚛️  Démarrage du frontend sur le port 3001..."
cd ../frontend
PORT=3001 npm start &
FRONTEND_PID=$!

echo "✅ Services démarrés !"
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/api/docs"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les services"

# Attendre que les processus se terminent
wait 