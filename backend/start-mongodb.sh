#!/bin/bash
echo "Starting MongoDB for Smart Attendance System..."
cd "$(dirname "$0")"
docker-compose -f docker-compose.mongodb.yml up -d
echo "MongoDB started on port 27017"
