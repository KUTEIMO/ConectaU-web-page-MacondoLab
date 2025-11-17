# 🚀 Guía de Deployment a Firebase Hosting - ConectaU

Esta guía te ayudará a publicar tu aplicación web de forma segura en Firebase Hosting.

## 📋 Prerequisitos

1. ✅ Tener una cuenta de Firebase con proyecto configurado (`conectau-be1a2`)
2. ✅ Tener Firebase CLI instalado globalmente
3. ✅ Haber configurado las variables de entorno
4. ✅ Haber revisado y actualizado las reglas de seguridad

## 🔧 Paso 1: Instalar Firebase CLI

Si aún no tienes Firebase CLI instalado:

```bash
npm install -g firebase-tools
```

## 🔐 Paso 2: Iniciar Sesión en Firebase

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Google vinculada a Firebase.

## 📁 Paso 3: Verificar Configuración

Asegúrate de que estos archivos estén correctamente configurados:

### `.firebaserc`
```json
{
  "projects": {
    "default": "conectau-be1a2"
  }
}
```

### `firebase.json`
Ya está configurado correctamente:
- `hosting.public`: `dist` (carpeta de build de Vite)
- `hosting.rewrites`: Redirige todas las rutas a `index.html` (SPA)

## 🔒 Paso 4: Verificar Reglas de Seguridad

**⚠️ CRÍTICO: Antes de publicar, verifica que las reglas de seguridad estén configuradas.**

1. Las reglas de Firestore deben estar actualizadas (ya actualizadas)
2. Las reglas de Storage deben estar configuradas (ya configuradas)

Para verificar las reglas actuales:
```bash
firebase firestore:rules
```

Para probar las reglas antes de desplegarlas:
```bash
firebase emulators:start
```

## 🌍 Paso 5: Configurar Dominios Autorizados

✅ **Los dominios ya están configurados**. Los siguientes dominios están autorizados:

- ✅ `localhost` (Default)
- ✅ `conectau-be1a2.firebaseapp.com` (Default)
- ✅ `conectau-be1a2.web.app` (Default)

**Si necesitas agregar un dominio personalizado:**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `conectau-be1a2`
3. Ve a **Authentication > Settings > Authorized domains**
4. Haz clic en **Agregar dominio** y agrega tu dominio personalizado

## 🔑 Paso 6: Variables de Entorno en Firebase Hosting

Firebase Hosting es estático, por lo que las variables de entorno deben estar en el **código compilado**.

### Opción 1: Usar `.env.production` (Recomendado)

Crea un archivo `.env.production` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=conectau-be1a2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=conectau-be1a2
VITE_FIREBASE_STORAGE_BUCKET=conectau-be1a2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=9317696077
VITE_FIREBASE_APP_ID=1:9317696077:web:40e7efd1dc68e856441204
VITE_FIREBASE_DATABASE_URL=https://conectau-be1a2-default-rtdb.firebaseio.com
```

**⚠️ IMPORTANTE:**
- Este archivo NO debe estar en Git (agrega a `.gitignore`)
- Las variables se incluyen en el bundle compilado (son públicas en el cliente)
- Esto es normal para aplicaciones web - las API keys de Firebase están diseñadas para ser públicas
- La seguridad real está en las **Firestore Security Rules** y **Storage Rules**

### Opción 2: Variables en el Build Script

Puedes pasar las variables directamente en el comando de build:

```bash
npm run build -- --mode production
```

O configurarlas en el sistema antes de build:

**Windows (CMD):**
```cmd
set VITE_FIREBASE_API_KEY=tu_api_key
npm run build
```

**Windows (PowerShell):**
```powershell
$env:VITE_FIREBASE_API_KEY="tu_api_key"
npm run build
```

**Linux/Mac:**
```bash
export VITE_FIREBASE_API_KEY=tu_api_key
npm run build
```

## 🏗️ Paso 7: Compilar el Proyecto

Asegúrate de compilar el proyecto antes de desplegar:

```bash
npm run build
```

Esto creará la carpeta `dist` con los archivos optimizados para producción.

**Verifica que el build se completó correctamente:**
```bash
# Windows
dir dist

# Linux/Mac
ls -la dist
```

## 🚀 Paso 8: Desplegar a Firebase Hosting

### Desplegar solo Hosting (primera vez)

```bash
firebase deploy --only hosting
```

### Desplegar Hosting y Reglas de Seguridad

```bash
firebase deploy --only hosting,firestore:rules,storage
```

### Desplegar todo

```bash
firebase deploy
```

## ✅ Paso 9: Verificar el Deployment

Después del deployment, Firebase te dará URLs:

- **URL principal**: `https://conectau-be1a2.web.app`
- **URL alternativa**: `https://conectau-be1a2.firebaseapp.com`

Visita estas URLs y verifica que:
- ✅ La aplicación carga correctamente
- ✅ El login funciona
- ✅ Las conexiones a Firestore funcionan
- ✅ El storage funciona
- ✅ Las rutas funcionan (SPA routing)

## 🔄 Paso 10: Configurar CI/CD (Opcional pero Recomendado)

Para automatizar los deployments, puedes configurar GitHub Actions:

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: conectau-be1a2
```

## 🔐 Seguridad Post-Deployment

### 1. Verificar Reglas de Firestore

Después de desplegar, verifica que las reglas se aplicaron:

1. Ve a Firebase Console > Firestore Database > Rules
2. Verifica que las reglas actualizadas estén desplegadas
3. Prueba las reglas usando el simulador de reglas

### 2. Verificar Reglas de Storage

1. Ve a Firebase Console > Storage > Rules
2. Verifica que las reglas estén configuradas
3. Solo usuarios autenticados deben poder leer/escribir

### 3. Configurar Dominios Autorizados

Asegúrate de que solo tus dominios autorizados puedan acceder:
- Tu dominio de Firebase Hosting
- Tu app móvil (si aplica)

### 4. Monitoreo

Configura alertas en Firebase Console:
- Ve a **Settings > Alerts**
- Configura alertas para:
  - Actividad sospechosa
  - Uso inusual de recursos
  - Errores en Firestore

## 🐛 Solución de Problemas

### Error: "Hosting site not found"

```bash
firebase use --add
# Selecciona tu proyecto conectau-be1a2
```

### Error: "Build failed"

Verifica que:
- Todas las variables de entorno estén configuradas
- No haya errores de TypeScript: `npm run lint`
- Las dependencias estén instaladas: `npm install`

### Error: "Permission denied"

Verifica que:
- Estés autenticado: `firebase login`
- Tengas permisos en el proyecto de Firebase

### Variables de entorno no funcionan

Recuerda que:
- Las variables deben empezar con `VITE_` para Vite
- Debes hacer rebuild después de cambiar variables
- Las variables se incluyen en el bundle (son públicas)

## 📝 Checklist Pre-Deployment

Usa el archivo `CHECKLIST_SEGURIDAD.md` para verificar todo antes de desplegar.

## 🔗 Recursos

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Firebase Console
2. Verifica la consola del navegador para errores
3. Revisa este documento
4. Consulta la documentación oficial de Firebase

