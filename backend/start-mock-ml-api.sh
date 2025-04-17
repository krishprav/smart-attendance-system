#!/bin/bash
echo "Starting Mock ML API for Smart Attendance System..."
cd "$(dirname "$0")"
npx ts-node src/scripts/mock-ml-api.ts
