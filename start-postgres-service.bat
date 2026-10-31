@echo off
echo ============================================================
echo   VorldX - PostgreSQL Windows Service Startup
echo ============================================================
echo Requesting administrator elevation to start postgresql-x64-18...
powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command Start-Service postgresql-x64-18'"
echo Done. You may close this window.

