@echo off
echo Setting up Smart Attendance System ML Services...
echo.

:: Create directories structure if needed
echo Creating necessary directories...
if not exist "face-recognition\models" mkdir "face-recognition\models"
if not exist "face-recognition\data\faces" mkdir "face-recognition\data\faces"
if not exist "object-detection\models" mkdir "object-detection\models"
if not exist "object-detection\data\detections" mkdir "object-detection\data\detections"

if exist "sentiment-analysis" (
    if not exist "sentiment-analysis\models" mkdir "sentiment-analysis\models"
    if not exist "sentiment-analysis\data" mkdir "sentiment-analysis\data"
)

if exist "api-gateway" (
    if not exist "api-gateway\data" mkdir "api-gateway\data"
)

:: Backup existing modified files if they exist
echo Backing up existing modified files...
if exist "face-recognition\app_modified.py" (
    copy "face-recognition\app_modified.py" "face-recognition\app_modified.bak.py" >nul
)

if exist "object-detection\app_modified.py" (
    copy "object-detection\app_modified.py" "object-detection\app_modified.bak.py" >nul
)

:: Setup Face Recognition Service
echo Setting up Face Recognition Service...
cd face-recognition
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Ensure we have latest pip
call venv\Scripts\activate
python -m pip install --upgrade pip

:: Check if requirements exist
if exist requirements_modified.txt (
    echo Installing dependencies from requirements_modified.txt...
    pip install -r requirements_modified.txt
) else (
    echo Installing dependencies from requirements.txt...
    pip install -r requirements.txt
    :: Copy requirements to modified version for future use
    copy requirements.txt requirements_modified.txt >nul
)

:: Create app_modified.py if it doesn't exist
if not exist app_modified.py (
    echo Creating app_modified.py...
    copy app.py app_modified.py >nul
)

call venv\Scripts\deactivate.bat
cd ..
echo Face Recognition Service setup complete.
echo.

:: Setup Object Detection Service
echo Setting up Object Detection Service...
cd object-detection
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Ensure we have latest pip
call venv\Scripts\activate
python -m pip install --upgrade pip

:: Check if requirements exist
if exist requirements_modified.txt (
    echo Installing dependencies from requirements_modified.txt...
    pip install -r requirements_modified.txt
) else (
    echo Installing dependencies from requirements.txt...
    pip install -r requirements.txt
    :: Copy requirements to modified version for future use
    copy requirements.txt requirements_modified.txt >nul
)

:: Create app_modified.py if it doesn't exist
if not exist app_modified.py (
    echo Creating app_modified.py...
    copy app.py app_modified.py >nul
)

call venv\Scripts\deactivate.bat
cd ..
echo Object Detection Service setup complete.
echo.

:: Setup Sentiment Analysis Service if it exists
if exist sentiment-analysis (
    echo Setting up Sentiment Analysis Service...
    cd sentiment-analysis
    if not exist venv (
        echo Creating Python virtual environment...
        python -m venv venv
    )
    
    :: Ensure we have latest pip
    call venv\Scripts\activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    call venv\Scripts\deactivate.bat
    cd ..
    echo Sentiment Analysis Service setup complete.
    echo.
)

:: Setup API Gateway if it exists
if exist api-gateway (
    echo Setting up API Gateway...
    cd api-gateway
    if not exist venv (
        echo Creating Python virtual environment...
        python -m venv venv
    )
    
    :: Ensure we have latest pip
    call venv\Scripts\activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    call venv\Scripts\deactivate.bat
    cd ..
    echo API Gateway setup complete.
    echo.
)

echo All ML services have been set up successfully!
echo.
echo To start all ML services, run:
echo run_all_services.bat
echo.
echo Press any key to exit...
pause > nul
