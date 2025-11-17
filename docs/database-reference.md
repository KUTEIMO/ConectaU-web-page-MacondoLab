# Database & API Reference – ConectaU (Cúcuta)

> **Propósito**: explicar cómo está modelada la base de datos que comparte la app móvil y la web, qué colecciones existen, cómo se consumen y qué hacer cuando haya cambios.  
> **Actualizado**: {{DATE}}

---

## 1. Funciones y scripts disponibles

| Script / Servicio | Descripción | Uso |
|-------------------|-------------|-----|
| `scripts/reset_and_seed_cucuta.js` | Reconstruye toda la instancia (Auth + Firestore) con los datos de Cúcuta. | **Solo** para entornos controlados o cuando se requiere “borrar y volver a sembrar”. No ejecutar en producción sin coordinación. |
| `scripts/populate_cucuta_collections.js` | Inserta/actualiza documentos sin borrar los existentes (idempotente). | Útil para mantener el historial vivo, agregar empresas, proyectos o estudiantes. |
| `scripts/generate_credentials.js` | Exporta `CREDENCIALES_DESARROLLO.*` con los usuarios semilla (admin, compañías, estudiantes). | Ejecútalo cada vez que cambie la lista de cuentas de prueba. Compártelo externamente con precaución. |
| `scripts/backfill-conversations.js` | Revisa todas las conversaciones y crea un mensaje en `conversations/{id}/messages` si aún no existe. | Ejecuta `npm run seed:conversations`. Requiere `GOOGLE_APPLICATION_CREDENTIALS` apuntando al service account del proyecto. |

En el lado web, todas las pantallas usan las mismas colecciones. No hay API distinta: interactuamos directamente con Firestore usando los SDKs oficiales (`firebase/auth`, `firebase/firestore`, `firebase/storage` cuando aplica).

---

## 2. Colecciones y relaciones

| Colección | Descripción breve | Campos clave | Relaciones relevantes |
|-----------|------------------|--------------|-----------------------|
| **`users`** | Fuente de verdad para credenciales y metadatos por rol. | `role (admin|company|student)`, `name`, `email`, `isVerified`, `isActive`, `createdAt`, `updatedAt`, `phone`, `address`. Estudiantes: `university (UNISIMON|UFPS|UDES|UNIPAMPLONA)`, `career`, `semester`, `gpa`, `skills[]`, `portfolio`, `availability`, `isPublic`. Empresas: `companyName`, `industry`, `companySize`, `website`, `description`, `nit`, `contactPerson`, `contactPosition`. | El `uid` se reutiliza en todas las colecciones dependientes (`companies`, `student_profiles`, `projects`, `applications`, `conversations`). |
| **`companies`** | Perfil extendido para mostrar en el sitio público. | `companyId (uid)`, `name`, `industry`, `focusAreas`, `openPrograms[]`, `cultureHighlights[]`, `contactEmail`, `contactPerson`, `address`. | `projects.companyId`, `applications.companyId`, `savedProfiles.userId`, `conversations.participants`. |
| **`student_profiles`** | Información pública extendida del estudiante. | `userId`, `headline`, `skills[]`, `experience`, `achievements`, `featuredProjects`, `availability`. | Se consulta junto con `users/{uid}` en la pantalla de perfil (web y móvil). |
| **`projects`** | Vacantes y oportunidades (internships/proyectos) con historial. | `title`, `description`, `category`, `tags[]`, `skillsRequired[]`, `requirements[]`, `benefits[]`, `type (project|practice)`, `experienceLevel`/`minExperience`/`maxExperience`, `modality`, `location (Cúcuta, Norte de Santander, Colombia)`, `salary`, `status (active|inactive|closed)`, `companyId`, `company { name, logo, industry }`, `deadline`, `createdAt`, `updatedAt`, `applicationsCount`. | `companyId` enlaza con `users/companies`. `applications.projectId` y `favorites.projectId` referencian estos documentos. |
| **`applications`** | Postulaciones por estudiante. | `studentId`, `projectId`, `companyId`, `status (pending|reviewed|accepted|rejected|interview)`, `message`, `coverLetter`, `resumeUrl`, `appliedAt`, `reviewedAt`, `timeline[]` (historial de cambios), `docId` con convención `projectId_studentId`. | Se usa en los dashboards de estudiantes y empresas. Cambios de `status` disparan `notifications` tipo `application_status`. |
| **`favorites`** | Marcadores de vacantes. | `userId` (estudiante), `projectId`, `createdAt`; docId `userId_projectId`. | Se consumen para la vista “Favoritos” y para validar si una vacante ya fue guardada. |
| **`savedProfiles`** | Shortlist de talentos guardados por empresas. | `userId` (empresa), `studentId`, `studentName`, `note`, `savedAt`. | Permite mostrar listas rápidas de candidatos guardados. Preparado para próximas iteraciones de la web. |
| **`conversations`** | Conversaciones 1:1 Empresa ↔ Estudiante. | `participants [uid, uid]`, `lastMessage`, `lastMessageAt`, `topic / metadata`, `unreadCount`. Cada documento tiene subcolección `messages`. | La web usa el mismo esquema que móvil: primero intenta leer `conversations/{id}/messages`, y si no existe (legacy), cae a la colección raíz `messages`. |
| **`notifications`** | Eventos mostrados en la campana. | `userId`, `type (application_status|new_project|new_application|interview)`, `title`, `message`, `data`, `isRead`, `createdAt`, `link`. | Generadas desde `applicationsService` (cambios de estado) y desde los scripts de seed para simular actividad. |

### Diagrama rápido

```
users ─┬─ companies      ── projects ── applications ── notifications
       ├─ student_profiles
       ├─ favorites (student -> project)
       ├─ savedProfiles (company -> student)
       └─ conversations ── messages
```

---

## 3. Cómo lo consume la aplicación web

### 3.1. Autenticación y perfiles
```ts
// src/components/Auth/Login.tsx
const authUser = await signInWithEmailAndPassword(auth, email, password);
const userData = await getUserData(authUser.uid); // lee users/{uid}
if (userData.role === 'admin') {
  navigate('/admin');
} else {
  navigate('/app'); // dashboards por rol
}
```

### 3.2. Dashboard de estudiantes (`/app` cuando role=student)
- `getProjects({ status: 'active' })`
- `getStudentStats(uid)` → Internamente usa `applications` (`studentId == uid`).
- `favorites` (`userId == uid`)
- `notifications` (`userId == uid`)
- `student_profiles/{uid}` para la sección de CV

### 3.3. Dashboard de empresas (`/app` cuando role=company)
- `getCompanyStats(companyUid)` → hace `projects` + `applications` + `companyId`.
- `getApplicationsByCompany(companyUid)` → se usa para pipeline y “Postulaciones recientes”.
- `notifications` (`userId == companyUid`)
- `conversations` (`participants` contiene `companyUid`)

### 3.4. Administradores (`/admin`)
- `getAdminStats()` → cuenta `users`, `projects`, `applications`.
- Gestión de usuarios (`users/{uid}` con `isActive`, `role`).
- Moderación de vacantes (`projects/{id}` -> cambio `status`, `updatedAt`).

### 3.5. Mensajería (`/messages`)
- Escucha `conversations` con `where('participants', 'array-contains', uid)`.
- Para cada conversación, intenta leer `conversations/{id}/messages` (`orderBy('createdAt', 'asc')`); si la subcolección no existe (legacy), usa `collection('messages').where('conversationId', '==', id)`.
- `sendMessage` escribe en la subcolección y actualiza `lastMessage/lastMessageAt`.

### 3.6. Vacantes y postulaciones
- `projects` se muestran en dashboard y “Mis vacantes”.
- `EditVacancy` lee `projects/{id}` (ahora usamos `vacancyId` en la ruta).
- “Mis postulaciones” y la vista de empresa (`/vacancies/:id/applications`) consultan `applications` por `studentId` o `projectId` y muestran `message`, `timeline`, `resumeUrl`, etc.
- Cambiar el `status` (→ accepted/rejected/reviewed) actualiza `applications/{id}` y crea una `notification` (`application_status`).

---

## 4. ¿Qué hacer cuando cambie el modelo?

1. **Actualiza este documento** (sección “Colecciones y relaciones”) con los nuevos campos, formatos o colecciones.  
   - Indica si la colección tiene un nuevo índice, un campo obligatorio o cambiaste un nombre (ej. `studentId` → `candidateId`).  
   - Incluye ejemplos JSON si hay nuevas estructuras (`timeline`, `attachments`, etc.).

2. **Comunica los cambios**: abre un ticket o menciona en el canal #product-dev para que el equipo web los adopte. Adjunta este archivo como referencia.

3. **Asegura la compatibilidad**: si se agregan campos nuevos pero los proyectos históricos no los tienen, define valores por defecto o adaptadores para evitar crashes en producción.

4. **Scripts**: si tienes que regenerar data de prueba, actualiza `populate_cucuta_collections.js` y vuelve a correrlo en los entornos donde haga falta. Recuerda actualizar los `CREDENCIALES` si hay nuevos usuarios.

5. **Índices y reglas**: cuando introduzcas nuevos filtros/campos, comprueba en la consola de Firebase si se requieren índices adicionales y documenta cualquier cambio en las reglas para que el equipo web sepa qué permisos cambian.

---

## 5. Ejemplos de documentos

```jsonc
// users/{uid} – Student
{
  "name": "María González",
  "email": "maria.gonzalez@unisimon.edu.co",
  "role": "student",
  "university": "UNISIMON",
  "career": "Ingeniería de Sistemas",
  "semester": "7",
  "skills": ["Flutter", "Dart", "Firebase"],
  "isPublic": true,
  "createdAt": "2025-10-25T21:08:03Z",
  "updatedAt": "2025-11-05T22:34:00Z"
}

// projects/{id}
{
  "title": "Desarrollador Flutter Junior",
  "description": "...",
  "category": "Desarrollo",
  "skillsRequired": ["Flutter", "REST"],
  "requirements": ["1 año de experiencia", "Disponibilidad inmediata"],
  "beneficios": ["Mentoría", "Bono de transporte"],
  "type": "practice",
  "modality": "remote",
  "location": "Cúcuta, Norte de Santander, Colombia",
  "companyId": "UID_EMPRESA",
  "company": { "name": "TechCúcuta", "logo": "...", "industry": "Tecnología" },
  "status": "active",
  "createdAt": "2025-10-25T21:08:03Z"
}

// applications/{projectId}_{studentId}
{
  "projectId": "project123",
  "studentId": "student456",
  "companyId": "company789",
  "status": "reviewed",
  "message": "¡Gracias por considerar mi perfil!",
  "timeline": [
    { "status": "pending", "at": "2025-11-01T12:00:00Z" },
    { "status": "reviewed", "at": "2025-11-03T09:00:00Z" }
  ],
  "appliedAt": "2025-11-01T12:00:00Z",
  "reviewedAt": "2025-11-03T09:00:00Z"
}

// conversations/{id}
{
  "participants": ["companyUid", "studentUid"],
  "lastMessage": "Te confirmo la entrevista para mañana",
  "lastMessageAt": "2025-11-04T18:00:00Z",
  "topic": "Proceso UX Internship",
  "unreadCount": { "companyUid": 0, "studentUid": 1 }
}

// conversations/{id}/messages/{messageId}
{
  "senderId": "companyUid",
  "senderName": "TechCúcuta",
  "message": "Hola, ¿sigues disponible para hablar mañana?",
  "timestamp": "2025-11-04T17:50:00Z",
  "isRead": false
}
```

---

## 6. Checklist rápido para consumo web

- [x] Usa `/app` para todos los dashboards (redirigir desde login según `role`).
- [x] Emplea `getProjects`, `getStudentStats`, `getCompanyStats`, `getApplicationsByCompany`, `getAdminStats`.
- [x] Leer/escribir `notifications`, `favorites`, `savedProfiles`, `student_profiles`.
- [x] Para mensajería, intentar primero la subcolección `conversations/{id}/messages`.
- [x] `EditVacancy` debe cargar `projects/{id}` con el parámetro `vacancyId`.
- [x] Cambios de estado en `applications` crean `notifications` (`application_status`).
- [x] Actualiza `database-reference.md` + notifica a web cuando cambien los modelos.

---

## 7. ¿Preguntas o cambios?

1. **Actualizar esta guía** con cualquier cambio de campos o nuevas colecciones.  
2. **Abrir un issue o ping** al equipo web para que adapten los servicios/componentes involucrados.  
3. **Adjuntar ejemplos** (JSON o consultas) para acelerar la integración.  
4. **Ejecutar los scripts** de seed si hay cambios de datos de prueba o se resetea el entorno.

> Mientras app móvil y web compartan el mismo backend, mantener esta documentación sincronizada es clave. Si algo cambia en `users`, `projects`, `applications`, etc., por favor vuelve a esta guía y actualízala: así no tenemos que “descubrir” cambios por sorpresa.


