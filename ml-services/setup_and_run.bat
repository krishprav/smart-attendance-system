@echo off
echo Setting up the Smart Attendance System Backend...

:: Create virtual environments
echo Creating virtual environments...

:: Face Recognition Service
cd face-recognition
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements_modified.txt
echo Face Recognition dependencies installed.
call venv\Scripts\deactivate.bat

:: Object Detection Service
cd ..\object-detection
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements_modified.txt
echo Object Detection dependencies installed.
call venv\Scripts\deactivate.bat

:: Return to main directory
cd ..

echo Setup complete!
echo.
echo To run the services:
echo 1. For Face Recognition: cd face-recognition ^& venv\Scripts\activate ^& python app_modified.py
echo 2. For Object Detection: cd object-detection ^& venv\Scripts\activate ^& python app_modified.py
echo.
echo Note: Run each service in a separate command prompt window.
