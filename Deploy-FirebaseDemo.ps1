<#
.SYNOPSIS
Flujo completo para preparar, verificar seguridad y desplegar proyecto web Firebase.

.DESCRIPCION
1. Verifica seguridad: Firestore, Storage, .env, Hosting SPA
2. Genera build de producción (dist/)
3. Despliega en canal de vista previa
#>

$ProjectRoot = $PSScriptRoot

Write-Host "==== 1?? Verificación de seguridad ===="

# firebase.json
$firebaseJson = Join-Path $ProjectRoot "firebase.json"
if (Test-Path $firebaseJson) {
    Write-Host "[OK] firebase.json encontrado."
} else {
    Write-Warning "[ALERTA] firebase.json NO encontrado."
}

# Firestore rules
$firestoreRules = Join-Path $ProjectRoot "firestore.rules"
if (Test-Path $firestoreRules) {
    $rulesContent = Get-Content $firestoreRules -Raw
    if ($rulesContent -match "allow\s+write:\s*if\s+true") {
        Write-Warning "[ALERTA] Firestore permite escritura pública. Revisa las reglas."
    } else {
        Write-Host "[OK] Reglas de Firestore parecen seguras."
    }
} else {
    Write-Warning "[ALERTA] No se encontró firestore.rules."
}

# Storage rules
$storageRules = Join-Path $ProjectRoot "storage.rules"
if (Test-Path $storageRules) {
    $storageContent = Get-Content $storageRules -Raw
    if ($storageContent -match "allow\s+write:\s*if\s+true") {
        Write-Warning "[ALERTA] Storage permite escritura pública. Revisa las reglas."
    } else {
        Write-Host "[OK] Reglas de Storage parecen seguras."
    }
} else {
    Write-Warning "[ALERTA] No se encontró storage.rules."
}

# .env
$envFile = Join-Path $ProjectRoot ".env"
if (Test-Path $envFile) {
    Write-Host "[OK] Archivo .env encontrado. Revisa que esté en .gitignore."
} else {
    Write-Warning "[ALERTA] No se encontró .env."
}

# Hosting SPA
if (Test-Path $firebaseJson) {
    $jsonContent = Get-Content $firebaseJson -Raw | ConvertFrom-Json
    if ($jsonContent.hosting -and $jsonContent.hosting.rewrites) {
        Write-Host "[OK] Hosting SPA configurado correctamente."
    } else {
        Write-Warning "[ALERTA] Hosting SPA no tiene rewrites configuradas. Para SPA, agrega rewrite a /index.html"
    }
}

# Pregunta para continuar al build
$buildConfirm = Read-Host "¿Deseas generar build de producción (dist/)? (Y/N)"
if ($buildConfirm -eq "Y" -or $buildConfirm -eq "y") {
    Write-Host "==== 2?? Generando build de producción ===="
    npm run build
} else {
    Write-Warning "Se omitió la generación de build."
}

# Pregunta para deploy en canal de vista previa
$deployConfirm = Read-Host "¿Deseas desplegar en canal de vista previa? (Y/N)"
if ($deployConfirm -eq "Y" -or $deployConfirm -eq "y") {
    $channelName = Read-Host "Ingresa el nombre del canal de vista previa (ej: preview_demo)"
    Write-Host "==== 3?? Desplegando en canal de vista previa ($channelName) ===="
    firebase hosting:channel:deploy $channelName
    Write-Host "URL de vista previa generada. Compártela con tus compañeros."
} else {
    Write-Warning "Se omitió deploy en canal de vista previa."
}

Write-Host "==== Flujo finalizado ===="
