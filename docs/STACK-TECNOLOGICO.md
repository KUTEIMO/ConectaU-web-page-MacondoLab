# Stack tecnológico — ConectaU Web

## Frontend

| Tecnología | Uso |
|------------|-----|
| **React 18** | UI y componentes |
| **TypeScript** | Tipado estático (`src/types/`) |
| **Vite** | Dev server y build |
| **React Router** | SPA y rutas protegidas por rol |
| **Zustand** | Estado global de autenticación |
| **React Hook Form** | Formularios |
| **Tailwind CSS** | Estilos utility-first |
| **Lucide React** | Iconos |

## Backend (BaaS)

| Servicio Firebase | Uso |
|-------------------|-----|
| **Authentication** | Email/contraseña, Google, invitado |
| **Cloud Firestore** | Usuarios, proyectos, postulaciones, mensajes, notificaciones |
| **Storage** | Archivos de perfil y adjuntos |
| **Hosting** | Sitio estático desde `dist/` |

Configuración: `src/config/firebase.ts`, reglas en `firestore.rules` y `storage.rules`.

## Capas de la app

```text
pages/       → vistas por rol (estudiante, empresa, admin)
components/  → Auth, Layout (Header, Sidebar)
services/    → acceso a Firestore y Auth
store/       → authStore (sesión y rol)
```

## Relación con móvil

La app **APPMOVIL-PROFESIONAL1-ConectaU-** comparte colecciones Firestore; ver [database-reference.md](database-reference.md).

## Política de datos

Solo lectura/adición salvo estados y contadores — [DATABASE_POLICY.md](../DATABASE_POLICY.md).
