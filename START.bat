@echo off
chcp 65001 > nul
title AK KAGAZ - Development Servers

echo.
echo ═══════════════════════════════════════════════════════
echo    AK KAGAZ - Запуск серверов разработки
echo ═══════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 🚀 Запуск Backend и Frontend...
echo.
echo ⏳ Пожалуйста подождите...
echo.

npm run dev

pause
