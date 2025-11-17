# 🔐 Guía de Seguridad - ConectaU

## Principios de Seguridad

### 1. Variables de Entorno
- ✅ **SIEMPRE** usa variables de entorno para credenciales
- ✅ El archivo `.env` está en `.gitignore`
- ❌ **NUNCA** hardcodees credenciales en el código
- ❌ **NUNCA** subas el archivo `.env` a Git

### 2. Configuración de Firebase

#### Authentication
- Habilita solo los métodos necesarios (Email/Password, Google)
- Configura dominios autorizados en Firebase Console
- Usa reglas de seguridad estrictas

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas básicas - AJUSTA según tus necesidades
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'company';
      allow update, delete: if request.auth != null && 
        resource.data.companyId == request.auth.uid;
    }
    
    // ... más reglas según necesidad
  }
}
```

#### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /companies/{companyId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == companyId;
    }
  }
}
```

### 3. Validación de Entrada

- Valida todos los inputs del usuario
- Usa TypeScript para validación de tipos
- Sanitiza datos antes de guardarlos en Firestore

### 4. Autenticación y Autorización

- Verifica siempre el estado de autenticación
- Implementa protección de rutas por rol
- Valida permisos en el backend (Firestore Rules)

### 5. Producción

#### Checklist antes de deploy:
- [ ] Variables de entorno configuradas en el hosting
- [ ] Reglas de Firestore revisadas y ajustadas
- [ ] Reglas de Storage configuradas
- [ ] Dominios autorizados en Firebase Console
- [ ] Métodos de autenticación habilitados correctamente
- [ ] `.env` NO está en el repositorio
- [ ] Credenciales NO están hardcodeadas

#### Variables de Entorno en Hosting

**Vercel:**
1. Settings > Environment Variables
2. Agrega todas las variables `VITE_FIREBASE_*`
3. Re-deploy la aplicación

**Netlify:**
1. Site settings > Environment variables
2. Agrega todas las variables `VITE_FIREBASE_*`
3. Re-deploy la aplicación

### 6. Monitoreo

- Revisa los logs de Firebase Console regularmente
- Configura alertas para actividades sospechosas
- Monitorea el uso de la API

### 7. Buenas Prácticas Generales

- Mantén las dependencias actualizadas
- Usa HTTPS siempre
- Implementa rate limiting si es necesario
- Valida y sanitiza datos del usuario
- Usa autenticación de dos factores para cuentas admin
- Realiza backups regulares de Firestore

## 🚨 Si Comprometes Credenciales

Si accidentalmente subiste credenciales a Git:

1. **INMEDIATAMENTE** regenera las credenciales en Firebase Console
2. Elimina las credenciales del historial de Git (si es necesario)
3. Actualiza todas las aplicaciones con las nuevas credenciales
4. Revisa los logs de Firebase por actividad sospechosa

## 📚 Recursos

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

