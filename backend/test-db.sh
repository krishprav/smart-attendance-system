#!/bin/bash
echo "Testing MongoDB connection for Smart Attendance System..."
cd "$(dirname "$0")"
npx ts-node src/scripts/test-db-connection.ts
