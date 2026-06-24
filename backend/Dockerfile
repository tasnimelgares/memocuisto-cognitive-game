# Image de base : On utilise Node.js
FROM node:20-alpine

# Pour utiliser curl dans le healthcheck
RUN apk add --no-cache curl

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de configuration des dépendances
COPY --chown=node:node package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY --chown=node:node . .

# Ne pas s'exécuter en tant que root
USER node

# Exposer le port interne du backend
EXPOSE 9428

# Commande de lancement
CMD ["npm", "run", "start"]