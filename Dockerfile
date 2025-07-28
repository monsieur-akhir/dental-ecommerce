# Utiliser l'image Node.js officielle
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Créer le répertoire uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start:prod"]

