@echo off
echo ======================================================================
echo     STARTING AI-POWERED SMART ATTENDANCE & BEHAVIOR MONITORING SYSTEM
echo ======================================================================
echo.

echo Checking system requirements...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js v18+ from https://nodejs.org/
    goto :eof
)

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.9+ from https://python.org/
    goto :eof
)

:: Check if MongoDB is running
echo Checking MongoDB connection...
ping -n 1 localhost | findstr "TTL" >nul
if %ERRORLEVEL% EQU 0 (
    :: Try connecting to MongoDB
    curl -s http://localhost:27017/ >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] MongoDB might not be running on default port.
        echo Make sure MongoDB is running before proceeding.
        echo.
        set /p continue="Continue anyway? (y/n): "
        if /i not "%continue%"=="y" goto :eof
    ) else (
        echo MongoDB connection successful.
    )
) else (
    echo [WARNING] Cannot ping localhost. Network issues detected.
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" goto :eof
)

echo.
echo Starting system components...
echo.

:: Start ML Services
echo Starting ML Services...
cd ml-services
if not exist venv (
    echo First-time setup detected for ML services. Setting up environments...
    call setup_all_services.bat
) else (
    :: Start the ML services
    call run_all_services.bat
)
cd ..

:: Start Backend
echo.
echo Starting Backend Server...
cd backend
if not exist node_modules (
    echo First-time setup detected for backend. Installing dependencies...
    call npm install
)

:: Check if .env file exists
if not exist .env (
    if exist .env.example (
        echo Creating .env file from example...
        copy .env.example .env >nul
    ) else (
        echo [WARNING] No .env or .env.example found. Backend may not work correctly.
    )
)

:: Start backend in a new window
start "Smart Attendance Backend" cmd /k "npm run dev"
cd ..

:: Start Frontend
echo.
echo Starting Frontend Application...
cd frontend
if not exist node_modules (
    echo First-time setup detected for frontend. Installing dependencies...
    call npm install
)

:: Check if .env.local file exists
if not exist .env.local (
    if exist .env.local.example (
        echo Creating .env.local file from example...
        copy .env.local.example .env.local >nul
    ) else (
        echo [WARNING] No .env.local or .env.local.example found. Frontend may not work correctly.
    )
)

:: Start frontend in a new window
start "Smart Attendance Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ======================================================================
echo All components of the Smart Attendance System have been started:
echo.
echo Frontend:           http://localhost:3000
echo Backend API:        http://localhost:5000
echo Face Recognition:   http://localhost:5001
echo Object Detection:   http://localhost:5002
if exist ml-services\sentiment-analysis\app.py (
    echo Sentiment Analysis: http://localhost:5003
)
if exist ml-services\api-gateway\app.py (
    echo API Gateway:        http://localhost:8080
)
echo.
echo NOTE: You can close individual components by closing their command windows.
echo       This window can be closed without stopping the system.
echo ======================================================================
echo.
echo Press any key to close this window...
pause > nul
