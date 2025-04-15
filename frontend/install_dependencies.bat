@echo off
echo Installing frontend dependencies...
cd %~dp0
npm install react-hot-toast react-icons axios --save

echo Dependencies installed successfully!
echo.
echo Please run "npm run dev" to start the development server.
pause
