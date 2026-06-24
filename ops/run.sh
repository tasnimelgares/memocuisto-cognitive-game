#!/bin/bash

echo "Lancement de MemoCuisto en mode normal..."

docker compose -f docker-compose.yml up -d --build

echo "------------------------------------------------"
echo "Front disponible sur : http://localhost:8080"
echo "Back disponible sur  : http://localhost:8081"
echo "------------------------------------------------"
echo "Pour arrêter cet environnement, tapez : docker compose -f docker-compose.yml down"