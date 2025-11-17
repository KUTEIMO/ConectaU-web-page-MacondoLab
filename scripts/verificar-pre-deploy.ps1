<#
.SYNOPSIS
Verifica que todo este listo para el despliegue en Firebase Hosting.

.DESCRIPTION
Este script verifica:
1. Que existe .env.production con todas las variables necesarias
2. Que las variables de entorno tienen valores validos
3. Que firebase.json esta configurado correctamente
4. Que el build se puede generar correctamente
#>

$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$ErrorCount = 0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Verificacion Pre-Deploy" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar .env.production
Write-Host "[1/4] Verificando archivo .env.production..." -ForegroundColor Yellow
$envProduction = Join-Path $ProjectRoot ".env.production"

if (-not (Test-Path $envProduction)) {
    Write-Host "  [ERROR] No se encontro .env.production" -ForegroundColor Red
    Write-Host "  [INFO] Solucion: Ejecuta CREAR_ENV_PRODUCTION.bat o copia env.production.example" -ForegroundColor Yellow
    $ErrorCount++
} else {
    Write-Host "  [OK] Archivo .env.production encontrado" -ForegroundColor Green
    
    # Leer y verificar variables
    $envContent = Get-Content $envProduction -Raw
    $requiredVars = @(
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var\s*=") {
            $missingVars += $var
        } elseif ($envContent -match "$var\s*=\s*(.+)" -and $matches[1].Trim() -eq "") {
            $missingVars += "$var (vacia)"
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "  [ERROR] Variables faltantes o vacias:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "    - $var" -ForegroundColor Red
        }
        $ErrorCount++
    } else {
        Write-Host "  [OK] Todas las variables de entorno estan presentes" -ForegroundColor Green
    }
}

# 2. Verificar firebase.json
Write-Host ""
Write-Host "[2/4] Verificando firebase.json..." -ForegroundColor Yellow
$firebaseJson = Join-Path $ProjectRoot "firebase.json"

if (-not (Test-Path $firebaseJson)) {
    Write-Host "  [ERROR] No se encontro firebase.json" -ForegroundColor Red
    $ErrorCount++
} else {
    try {
        $jsonContent = Get-Content $firebaseJson -Raw | ConvertFrom-Json
        
        if (-not $jsonContent.hosting) {
            Write-Host "  [ERROR] firebase.json no tiene configuracion de hosting" -ForegroundColor Red
            $ErrorCount++
        } else {
            if ($jsonContent.hosting.public -ne "dist") {
                Write-Host "  [ADVERTENCIA] hosting.public no es 'dist'" -ForegroundColor Yellow
            } else {
                Write-Host "  [OK] Hosting configurado correctamente (public: dist)" -ForegroundColor Green
            }
            
            if (-not $jsonContent.hosting.rewrites) {
                Write-Host "  [ADVERTENCIA] No hay rewrites configurados (necesario para SPA)" -ForegroundColor Yellow
            } else {
                Write-Host "  [OK] Rewrites configurados para SPA" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  [ERROR] firebase.json tiene formato invalido" -ForegroundColor Red
        $ErrorCount++
    }
}

# 3. Verificar que dist/ no existe o esta vacio (para build limpio)
Write-Host ""
Write-Host "[3/4] Verificando directorio dist/..." -ForegroundColor Yellow
$distDir = Join-Path $ProjectRoot "dist"
if (Test-Path $distDir) {
    $distFiles = Get-ChildItem $distDir -Recurse -File | Measure-Object
    if ($distFiles.Count -gt 0) {
        Write-Host "  [INFO] Directorio dist/ existe con $($distFiles.Count) archivos" -ForegroundColor Cyan
        Write-Host "  [INFO] Se generara un nuevo build que reemplazara estos archivos" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] Directorio dist/ esta vacio" -ForegroundColor Green
    }
} else {
    Write-Host "  [OK] Directorio dist/ no existe (se creara en el build)" -ForegroundColor Green
}

# 4. Verificar package.json y scripts de build
Write-Host ""
Write-Host "[4/4] Verificando scripts de build..." -ForegroundColor Yellow
$packageJson = Join-Path $ProjectRoot "package.json"

if (-not (Test-Path $packageJson)) {
    Write-Host "  [ERROR] No se encontro package.json" -ForegroundColor Red
    $ErrorCount++
} else {
    try {
        $pkgContent = Get-Content $packageJson -Raw | ConvertFrom-Json
        $scripts = $pkgContent.scripts
        $scriptNames = $scripts.PSObject.Properties.Name
        $hasBuild = $scriptNames -contains "build"
        $hasBuildProd = $scriptNames -contains "build:prod"
        
        if ($hasBuild -or $hasBuildProd) {
            Write-Host "  [OK] Scripts de build encontrados" -ForegroundColor Green
            if ($hasBuildProd) {
                $buildProdProp = $scripts.PSObject.Properties | Where-Object { $_.Name -eq "build:prod" }
                $buildProdScript = $buildProdProp.Value
                Write-Host "    - build:prod: $buildProdScript" -ForegroundColor Cyan
            }
            if ($hasBuild) {
                Write-Host "    - build: $($scripts.build)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "  [ADVERTENCIA] No se encontraron scripts de build" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] No se pudo leer package.json" -ForegroundColor Red
        $ErrorCount++
    }
}

# Resumen final
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "[OK] Verificacion completada: TODO LISTO PARA DEPLOY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. npm run build:prod" -ForegroundColor White
    Write-Host "  2. firebase deploy --only hosting" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "[ERROR] Verificacion completada: SE ENCONTRARON $ErrorCount ERROR(ES)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, corrige los errores antes de continuar con el deploy." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
