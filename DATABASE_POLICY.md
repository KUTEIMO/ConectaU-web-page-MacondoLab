# 🔒 Política de Base de Datos - ConectaU

## Principio Fundamental

**LA BASE DE DATOS ES SOLO DE LECTURA Y ADICIÓN. NUNCA SE MODIFICA NI SE ELIMINA LO QUE YA EXISTE.**

## Reglas Estrictas

### ✅ OPERACIONES PERMITIDAS

1. **Lectura (Read)**
   - ✅ Leer cualquier colección
   - ✅ Consultar datos existentes
   - ✅ Filtrar y ordenar datos
   - ✅ Obtener documentos individuales

2. **Adición (Create)**
   - ✅ Crear nuevos documentos
   - ✅ Agregar nuevos campos a documentos existentes (usando `merge: true`)
   - ✅ Crear nuevas colecciones si es necesario
   - ✅ Agregar elementos a arrays (sin reemplazar el array completo)

### ❌ OPERACIONES PROHIBIDAS

1. **Modificación (Update)**
   - ❌ NO modificar campos existentes en documentos
   - ❌ NO reemplazar valores existentes
   - ❌ NO cambiar la estructura de documentos existentes
   - ❌ NO actualizar campos que ya tienen valores

2. **Eliminación (Delete)**
   - ❌ NO eliminar documentos
   - ❌ NO eliminar colecciones
   - ❌ NO eliminar campos de documentos existentes
   - ❌ NO eliminar elementos de arrays (a menos que se use un campo de estado)

## Excepciones Controladas

### Campos de Estado

Se permite actualizar SOLO campos de estado específicos que representan el flujo de trabajo:

1. **En `applications`:**
   - ✅ `status` (pending → reviewed → accepted/rejected)
   - ✅ `isRead` (para marcar como leída)

2. **En `projects`:**
   - ✅ `status` (active → inactive → closed)
   - ✅ `applicationsCount` (contador de postulaciones)

3. **En `notifications`:**
   - ✅ `isRead` (true/false)

4. **En `users`:**
   - ✅ `isActive` (true/false)
   - ✅ `isVerified` (true/false)
   - ✅ `photoUrl` (actualización de foto de perfil)
   - ✅ Campos de perfil (skills, experience, etc.) - solo si están vacíos o se agregan nuevos

### Contadores

Se permite incrementar contadores:
- ✅ `applicationsCount` en proyectos
- ✅ Contadores de vistas (si se implementan)

## Implementación en Código

### ✅ Correcto: Agregar datos

```typescript
// ✅ CORRECTO: Crear nuevo documento
await addDoc(collection(db, 'applications'), {
  studentId: '...',
  projectId: '...',
  status: 'pending',
  dateApplied: serverTimestamp(),
});

// ✅ CORRECTO: Agregar campos con merge (no sobrescribe)
await setDoc(doc(db, 'users', userId), {
  newField: 'value',
  anotherField: 'value',
}, { merge: true });
```

### ❌ Incorrecto: Modificar datos existentes

```typescript
// ❌ INCORRECTO: Modificar campo existente
await updateDoc(doc(db, 'projects', projectId), {
  title: 'Nuevo título', // ❌ NO cambiar títulos existentes
  description: 'Nueva descripción', // ❌ NO cambiar descripciones
});

// ❌ INCORRECTO: Eliminar documento
await deleteDoc(doc(db, 'projects', projectId));

// ❌ INCORRECTO: Reemplazar documento completo
await setDoc(doc(db, 'users', userId), {
  name: 'Nuevo nombre', // ❌ Sobrescribe todo el documento
});
```

### ✅ Correcto: Actualizar solo campos de estado

```typescript
// ✅ CORRECTO: Actualizar estado de postulación
await updateDoc(doc(db, 'applications', applicationId), {
  status: 'accepted', // ✅ Campo de estado permitido
});

// ✅ CORRECTO: Marcar notificación como leída
await updateDoc(doc(db, 'notifications', notificationId), {
  isRead: true, // ✅ Campo de estado permitido
});

// ✅ CORRECTO: Incrementar contador
const projectDoc = await getDoc(doc(db, 'projects', projectId));
const currentCount = projectDoc.data().applicationsCount || 0;
await updateDoc(doc(db, 'projects', projectId), {
  applicationsCount: currentCount + 1, // ✅ Incrementar contador
});
```

## Estructura de Datos

### Documentos Inmutables

Estos documentos NO deben modificarse después de crearse:

- `projects`: Título, descripción, requisitos, beneficios, skills (solo lectura)
- `users`: Nombre, email, role (solo lectura después del registro)
- `applications`: Datos de postulación originales (solo lectura, excepto status)

### Documentos con Estado

Estos documentos pueden tener campos de estado actualizables:

- `applications.status`
- `projects.status`
- `notifications.isRead`
- `users.isActive`, `users.isVerified`

## Flujo de Trabajo

### Crear Nueva Vacante

1. ✅ Crear documento en `projects` con todos los datos
2. ✅ Establecer `status: 'active'`
3. ✅ Establecer `applicationsCount: 0`

### Postularse a una Vacante

1. ✅ Crear documento en `applications`
2. ✅ Incrementar `applicationsCount` en el proyecto
3. ✅ Crear notificación para la empresa

### Actualizar Estado de Postulación

1. ✅ Actualizar `status` en `applications`
2. ✅ Crear notificación para el estudiante

### Desactivar Vacante

1. ✅ Actualizar `status: 'inactive'` o `status: 'closed'`
2. ❌ NO eliminar el documento
3. ❌ NO modificar otros campos

## Auditoría y Logs

Todas las operaciones que modifiquen campos de estado deben:

1. Registrar en logs qué campo se modificó
2. Mantener un historial (si es necesario)
3. Validar que solo se modifiquen campos permitidos

## Backup y Recuperación

- Los datos nunca se eliminan, por lo que siempre hay un historial completo
- Las modificaciones solo afectan campos de estado, no datos históricos
- Los backups son más simples porque no hay eliminaciones

## Migración de Datos

Si necesitas cambiar la estructura de datos:

1. ✅ Agregar nuevos campos a documentos existentes (con `merge: true`)
2. ✅ Crear nuevos documentos con la estructura nueva
3. ❌ NO modificar campos existentes en documentos antiguos
4. ✅ Mantener compatibilidad hacia atrás

## Ejemplos de Uso

### Ejemplo 1: Crear Postulación

```typescript
// ✅ CORRECTO
const application = {
  studentId: 'student123',
  projectId: 'project456',
  status: 'pending',
  dateApplied: serverTimestamp(),
};
await addDoc(collection(db, 'applications'), application);

// Incrementar contador
const projectRef = doc(db, 'projects', 'project456');
const projectDoc = await getDoc(projectRef);
await updateDoc(projectRef, {
  applicationsCount: (projectDoc.data().applicationsCount || 0) + 1,
});
```

### Ejemplo 2: Actualizar Estado

```typescript
// ✅ CORRECTO: Solo actualizar estado
await updateDoc(doc(db, 'applications', 'app123'), {
  status: 'accepted',
});

// ❌ INCORRECTO: Modificar otros campos
await updateDoc(doc(db, 'applications', 'app123'), {
  status: 'accepted',
  studentId: 'newStudent', // ❌ NO cambiar IDs
  projectId: 'newProject', // ❌ NO cambiar IDs
});
```

### Ejemplo 3: Agregar Información de Perfil

```typescript
// ✅ CORRECTO: Agregar campos nuevos con merge
await setDoc(doc(db, 'users', userId), {
  skills: ['React', 'TypeScript'], // ✅ Agregar si no existe
  portfolio: 'https://...', // ✅ Agregar si no existe
}, { merge: true });

// ❌ INCORRECTO: Modificar campos existentes
await setDoc(doc(db, 'users', userId), {
  name: 'Nuevo Nombre', // ❌ NO cambiar nombre existente
  email: 'nuevo@email.com', // ❌ NO cambiar email existente
}, { merge: true });
```

## Conclusión

Esta política asegura:

1. ✅ Integridad de datos históricos
2. ✅ Trazabilidad completa
3. ✅ Facilidad de auditoría
4. ✅ Sin pérdida de información
5. ✅ Compatibilidad con la app móvil existente

**RECUERDA: Cuando tengas dudas, pregunta antes de modificar. Es mejor agregar que modificar.**

