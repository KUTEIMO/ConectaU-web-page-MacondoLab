@echo off
REM Script para crear .env.production con los valores correctos del proyecto

echo ============================================
echo Crear archivo .env.production
echo ============================================
echo.

REM Verificar si el archivo ya existe
if exist .env.production (
    echo [ADVERTENCIA] El archivo .env.production ya existe.
    echo ¿Deseas sobrescribirlo? (S/N)
    set /p respuesta=
    if /i not "%respuesta%"=="S" (
        echo Operacion cancelada.
        pause
        exit /b
    )
)

REM Copiar el archivo de ejemplo
copy env.production.example .env.production >nul

echo [OK] Archivo .env.production creado.
echo.
echo ============================================
echo IMPORTANTE: Edita .env.production y reemplaza:
echo.
echo VITE_FIREBASE_API_KEY=tu_api_key_aqui
echo.
echo Con tu API Key real:
echo VITE_FIREBASE_API_KEY=AIzaSyB9tqLSv2ofsDZGwazn5uEJAuJ-NrZJU0g
echo.
echo ============================================
echo Los demas valores ya estan configurados correctamente.
echo.
pause

