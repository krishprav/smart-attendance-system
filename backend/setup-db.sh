#!/bin/bash
echo "Setting up database for Smart Attendance System..."
cd "$(dirname "$0")"
npx ts-node src/scripts/db-setup.ts
