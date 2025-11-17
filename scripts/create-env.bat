@echo off
REM Script para crear el archivo .env desde .env.example (Windows)

if exist .env (
    echo ⚠️  El archivo .env ya existe.
    echo ¿Deseas sobrescribirlo? (s/N)
    set /p response=
    if /i not "%response%"=="s" (
        echo Operación cancelada.
        exit /b 0
    )
)

if not exist .env.example (
    echo ❌ Error: No se encontró el archivo .env.example
    exit /b 1
)

copy .env.example .env
echo ✅ Archivo .env creado desde .env.example
echo.
echo ⚠️  IMPORTANTE: Ahora debes editar el archivo .env y agregar tus credenciales reales de Firebase.
echo    Consulta SETUP.md para más información.

