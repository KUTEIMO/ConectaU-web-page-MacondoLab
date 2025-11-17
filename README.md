# ConectaU - Plataforma de Conexión entre Estudiantes y Empresas

## 📋 Descripción General

**ConectaU** es una plataforma digital desarrollada para la **Universidad Simón Bolívar** que conecta estudiantes universitarios con empresas locales de Cúcuta para realizar proyectos cortos y prácticas profesionales. La plataforma facilita conexiones seguras y verificadas mediante un sistema de matching basado en perfiles, habilidades y oportunidades disponibles.

### Visión del Proyecto

ConectaU nace de la necesidad de reducir la brecha entre la formación académica y la experiencia laboral real. Busca crear un ecosistema donde:

- **Estudiantes** ganen experiencia práctica trabajando en proyectos reales con empresas
- **Empresas** accedan a talento universitario verificado y calificado
- **Instituciones educativas** validen y certifiquen el trabajo de sus estudiantes

---

## 🎯 Lógica de Negocio

### Modelo de Negocio

ConectaU opera bajo un modelo de **marketplace bidireccional** con los siguientes actores:

1. **Estudiantes** (`role: 'student'`)
   - Crean perfiles profesionales con información académica
   - Buscan proyectos y vacantes que coincidan con sus habilidades
   - Postulan a oportunidades de trabajo
   - Mantienen portafolios certificados de proyectos completados

2. **Empresas** (`role: 'company'`)
   - Publican vacantes y proyectos disponibles
   - Reciben postulaciones de estudiantes
   - Gestionan candidatos y seleccionan talento
   - Guardan perfiles de estudiantes interesantes para futuros proyectos

3. **Administradores** (`role: 'admin'`)
   - Supervisan la plataforma
   - Gestionan usuarios y contenido
   - Acceden a analytics y reportes del sistema

### Flujo Principal de la Aplicación

#### 1. Registro y Autenticación

**Para Estudiantes:**
- Registro con email/password o Google OAuth
- Selección de universidad (UNISIMON, UFPS, UDES, UNIPAMPLONA, etc.)
- Información académica: carrera, semestre, GPA, habilidades
- Creación de perfil público o privado

**Para Empresas:**
- Registro con información empresarial (NIT, industria, tamaño)
- Verificación de datos de contacto
- Configuración de perfil corporativo

**Sistema de Autenticación:**
- Firebase Authentication con Email/Password y Google OAuth
- Soporte para usuarios anónimos (guest) para exploración limitada
- Rutas protegidas basadas en roles

#### 2. Gestión de Vacantes y Proyectos

**Las empresas pueden:**
- Crear vacantes/proyectos con detalles completos:
  - Título, descripción, categoría
  - Tipo: proyecto corto o práctica profesional
  - Modalidad: remoto, híbrido o presencial
  - Ubicación (por defecto: Cúcuta)
  - Habilidades requeridas
  - Requisitos académicos
  - Beneficios ofrecidos
  - Rango de experiencia (min/max)
  - Fecha de cierre
- Editar vacantes propias
- Cambiar estado: activo, inactivo, cerrado
- Ver contador de postulaciones

**Los estudiantes pueden:**
- Explorar vacantes activas con filtros avanzados:
  - Por categoría
  - Por modalidad (remoto/híbrido/presencial)
  - Por ubicación
  - Por tipo (proyecto/práctica)
- Ver detalles completos de cada vacante
- Guardar vacantes favoritas para revisar después
- Postularse a vacantes de interés

#### 3. Sistema de Postulaciones

**Flujo de Postulación:**
1. Estudiante encuentra una vacante de interés
2. Completa formulario de postulación:
   - Mensaje personalizado para la empresa
   - Carta de presentación opcional
   - URL de CV/hoja de vida (opcional)
3. Sistema verifica que no exista postulación previa
4. Se crea registro en colección `applications` con estado `pending`
5. Se incrementa contador de postulaciones en el proyecto
6. Se genera notificación automática para la empresa

**Estados de Postulación:**
- `pending`: Postulación creada, esperando revisión
- `reviewed`: Empresa está revisando la postulación
- `accepted`: Postulación aceptada, estudiante seleccionado
- `rejected`: Postulación rechazada
- `interview`: Postulación en proceso de entrevista

**Para Empresas:**
- Reciben notificaciones de nuevas postulaciones
- Pueden ver todas las postulaciones de sus vacantes
- Pueden cambiar estado de postulaciones
- Acceden a información completa del estudiante postulante
- Pueden comunicarse mediante sistema de mensajería

**Para Estudiantes:**
- Ven estado de todas sus postulaciones
- Reciben notificaciones cuando cambia el estado
- Pueden seguir múltiples postulaciones simultáneamente

#### 4. Sistema de Búsqueda de Talento

**Para Empresas:**
- Buscar estudiantes por:
  - Universidad
  - Carrera
  - Semestre
  - Habilidades
  - Disponibilidad
- Ver perfiles públicos de estudiantes
- Guardar perfiles de interés en "Perfiles Guardados"
- Contactar directamente con estudiantes mediante mensajería

**Perfiles de Estudiantes:**
- Información académica completa
- Habilidades técnicas y blandas
- Experiencia previa
- Proyectos destacados
- Logros y certificaciones
- Disponibilidad para trabajar

#### 5. Sistema de Mensajería

**Características:**
- Conversaciones bidireccionales entre empresas y estudiantes
- Sincronización en tiempo real con Firestore
- Contador de mensajes no leídos
- Notificaciones de nuevos mensajes
- Historial completo de conversaciones

**Estructura:**
- Colección `conversations`: Metadatos de conversación
- Colección `messages`: Mensajes individuales
- Soporte para múltiples participantes

#### 6. Sistema de Notificaciones

**Tipos de Notificaciones:**
- `application`: Nueva postulación recibida (empresa)
- `application_status`: Cambio de estado de postulación (estudiante)
- `message`: Nuevo mensaje recibido
- `new_job`: Nueva vacante publicada (estudiantes)
- `interview`: Invitación a entrevista
- `system`: Notificaciones generales del sistema

**Características:**
- Notificaciones en tiempo real
- Marcado como leído/no leído
- Enlaces directos a contenido relacionado
- Historial completo de notificaciones

#### 7. Sistema de Favoritos

**Para Estudiantes:**
- Guardar vacantes de interés
- Revisar vacantes guardadas más tarde
- Organizar oportunidades para postularse después

#### 8. Sistema Administrativo

**Panel de Administración:**
- **Gestión de Usuarios:**
  - Ver todos los usuarios registrados
  - Filtrar por rol (estudiante/empresa/admin)
  - Verificar usuarios
  - Activar/desactivar cuentas
  
- **Gestión de Vacantes:**
  - Ver todas las vacantes publicadas
  - Moderar contenido
  - Cambiar estados de vacantes
  
- **Analytics:**
  - Estadísticas de usuarios
  - Estadísticas de vacantes
  - Métricas de postulaciones
  - Actividad de la plataforma

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Frontend:**
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación SPA
- **Zustand** - Gestión de estado global (autenticación)
- **React Hook Form** - Manejo de formularios
- **Tailwind CSS** - Framework de estilos utility-first
- **Lucide React** - Iconos SVG

**Backend:**
- **Firebase Authentication** - Autenticación de usuarios
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Storage** - Almacenamiento de archivos
- **Firebase Hosting** - Hosting estático

### Estructura de Base de Datos

#### Colecciones Principales

**`users`**
- Información de usuarios (estudiantes, empresas, admins)
- Campos según rol:
  - Estudiantes: universidad, carrera, semestre, GPA, habilidades
  - Empresas: nombre empresa, NIT, industria, tamaño
- Estados: `isVerified`, `isActive`, `isPublic`

**`projects`**
- Vacantes y proyectos publicados
- Campos: título, descripción, categoría, tipo, modalidad, ubicación
- Relaciones: `companyId` → empresa propietaria
- Contadores: `applicationsCount`
- Estados: `active`, `inactive`, `closed`

**`applications`**
- Postulaciones de estudiantes a vacantes
- Relaciones: `studentId`, `projectId`, `companyId`
- Estados: `pending`, `reviewed`, `accepted`, `rejected`, `interview`
- Timestamps: `dateApplied`, `reviewedAt`

**`favorites`**
- Vacantes guardadas por estudiantes
- Relaciones: `studentId`, `projectId`

**`savedProfiles`**
- Perfiles de estudiantes guardados por empresas
- Relaciones: `companyId`, `studentId`
- Notas opcionales por empresa

**`notifications`**
- Notificaciones del sistema
- Relaciones: `userId`
- Tipos y estados: `isRead`

**`conversations`**
- Metadatos de conversaciones
- Participantes y último mensaje

**`messages`**
- Mensajes individuales
- Relación: `conversationId`, `senderId`
- Estados: `read`

### Política de Base de Datos

**Principio Fundamental:** La base de datos es **SOLO DE LECTURA Y ADICIÓN**. Nunca se modifica ni elimina lo que ya existe.

**Excepciones Controladas:**
- Campos de estado (status, isRead, isActive, isVerified)
- Contadores (applicationsCount)
- Timestamps de actualización (updatedAt)

Para más detalles, ver: [DATABASE_POLICY.md](DATABASE_POLICY.md)

### Seguridad

**Reglas de Firestore:**
- Autenticación requerida para operaciones
- Usuarios solo pueden leer/escribir sus propios datos
- Empresas pueden gestionar sus vacantes
- Admins tienen acceso completo
- Ver: `firestore.rules`

**Reglas de Storage:**
- Subida de archivos solo para usuarios autenticados
- Usuarios solo pueden subir a sus propias carpetas
- Ver: `storage.rules`

**Variables de Entorno:**
- Todas las credenciales de Firebase están en variables de entorno
- Archivos `.env` NO se suben a Git
- Ver: `env.production.example`

Para más detalles de seguridad: [CHECKLIST_SEGURIDAD.md](CHECKLIST_SEGURIDAD.md)

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase
- Git

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/KUTEIMO/ConectaU-web-page-MacondoLab.git
cd ConectaU-web-page-MacondoLab
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=conectau-be1a2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=conectau-be1a2
VITE_FIREBASE_STORAGE_BUCKET=conectau-be1a2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=9317696077
VITE_FIREBASE_APP_ID=1:9317696077:web:40e7efd1dc68e856441204
VITE_FIREBASE_DATABASE_URL=https://conectau-be1a2-default-rtdb.firebaseio.com
```

**⚠️ IMPORTANTE:** Obtén estas credenciales de [Firebase Console](https://console.firebase.google.com/) en tu proyecto Firebase.

4. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de desarrollo
npm run build:prod       # Build optimizado para producción
npm run preview          # Preview del build de producción
npm run lint             # Ejecutar linter
npm run deploy           # Compilar y desplegar solo hosting a Firebase
npm run deploy:all       # Compilar y desplegar hosting + reglas de seguridad
npm run deploy:rules     # Desplegar solo reglas de Firestore y Storage
npm run seed:conversations  # Script de backfill para conversaciones
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Auth/           # Componentes de autenticación
│   │   ├── LandingRoute.tsx    # Ruta que redirige si ya está autenticado
│   │   ├── Login.tsx           # Página de inicio de sesión
│   │   ├── ProtectedRoute.tsx  # Guard para rutas protegidas
│   │   └── Register.tsx        # Página de registro
│   └── Layout/         # Componentes de layout
│       ├── Header.tsx          # Header principal con navegación
│       ├── Layout.tsx          # Layout wrapper principal
│       └── Sidebar.tsx         # Sidebar de navegación
│
├── pages/              # Páginas principales de la aplicación
│   ├── Landing.tsx            # Página de inicio pública
│   ├── Home.tsx               # Dashboard principal
│   ├── Jobs.tsx               # Lista de vacantes (estudiantes)
│   ├── JobDetail.tsx          # Detalle de vacante
│   ├── Applications.tsx       # Mis postulaciones (estudiantes)
│   ├── Favorites.tsx          # Vacantes favoritas (estudiantes)
│   ├── Vacancies.tsx          # Mis vacantes (empresas)
│   ├── CreateVacancy.tsx      # Crear nueva vacante
│   ├── EditVacancy.tsx        # Editar vacante existente
│   ├── ViewApplications.tsx   # Ver postulaciones (empresas)
│   ├── Talent.tsx             # Buscar talento (empresas)
│   ├── StudentProfile.tsx     # Ver perfil de estudiante (empresas)
│   ├── SavedProfiles.tsx      # Perfiles guardados (empresas)
│   ├── Profile.tsx            # Mi perfil
│   ├── EditProfile.tsx        # Editar perfil
│   ├── Messages.tsx           # Mensajería
│   ├── Notifications.tsx      # Notificaciones
│   ├── Admin.tsx              # Dashboard admin
│   ├── AdminUsers.tsx         # Gestión de usuarios (admin)
│   ├── AdminVacancies.tsx     # Gestión de vacantes (admin)
│   ├── AdminAnalytics.tsx     # Analytics (admin)
│   ├── Legal.tsx              # Página legal
│   └── Candidates.tsx         # Candidatos (legacy, puede estar en desuso)
│
├── services/           # Servicios de Firebase
│   ├── authService.ts          # Autenticación y usuarios
│   ├── projectsService.ts      # Gestión de vacantes/proyectos
│   ├── applicationsService.ts  # Gestión de postulaciones
│   ├── favoritesService.ts     # Sistema de favoritos
│   ├── messagesService.ts      # Sistema de mensajería
│   ├── notificationsService.ts # Sistema de notificaciones
│   ├── studentsService.ts      # Búsqueda de estudiantes
│   ├── adminService.ts         # Servicios administrativos
│   ├── userManagementService.ts # Gestión de usuarios
│   └── dashboardService.ts     # Datos del dashboard
│
├── store/              # Estado global (Zustand)
│   └── authStore.ts           # Store de autenticación
│
├── types/              # Tipos TypeScript
│   └── index.ts              # Definiciones de tipos
│
├── config/             # Configuración
│   ├── firebase.ts           # Configuración de Firebase
│   └── ...
│
├── constants/          # Constantes
│   └── geo.ts                # Constantes geográficas (ciudades)
│
├── styles/             # Estilos globales
│   └── index.css             # Estilos Tailwind y personalizados
│
├── App.tsx             # Componente raíz y rutas
└── main.tsx            # Punto de entrada
```

---

## 🎨 Diseño y UX

### Identidad Visual

- **Color Principal:** Verde institucional USB (#09843B)
- **Tipografía:** Inter (Google Fonts)
- **Estilo:** Profesional, similar a LinkedIn
- **Responsive:** Mobile-first design

### Componentes UI

- Cards para mostrar vacantes y perfiles
- Formularios con validación en tiempo real
- Notificaciones toast para feedback
- Modales para acciones importantes
- Loading states en todas las operaciones asíncronas

---

## 📱 Aplicación Móvil

ConectaU también cuenta con una aplicación móvil Android disponible:

- **APK Universal:** `public/app-releasev1-universal.apk`
- **Versión actual:** v1.0.0
- **Compatibilidad:** Android 5.0+
- **Estado iOS:** En desarrollo

Para más información: [public/README_APK.md](public/README_APK.md)

---

## 🚀 Deployment

### Deployment a Firebase Hosting

#### Preparación

1. **Configurar variables de entorno de producción:**
```bash
# Windows
CREAR_ENV_PRODUCTION.bat

# Linux/Mac
./CREAR_ENV_PRODUCTION.sh
```

Edita `.env.production` y reemplaza `tu_api_key_aqui` con tu API Key real.

2. **Verificar configuración de Firebase:**
```bash
firebase login
firebase use conectau-be1a2
```

#### Desplegar

**Primera vez (recomendado):**
```bash
npm run deploy:all
```
Despliega hosting + reglas de Firestore + reglas de Storage.

**Solo actualización de código:**
```bash
npm run deploy
```
Solo despliega el hosting (asume que las reglas ya están configuradas).

**Solo reglas de seguridad:**
```bash
npm run deploy:rules
```
Actualiza solo las reglas de Firestore y Storage.

Para más detalles: [DEPLOYMENT_FIREBASE.md](DEPLOYMENT_FIREBASE.md)

---

## 📚 Documentación Adicional

- **[DEPLOYMENT_FIREBASE.md](DEPLOYMENT_FIREBASE.md)** - Guía completa de deployment
- **[CHECKLIST_SEGURIDAD.md](CHECKLIST_SEGURIDAD.md)** - Checklist de seguridad pre-deployment
- **[SECURITY.md](SECURITY.md)** - Buenas prácticas de seguridad
- **[DATABASE_POLICY.md](DATABASE_POLICY.md)** - Política de base de datos (solo lectura/adición)
- **[docs/database-reference.md](docs/database-reference.md)** - Estructura de colecciones compartidas con la app móvil

---

## 🤝 Contribución

Este proyecto es desarrollado para la Universidad Simón Bolívar. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

© 2025 Universidad Simón Bolívar - ConectaU. Todos los derechos reservados.

---

## 👥 Equipo

Desarrollado por estudiantes e instituciones universitarias de Cúcuta, Colombia.

**Universidades Participantes: solo con fines educativos no es real la conexion con esas universidades (solo universidad simon bolvar)**
- Universidad Simón Bolívar (UNISIMON)
- Universidad Francisco de Paula Santander (UFPS)
- Universidad de Santander (UDES)
- Universidad de Pamplona (UNIPAMPLONA)

---

## 📞 Contacto

Para más información sobre el proyecto, consulta la página de [Avisos Legales](https://conectau-be1a2.web.app/legal).
e_soto2@unisimon.edu.co
---

**Última actualización:** Noniembre 2025
