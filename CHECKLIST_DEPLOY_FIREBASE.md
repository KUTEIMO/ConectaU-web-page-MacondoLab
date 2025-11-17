# Checklist para Deployment en Firebase Hosting

## ✅ Verificaciones Completadas

### 1. Configuración del Proyecto
- [x] APK agregado en `public/app-releasev1-universal.apk`
- [x] Código actualizado para buscar el APK correcto
- [x] Firebase Hosting configurado en `firebase.json`
- [x] Headers configurados para archivos APK

### 2. Configuración de Firebase Hosting
- [x] `firebase.json` configurado con:
  - `public: "dist"` (directorio de salida de Vite)
  - `rewrites` para SPA (todas las rutas van a `/index.html`)
  - `headers` para servir APK con el tipo MIME correcto

### 3. Funcionalidades Implementadas
- [x] Página de inicio (Landing) siempre visible
- [x] Login como invitado funcionando
- [x] Sección de descargas móvil en Home
- [x] Rutas protegidas para todos los roles
- [x] Manejo de redirecciones según rol

## ⚠️ Configuraciones Requeridas en Firebase Console

### 1. Autenticación Anónima
**IMPORTANTE:** Debes habilitar la autenticación anónima en Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Sign-in method**
4. En "Sign-in providers", busca **Anonymously**
5. **Habilita** la autenticación anónima
6. Guarda los cambios

Sin esto, la funcionalidad de "Continuar como invitado" **NO funcionará**.

### 2. Firestore Rules
Verifica que tus reglas de Firestore permitan:
- Lectura/escritura para usuarios autenticados
- Creación de usuarios invitados

### 3. Storage Rules (si usas almacenamiento)
Asegúrate de que las reglas permitan descargar archivos públicos como el APK.

## 📦 Pasos para Deployment

### 1. Build del Proyecto
```bash
npm run build:prod
```

Esto creará la carpeta `dist/` con:
- Todos los archivos compilados de React/Vite
- El APK copiado desde `public/` a `dist/`

### 2. Verificar Archivos
Antes de hacer deploy, verifica que `dist/app-releasev1-universal.apk` existe:
```bash
# Windows
dir dist\app-releasev1-universal.apk

# Linux/Mac
ls dist/app-releasev1-universal.apk
```

### 3. Deploy
```bash
# Solo hosting
npm run deploy

# O todo junto (hosting + reglas)
npm run deploy:all
```

## 🔍 Verificaciones Post-Deployment

1. **Página principal**: Debe mostrar la Landing page
2. **Login como invitado**: Debe crear usuario anónimo y redirigir a `/app`
3. **Descarga de APK**: El botón debe descargar `app-releasev1-universal.apk`
4. **Rutas protegidas**: Deben funcionar según el rol del usuario
5. **Navegación SPA**: Todas las rutas deben cargar sin errores 404

## ⚡ Notas Importantes

- **Vite automáticamente copia** los archivos de `public/` a `dist/` durante el build
- El APK estará disponible en: `https://tu-dominio.web.app/app-releasev1-universal.apk`
- Las rutas de React Router funcionan gracias al rewrite en `firebase.json`
- Los headers configurados aseguran que el APK se descargue correctamente

## 🐛 Troubleshooting

### El APK no se descarga
- Verifica que el archivo esté en `dist/` después del build
- Verifica que el nombre del archivo coincida exactamente con el del código

### "Continuar como invitado" no funciona
- **Habilita la autenticación anónima en Firebase Console** (muy importante)

### Rutas no funcionan en producción
- Verifica que `firebase.json` tenga el rewrite `** -> /index.html`
- Esto es necesario para que React Router funcione correctamente

