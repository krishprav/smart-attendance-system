#!/bin/bash
echo "Stopping MongoDB for Smart Attendance System..."
cd "$(dirname "$0")"
docker-compose -f docker-compose.mongodb.yml down
echo "MongoDB stopped"
