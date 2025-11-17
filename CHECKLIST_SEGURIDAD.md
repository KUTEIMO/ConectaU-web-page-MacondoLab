# ✅ Checklist de Seguridad Pre-Deployment - ConectaU

Usa esta checklist ANTES de hacer deployment a producción para asegurar que tu aplicación esté segura.

## 🔒 Seguridad de Firebase

### Firestore Rules
- [ ] ✅ Reglas de Firestore actualizadas (no permiten `allow read, write: if true`)
- [ ] ✅ Solo usuarios autenticados pueden leer/escribir según corresponda
- [ ] ✅ Los usuarios solo pueden modificar sus propios datos
- [ ] ✅ Solo se permiten actualizaciones de campos de estado permitidos
- [ ] ✅ No se permiten eliminaciones (según política de BD)
- [ ] ✅ Las reglas han sido probadas localmente con emuladores
- [ ] ✅ Las reglas se han desplegado: `firebase deploy --only firestore:rules`

### Storage Rules
- [ ] ✅ Reglas de Storage configuradas
- [ ] ✅ Solo usuarios autenticados pueden leer/escribir
- [ ] ✅ Los usuarios solo pueden acceder a sus propios archivos
- [ ] ✅ Las reglas se han desplegado: `firebase deploy --only storage`

### Authentication
- [ ] ✅ Métodos de autenticación habilitados (solo los necesarios)
- [ ] ✅ Dominios autorizados configurados en Firebase Console
- [ ] ✅ Dominios de producción agregados (web.app, firebaseapp.com, dominio personalizado)
- [ ] ✅ Email de verificación configurado (si aplica)

## 🔑 Credenciales y Variables de Entorno

### Archivos de Credenciales
- [ ] ✅ `.env` NO está en Git (verificado en `.gitignore`)
- [ ] ✅ `.env.production` NO está en Git
- [ ] ✅ `firebase-admin-key.json` NO está en Git (solo debe estar en servidor/cloud functions)
- [ ] ✅ `google-services.json` (app móvil) puede estar en Git si es necesario, pero verificado

### Variables de Entorno
- [ ] ✅ Todas las variables de entorno configuradas para producción
- [ ] ✅ Variables tienen el prefijo `VITE_` para Vite
- [ ] ✅ Variables se pasan correctamente al build
- [ ] ✅ El build incluye las variables correctamente

### API Keys
- [ ] ⚠️ **IMPORTANTE**: Las API Keys de Firebase son públicas por diseño
- [ ] ✅ La seguridad NO depende de las API Keys, sino de las **Security Rules**
- [ ] ✅ Las Security Rules están correctamente configuradas (arriba)

## 🔐 Seguridad del Código

### Credenciales Hardcodeadas
- [ ] ❌ NO hay credenciales hardcodeadas en el código
- [ ] ❌ NO hay API keys en el código fuente
- [ ] ❌ NO hay tokens secretos en el código
- [ ] ✅ Todo usa variables de entorno

### Validación de Datos
- [ ] ✅ Inputs de usuario validados
- [ ] ✅ Datos sanitizados antes de guardar en Firestore
- [ ] ✅ Validación en el frontend Y backend (Security Rules)

### Autenticación
- [ ] ✅ Rutas protegidas implementadas
- [ ] ✅ Verificación de autenticación antes de operaciones críticas
- [ ] ✅ Roles y permisos verificados correctamente

## 📦 Build y Deployment

### Build
- [ ] ✅ Build exitoso sin errores: `npm run build`
- [ ] ✅ No hay warnings críticos
- [ ] ✅ La carpeta `dist` se generó correctamente
- [ ] ✅ Los archivos estáticos están en `dist`

### Configuración de Firebase
- [ ] ✅ `.firebaserc` tiene el proyecto correcto (`conectau-be1a2`)
- [ ] ✅ `firebase.json` está correctamente configurado
- [ ] ✅ `firebase.json` apunta a la carpeta `dist` para hosting

### Firebase CLI
- [ ] ✅ Firebase CLI instalado: `firebase --version`
- [ ] ✅ Autenticado en Firebase: `firebase login`
- [ ] ✅ Proyecto seleccionado correctamente: `firebase use`

## 🌐 Hosting y Dominios

### Dominios
- [ ] ✅ Dominios autorizados configurados en Firebase Console
- [ ] ✅ Dominio personalizado configurado (si aplica)
- [ ] ✅ Certificado SSL activo (automático en Firebase)

### Headers de Seguridad
- [ ] ✅ Firebase Hosting incluye headers de seguridad por defecto
- [ ] ✅ Considera agregar headers adicionales si es necesario

## 📊 Monitoreo y Logs

### Firebase Console
- [ ] ✅ Acceso a Firebase Console configurado
- [ ] ✅ Permisos de IAM configurados correctamente
- [ ] ✅ Alertas configuradas (si es posible)

### Logs
- [ ] ✅ Sabes dónde revisar logs de errores
- [ ] ✅ Consola de Firebase > Hosting > Usage
- [ ] ✅ Firestore > Usage

## 🧪 Testing

### Pruebas Locales
- [ ] ✅ Aplicación funciona localmente: `npm run dev`
- [ ] ✅ Build funciona: `npm run build`
- [ ] ✅ Preview funciona: `npm run preview`
- [ ] ✅ Emuladores probados (si aplica): `firebase emulators:start`

### Pruebas de Seguridad
- [ ] ✅ Intento de acceso no autorizado a datos bloqueado
- [ ] ✅ Usuario no puede modificar datos de otros usuarios
- [ ] ✅ Solo se pueden actualizar campos de estado permitidos
- [ ] ✅ No se pueden eliminar documentos (según política)

## 📱 Compatibilidad con App Móvil

### Base de Datos Compartida
- [ ] ✅ Las reglas de Firestore protegen tanto web como móvil
- [ ] ✅ La app móvil usa las mismas reglas de seguridad
- [ ] ✅ No hay conflictos entre web y móvil

### Storage Compartido
- [ ] ✅ Las reglas de Storage protegen ambos clientes
- [ ] ✅ Rutas de Storage consistentes entre web y móvil

## 📝 Documentación

- [ ] ✅ README actualizado con instrucciones de deployment
- [ ] ✅ Documentación de seguridad actualizada (`SECURITY.md`)
- [ ] ✅ Variables de entorno documentadas

## ✅ Pre-Deployment Final

### Últimas Verificaciones
- [ ] ✅ **TODAS** las casillas anteriores están marcadas
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ Funcionalidades principales probadas localmente
- [ ] ✅ Backup de datos importante hecho (si aplica)

### Deployment
- [ ] ✅ Listo para hacer deployment: `firebase deploy --only hosting,firestore:rules,storage`
- [ ] ✅ Plan de rollback preparado (puedes revertir a versión anterior)

## 🚨 Post-Deployment

Después del deployment, verifica:

- [ ] ✅ La aplicación carga en la URL de producción
- [ ] ✅ El login funciona
- [ ] ✅ Las operaciones de Firestore funcionan
- [ ] ✅ Storage funciona
- [ ] ✅ No hay errores en la consola
- [ ] ✅ Las reglas de seguridad funcionan (probar acceso no autorizado)
- [ ] ✅ La app móvil sigue funcionando correctamente

## 📞 En Caso de Problemas

Si encuentras problemas después del deployment:

1. **Revisa los logs**: Firebase Console > Hosting > Usage
2. **Verifica las reglas**: Firebase Console > Firestore > Rules (simulador)
3. **Revisa la consola del navegador**: Errores de JavaScript/Firebase
4. **Rollback si es necesario**: Firebase Console > Hosting > Revert

---

**⚠️ RECUERDA**: La seguridad NO está en ocultar credenciales, está en las **Firestore Security Rules** y **Storage Rules**. Asegúrate de que estén correctamente configuradas.

---

**Fecha de última revisión**: _______________

**Revisado por**: _______________

