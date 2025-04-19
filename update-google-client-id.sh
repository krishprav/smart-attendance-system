#!/bin/bash

echo "Smart Attendance System - Google OAuth Client ID Updater"
echo "======================================================"
echo

if [ -z "$1" ]; then
    echo "Please provide your Google OAuth Client ID as a parameter."
    echo "Example: ./update-google-client-id.sh 123456789-abcdefg.apps.googleusercontent.com"
    exit 1
fi

CLIENT_ID=$1

echo "Updating Google OAuth Client ID to: $CLIENT_ID"
echo

cat > frontend/.env.local << EOL
# Google OAuth
# Updated on $(date)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$CLIENT_ID

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_API_URL=http://localhost:8080

# Authentication
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=iiitmanipur.ac.in
EOL

echo "Environment file updated successfully!"
echo
echo "Please restart your development server for the changes to take effect."
echo

# Make the script executable
chmod +x update-google-client-id.sh
