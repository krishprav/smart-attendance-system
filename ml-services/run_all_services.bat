@echo off
echo Starting Smart Attendance System ML Services...

:: Kill any existing Python processes that might be using the ports
echo Checking for existing services...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5001') DO (
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5002') DO (
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5003') DO (
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8080') DO (
    taskkill /F /PID %%P 2>NUL
)

:: Start Face Recognition Service in a new window
echo Starting Face Recognition Service on port 5001...
start "Face Recognition Service" cmd /k "cd face-recognition && venv\Scripts\activate && python app_modified.py"

:: Wait for Face Recognition to initialize
timeout /t 3 /nobreak > nul

:: Start Object Detection Service in a new window
echo Starting Object Detection Service on port 5002...
start "Object Detection Service" cmd /k "cd object-detection && venv\Scripts\activate && python app_modified.py"

:: Wait for Object Detection to initialize
timeout /t 3 /nobreak > nul

:: Start Sentiment Analysis Service (if it exists)
if exist "sentiment-analysis\app.py" (
    echo Starting Sentiment Analysis Service on port 5003...
    start "Sentiment Analysis Service" cmd /k "cd sentiment-analysis && venv\Scripts\activate && python app.py"
    timeout /t 3 /nobreak > nul
) else (
    echo Sentiment Analysis Service not found, skipping...
)

:: Start API Gateway (if it exists)
if exist "api-gateway\app.py" (
    echo Starting API Gateway on port 8080...
    start "API Gateway" cmd /k "cd api-gateway && venv\Scripts\activate && python app.py"
) else (
    echo API Gateway not found, skipping...
)

echo.
echo All services have been started:
echo.
echo Face Recognition Service: http://localhost:5001
echo Object Detection Service: http://localhost:5002
if exist "sentiment-analysis\app.py" echo Sentiment Analysis Service: http://localhost:5003
if exist "api-gateway\app.py" echo API Gateway: http://localhost:8080
echo.
echo Press any key to close this window. Services will continue running in their own windows.
pause > nul
