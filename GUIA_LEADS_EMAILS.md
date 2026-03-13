# 🚀 GUÍA: Sistema de Correos a Leads - ConectaU

## 📋 RESUMEN

Este sistema permite:
✅ Crear vacantes  
✅ Enviar correos a todos los leads de forma **GRATUITA**  
✅ Automatizar con Google Apps Script  
✅ Rastrear correos enviados  

---

## 🎯 ARQUITECTURA

```
Tu página (React)
    ↓
Firestore:
  - collection: leads (emails de usuarios)
  - collection: vacancies (vacantes que creas)
  - collection: emails_sent (tracking)
    ↓
Panel Admin (en página + Google Apps Script)
    ↓
Gmail (Envío gratis, hasta 100/día)
    ↓
Leads reciben: "Nuevas oportunidades disponibles"
```

---

## 📝 PASO A PASO

### **PASO 1: Agregar VacancyManager al panel admin (5 min)**

En tu página Admin, importa:

```tsx
import VacancyManager from './components/Admin/VacancyManager';

// En tu Admin page:
<VacancyManager />
```

### **PASO 2: Crear vacantes en el admin (2 min/vacante)**

- Accede a tu página en `/admin`
- Llena el formulario: Título, Empresa, Descripción
- Click "Crear Vacante"
- Datos se guardan en Firestore automáticamente

### **PASO 3: Configurar Google Apps Script (10 min, UNA SOLA VEZ)**

#### A) Generar credenciales Firebase:

1. Ve a Firebase Console → conectau-be1a2
2. ⚙️ Configuración → Cuentas de servicio
3. Generar nueva clave privada → JSON
4. Copia el contenido del archivo JSON

#### B) Crear Apps Script:

1. Ve a https://script.google.com
2. Nuevo proyecto
3. Nombre: "ConectaU-Email-Sender"
4. Reemplaza TODO el código con el archivo: `scripts/google-apps-script.gs`
5. En línea 12, reemplaza:
   ```
   const PRIVATE_KEY = 'AQUÍ_PEGA_private_key_del_JSON'
   ```
6. En línea 13, reemplaza:
   ```
   const ADMIN_EMAIL = 'tu_email@gmail.com'
   ```
7. Guardar (Ctrl+S)

#### C) Instalar librería Firebase:

1. En el editor, click "+" junto a "Librerías"
2. Script ID: `1ReeQ6WO8kKfWb5cd933mo7Z3HKvMxvSJZDOUUUvjW5v57AxIqihVkrP1`
3. Versión: Última
4. Identificador: FirebaseApp
5. Añadir

#### D) Autorizar y crear disparador:

1. Arriba, selecciona función: `testSendEmails`
2. Click "Ejecutar"
3. Autorizar cuando pida permisos
4. Click "Activadores" (lado izquierdo)
5. "Crear un nuevo disparador":
   - Función: `onCheckNewLeads`
   - Evento: "Ver calendario de tiempo"
   - Frecuencia: "Diariamente"
   - Crear

✅ **LISTO** - Cada día verificará y enviará correos automáticamente

---

### **PASO 4: Desplegar cambios (3 min)**

```bash
npm run build:prod
firebase deploy --only hosting
```

---

## ✅ CÓMO FUNCIONA

### Flujo manual:

1. Usuario completa formulario en landing
2. Lead guardado en Firestore (`leads` collection)
3. Tú vas a Admin → VacancyManager
4. Creas nuevas vacantes
5. Click "Enviar correos a X leads"
6. **Automáticamente** Google Apps Script envía correos

### Correo que reciben:

```
Subject: 📋 Nuevas oportunidades en ConectaU

Hola [nombre],

Hemos publicado nuevas vacantes exclusivas para ti.

🎯 Oportunidades disponibles:
• Proyectos reales con empresas
• Pagos seguros en escrow
• Certificación profesional

¡Accede ahora y explora todas las vacantes disponibles!

https://conectau-be1a2.web.app
```

---

## 📊 LÍMITES GRATIS

| Recurso | Límite | Renovación |
|---------|--------|-----------|
| Emails/día (Gmail) | 100 | Diario |
| Firestore reads | 50K | Diario |
| Firestore writes | 20K | Diario |
| Apps Script executions | 1000 | Diario |

---

## 🔧 TROUBLESHOOTING

### "Error de autenticación en Apps Script"
- Verifica que PRIVATE_KEY esté completo
- Verifica que ADMIN_EMAIL sea válido

### "Correos no se envían"
- Abre Apps Script → Ejecuciones
- Verifica los logs rojo (errores)
- Intenta `testSendEmails()` manualmente

### "No veo leads en el admin"
- Verifica que haya leads en Firestore (en Console)
- Verifica que hayan completado el formulario

---

## 📈 SIGUIENTE PASO (Para tu clase):

Agregar métricas:
- Correos enviados
- Tasa de apertura (con pixel tracking)
- Conversiones (leads → applicants)

---

## 🆘 SOPORTE

Si algo falla:
1. Revisa los logs de Apps Script
2. Verifica que Firestore tenga datos
3. Confirma permisos en Firebase

¡Listo! Sistema **100% gratis** en funcionamiento 🚀
