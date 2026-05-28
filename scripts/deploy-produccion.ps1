<#
.SYNOPSIS
Script completo para desplegar a produccion en Firebase Hosting.

.DESCRIPTION
Este script:
1. Verifica pre-requisitos
2. Crea/verifica .env.production
3. Genera build de produccion
4. Despliega a Firebase Hosting
#>

$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$ErrorCount = 0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Deploy a Produccion - Firebase Hosting" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar pre-requisitos
Write-Host "[PASO 1/4] Verificando pre-requisitos..." -ForegroundColor Yellow
$verificarScript = Join-Path $PSScriptRoot "verificar-pre-deploy.ps1"
if (Test-Path $verificarScript) {
    & $verificarScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] La verificacion fallo. Corrige los errores antes de continuar." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [ADVERTENCIA] Script de verificacion no encontrado, continuando..." -ForegroundColor Yellow
}

# Paso 2: Asegurar que .env.production existe
Write-Host ""
Write-Host "[PASO 2/4] Verificando .env.production..." -ForegroundColor Yellow
$envProduction = Join-Path $ProjectRoot ".env.production"
$envExample = Join-Path $ProjectRoot "env.production.example"

if (-not (Test-Path $envProduction)) {
    if (Test-Path $envExample) {
        Write-Host "  [INFO] Creando .env.production desde ejemplo..." -ForegroundColor Cyan
        Copy-Item $envExample $envProduction
        Write-Host "  [IMPORTANTE] Edita .env.production y completa con tus credenciales reales" -ForegroundColor Yellow
        Write-Host "  [INFO] Luego ejecuta este script nuevamente" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "  [ERROR] No se encontro env.production.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [OK] .env.production encontrado" -ForegroundColor Green
}

# Paso 3: Generar build de produccion
Write-Host ""
Write-Host "[PASO 3/4] Generando build de produccion..." -ForegroundColor Yellow
Set-Location $ProjectRoot

# Verificar que node_modules existe
if (-not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
    Write-Host "  [INFO] Instalando dependencias..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Fallo la instalacion de dependencias" -ForegroundColor Red
        exit 1
    }
}

# Ejecutar build
Write-Host "  [INFO] Ejecutando: npm run build:prod" -ForegroundColor Cyan
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] El build fallo" -ForegroundColor Red
    exit 1
}

# Verificar que dist/ se creo correctamente
$distDir = Join-Path $ProjectRoot "dist"
$distIndex = Join-Path $distDir "index.html"

if (-not (Test-Path $distIndex)) {
    Write-Host "  [ERROR] No se genero index.html en dist/" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [OK] Build generado correctamente en dist/" -ForegroundColor Green
}

# Paso 4: Deploy a Firebase
Write-Host ""
Write-Host "[PASO 4/4] Desplegando a Firebase Hosting..." -ForegroundColor Yellow

# Preguntar confirmacion
Write-Host ""
Write-Host "¿Deseas desplegar a produccion ahora? (S/N)" -ForegroundColor Cyan
$confirmacion = Read-Host

if ($confirmacion -eq "S" -or $confirmacion -eq "s") {
    Write-Host "  [INFO] Ejecutando: firebase deploy --only hosting" -ForegroundColor Cyan
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "[OK] DEPLOY COMPLETADO EXITOSAMENTE" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tu aplicacion esta disponible en:" -ForegroundColor Cyan
        Write-Host "  https://conectau-be1a2.web.app" -ForegroundColor White
        Write-Host "  https://conectau-be1a2.firebaseapp.com" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERROR] El deploy fallo" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Deploy cancelado. El build esta listo en dist/" -ForegroundColor Yellow
    Write-Host "Puedes desplegar manualmente con: firebase deploy --only hosting" -ForegroundColor Cyan
}
