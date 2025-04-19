@echo off
setlocal

echo Smart Attendance System - Google OAuth Client ID Updater
echo ======================================================
echo.

if "%~1"=="" (
    echo Please provide your Google OAuth Client ID as a parameter.
    echo Example: update-google-client-id.bat 123456789-abcdefg.apps.googleusercontent.com
    exit /b 1
)

set CLIENT_ID=%~1

echo Updating Google OAuth Client ID to: %CLIENT_ID%
echo.

(
    echo # Google OAuth
    echo # Updated on %date% at %time%
    echo NEXT_PUBLIC_GOOGLE_CLIENT_ID=%CLIENT_ID%
    echo.
    echo # API URLs
    echo NEXT_PUBLIC_API_URL=http://localhost:5000
    echo NEXT_PUBLIC_ML_API_URL=http://localhost:8080
    echo.
    echo # Authentication
    echo NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=iiitmanipur.ac.in
) > frontend\.env.local

echo Environment file updated successfully!
echo.
echo Please restart your development server for the changes to take effect.
echo.

endlocal
