# Build (Construction)
FROM node:20-alpine AS build

# Pour utiliser curl dans le healthcheck
RUN apk add --no-cache curl

# Variable d'environnement pour le build
ARG ENVIRONNEMENT=docker

WORKDIR /app

COPY package*.json .

# installe des dépendances
RUN npm install

# Copie tout le code source dans le conteneur
COPY . .

# Lance le build 
RUN npm run build:$ENVIRONNEMENT

# --- Étape 2 : Runtime (Nginx) ---
FROM nginx:latest

# Copie le résultat du build vers Nginx
COPY --from=build /app/dist/front-end /usr/share/nginx/html
# Copie de nginx
COPY src/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

