@echo off
setlocal enabledelayedexpansion

:menu
cls
echo ======================================================================
echo             SMART ATTENDANCE SYSTEM DOCKER MANAGEMENT
echo ======================================================================
echo.
echo Select an option:
echo.
echo   1. Start all services
echo   2. Stop all services
echo   3. Restart all services
echo   4. Check service status
echo   5. View logs
echo   6. Rebuild containers
echo   7. Clean up (remove unused containers/images)
echo   8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start
echo.
echo Starting all services...
docker-compose up -d
echo.
echo Services started. The system should be available in a few moments at:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:5000
echo   - ML API Gateway: http://localhost:8080
echo.
pause
goto menu

:stop
echo.
echo Stopping all services...
docker-compose down
echo Services stopped.
echo.
pause
goto menu

:restart
echo.
echo Restarting all services...
docker-compose restart
echo Services restarted.
echo.
pause
goto menu

:status
echo.
echo Checking service status...
docker-compose ps
echo.
pause
goto menu

:logs
echo.
echo Available services:
for /f "tokens=1" %%s in ('docker-compose ps --services') do (
    echo   - %%s
)
echo   - all (view all logs)
echo.
set /p service="Enter service name to view logs (or 'all' for all logs): "
echo.

if "%service%"=="all" (
    docker-compose logs
) else (
    docker-compose logs %service%
)
echo.
pause
goto menu

:rebuild
echo.
echo Rebuilding containers (this may take some time)...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo Rebuild complete. Services are now running.
echo.
pause
goto menu

:cleanup
echo.
echo Cleaning up unused containers and images...
docker-compose down
docker system prune -f
echo Cleanup complete.
echo.
pause
goto menu

:end
echo Exiting Docker Management...
exit /b 0
