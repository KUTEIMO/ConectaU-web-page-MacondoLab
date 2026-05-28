# ConectaU — Web

Plataforma web que conecta **estudiantes universitarios** con **empresas** de Cúcuta para proyectos cortos y prácticas. Desarrollada para la **Universidad Simón Bolívar** (MacondoLab): vacantes, postulaciones, mensajería, favoritos y panel administrativo.

**Producción:** https://conectau-be1a2.web.app  
**Proyecto Firebase:** `conectau-be1a2`  
**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Firebase (Auth, Firestore, Storage, Hosting)

---

## Qué incluye (resumen)

| Rol | Funciones principales |
|-----|------------------------|
| **Estudiante** | Explorar vacantes, postular, favoritos, perfil, mensajes |
| **Empresa** | Publicar vacantes, revisar postulaciones, buscar talento, perfiles guardados |
| **Admin** | Usuarios, vacantes, analytics |

App móvil Android: ver [public/README_APK.md](public/README_APK.md).

---

## Inicio rápido

```bash
git clone https://github.com/KUTEIMO/ConectaU-web-page-MacondoLab.git
cd ConectaU-web-page-MacondoLab
npm install
cp .env.example .env
# Completar VITE_FIREBASE_* (Firebase Console → tu app web)
npm run dev
```

Abrir `http://localhost:5173`.

**Deploy hosting:**

```bash
npm run deploy
```

Guía completa: [docs/EJECUCION-Y-DEPLOY.md](docs/EJECUCION-Y-DEPLOY.md).

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/EJECUCION-Y-DEPLOY.md](docs/EJECUCION-Y-DEPLOY.md) | Variables de entorno, build, deploy Firebase, scripts |
| [docs/STACK-TECNOLOGICO.md](docs/STACK-TECNOLOGICO.md) | Dependencias, carpetas, Firebase |
| [docs/GUIA-COMPLETA-PROYECTO.md](docs/GUIA-COMPLETA-PROYECTO.md) | Lógica de negocio, flujos, arquitectura detallada |
| [docs/database-reference.md](docs/database-reference.md) | Colecciones Firestore (web + móvil) |
| [DATABASE_POLICY.md](DATABASE_POLICY.md) | Política de datos (solo lectura/adición) |
| [SECURITY.md](SECURITY.md) | Seguridad y reporte de vulnerabilidades |

---

## Estructura (resumen)

```text
src/
├── components/   # Auth, Layout
├── pages/        # Landing, Jobs, Applications, Admin, …
├── services/     # Firebase (auth, projects, applications, …)
├── store/        # Zustand (auth)
├── config/       # firebase.ts
└── types/
```

---

## Scripts útiles

```bash
npm run dev
npm run build:prod
npm run deploy          # hosting
npm run deploy:all      # hosting + reglas Firestore/Storage
npm run lint
```

---

## Licencia y contacto

[MIT](LICENSE) — © Universidad Simón Bolívar / ConectaU.

**Contacto:** e_soto2@unisimon.edu.co · [Avisos legales](https://conectau-be1a2.web.app/legal)
