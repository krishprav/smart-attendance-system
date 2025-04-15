@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo             SMART ATTENDANCE SYSTEM HEALTH CHECK UTILITY
echo ======================================================================
echo.
echo Checking system components...
echo.

set OVERALL_STATUS=GOOD

:: Check MongoDB
echo Checking MongoDB...
ping -n 1 localhost | findstr "TTL" >nul
if %ERRORLEVEL% EQU 0 (
    curl -s http://localhost:27017/ >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [✓] MongoDB is running
    ) else (
        echo [✗] MongoDB is not running on default port
        set OVERALL_STATUS=WARNING
    )
) else (
    echo [✗] Cannot ping localhost. Network issues detected.
    set OVERALL_STATUS=WARNING
)

:: Check backend API
echo.
echo Checking Backend API...
curl -s http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Backend API is running
) else (
    echo [✗] Backend API is not running
    set OVERALL_STATUS=WARNING
)

:: Check frontend
echo.
echo Checking Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Frontend is running
) else (
    echo [✗] Frontend is not running
    set OVERALL_STATUS=WARNING
)

:: Check ML Services
echo.
echo Checking ML Services...

:: Face Recognition
curl -s http://localhost:5001/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Face Recognition Service is running
) else (
    echo [✗] Face Recognition Service is not running
    set OVERALL_STATUS=WARNING
)

:: Object Detection
curl -s http://localhost:5002/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Object Detection Service is running
) else (
    echo [✗] Object Detection Service is not running
    set OVERALL_STATUS=WARNING
)

:: Sentiment Analysis (if exists)
if exist ml-services\sentiment-analysis\app.py (
    curl -s http://localhost:5003/health >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [✓] Sentiment Analysis Service is running
    ) else (
        echo [✗] Sentiment Analysis Service is not running
        set OVERALL_STATUS=WARNING
    )
)

:: API Gateway (if exists)
if exist ml-services\api-gateway\app.py (
    curl -s http://localhost:8080/health >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [✓] API Gateway is running
    ) else (
        echo [✗] API Gateway is not running
        set OVERALL_STATUS=WARNING
    )
)

echo.
echo ======================================================================
echo SYSTEM HEALTH STATUS: !OVERALL_STATUS!
echo.

if "!OVERALL_STATUS!"=="WARNING" (
    echo Some components are not running properly. You may need to restart them.
    echo Use 'start_system.bat' to start all components.
    echo.
    
    echo Troubleshooting tips:
    echo 1. Check if MongoDB is installed and running
    echo 2. Check if ports are not being used by other applications
    echo 3. Check the error logs in each component's terminal window
    echo 4. Ensure all dependencies are installed correctly
)

echo ======================================================================
echo.
echo Press any key to exit...
pause > nul
