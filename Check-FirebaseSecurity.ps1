<#
.SYNOPSIS
Verifica configuraciones básicas de seguridad para un proyecto web Firebase.
Comprueba firebase.json, reglas de Firestore y Storage, .env y hosting SPA.
#>

# Carpeta raíz del proyecto (script debe estar en la raíz)
$ProjectRoot = $PSScriptRoot

Write-Host "==== Comprobando seguridad del proyecto Firebase ===="

# 1️⃣ firebase.json
$firebaseJson = Join-Path $ProjectRoot "firebase.json"
if (Test-Path $firebaseJson) {
    Write-Host "[OK] firebase.json encontrado."
} else {
    Write-Warning "[ALERTA] firebase.json NO encontrado. Inicializa Hosting con 'firebase init hosting'."
}

# 2️⃣ Reglas de Firestore
$firestoreRules = Join-Path $ProjectRoot "firestore.rules"
if (Test-Path $firestoreRules) {
    $rulesContent = Get-Content $firestoreRules -Raw
    if ($rulesContent -match "allow\s+write:\s*if\s+true") {
        Write-Warning "[ALERTA] Firestore permite escritura pública. Revisa las reglas."
    } else {
        Write-Host "[OK] Reglas de Firestore parecen seguras (no write público detectado)."
    }
} else {
    Write-Warning "[ALERTA] No se encontró firestore.rules. Verifica en Firebase Console."
}

# 3️⃣ Reglas de Storage
$storageRules = Join-Path $ProjectRoot "storage.rules"
if (Test-Path $storageRules) {
    $storageContent = Get-Content $storageRules -Raw
    if ($storageContent -match "allow\s+write:\s*if\s+true") {
        Write-Warning "[ALERTA] Storage permite escritura pública. Revisa las reglas."
    } else {
        Write-Host "[OK] Reglas de Storage parecen seguras (no write público detectado)."
    }
} else {
    Write-Warning "[ALERTA] No se encontró storage.rules. Verifica en Firebase Console."
}

# 4️⃣ Archivo .env
$envFile = Join-Path $ProjectRoot ".env"
if (Test-Path $envFile) {
    Write-Host "[OK] Archivo .env encontrado. Revisa que esté en .gitignore y no contenga secretos expuestos."
} else {
    Write-Warning "[ALERTA] No se encontró .env. Asegúrate de tener variables de entorno configuradas."
}

# 5️⃣ Hosting SPA
if (Test-Path $firebaseJson) {
    $jsonContent = Get-Content $firebaseJson -Raw | ConvertFrom-Json
    if ($jsonContent.hosting -and $jsonContent.hosting.rewrites) {
        Write-Host "[OK] Hosting SPA configurado correctamente (rewrites detectadas)."
    } else {
        Write-Warning "[ALERTA] Hosting SPA no tiene rewrites configuradas. Para SPA, configura rewrite a /index.html."
    }
}

Write-Host "==== Comprobación finalizada ===="
