# Ejecución y despliegue — ConectaU Web

## Requisitos

- **Node.js 18+** y npm
- Cuenta **Firebase** con proyecto `conectau-be1a2`
- **Firebase CLI** (`npm i -g firebase-tools` o `npx firebase`)

## Variables de entorno

1. Copiar plantilla:

```bash
cp env.production.example .env
# o scripts/create-env.bat (Windows) / scripts/create-env.sh
```

2. Completar en `.env` (desarrollo) o `.env.production` (build prod):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=conectau-be1a2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=conectau-be1a2
VITE_FIREBASE_STORAGE_BUCKET=conectau-be1a2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

Obtener valores en [Firebase Console](https://console.firebase.google.com/) → Configuración del proyecto → App web.

**No subir** `.env`, `.env.production` ni `*firebase-admin*.json` al repositorio.

## Desarrollo local

```bash
npm install
npm run dev
```

URL por defecto: `http://localhost:5173`.

## Build

```bash
npm run build        # desarrollo (tsc + vite)
npm run build:prod   # producción (--mode production)
npm run preview      # previsualizar dist/
```

## Deploy Firebase

```bash
firebase login
firebase use conectau-be1a2
```

| Comando | Qué despliega |
|---------|----------------|
| `npm run deploy` | Hosting (`dist/`) |
| `npm run deploy:all` | Hosting + reglas Firestore + Storage |
| `npm run deploy:rules` | Solo `firestore.rules` y `storage.rules` |
| `npm run deploy:full` | Script PowerShell `scripts/deploy-produccion.ps1` |

Antes de producción: `npm run pre-deploy` (verificación con `scripts/verificar-pre-deploy.ps1`).

## Utilidades

- `npm run seed:conversations` — backfill de conversaciones (`scripts/backfill-conversations.js`)
- `npm run lint` — ESLint

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| Pantalla en blanco tras build | Revisar que todas las `VITE_FIREBASE_*` estén en `.env.production` |
| Permisos Firestore | Publicar reglas: `npm run deploy:rules` |
| Login Google falla | Dominios autorizados en Firebase Auth |

## Producción

- **URL:** https://conectau-be1a2.web.app
- **Legal:** https://conectau-be1a2.web.app/legal
