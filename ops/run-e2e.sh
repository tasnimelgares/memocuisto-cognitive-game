#!/bin/bash

echo "Lancement de MemoCuisto en mode test..."

docker compose -f docker-compose-e2e.yml up -d --build

echo "Pour arrêter cet environnement, tapez : docker compose -f docker-compose-e2e.yml down"