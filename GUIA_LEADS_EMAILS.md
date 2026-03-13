# 🚀 GUÍA: Sistema de Notificación a Leads - ConectaU

## 📋 RESUMEN

Este sistema permite que:
✅ Las **EMPRESAS publiquen vacantes** (en /vacancies)  
✅ El **ADMIN seleccione y notifique** esas vacantes a los leads capturados  
✅ **Google Apps Script envía correos automáticamente** (100% GRATIS)  
✅ Todo está **sincronizado con la BD en tiempo real**

---

## 🎯 FLUJO DEL NEGOCIO

```
EMPRESAS publican vacantes en /vacancies
    ↓
Se guardan en Firestore (collection 'projects', status='active')
    ↓
ADMIN ve esas vacantes en /admin/email-campaigns
    ↓
ADMIN selecciona cuáles vacantes compartir con leads
    ↓
ADMIN hace click "Enviar a X leads"
    ↓
Se registran en Firestore: emails_sent collection
    ↓
Google Apps Script lee diariamente
    ↓
Gmail envía correos automáticamente (máximo 100/día, gratis)
    ↓
LEADS reciben: "Nuevas oportunidades disponibles"
```

---

## 📝 PASO A PASO

### **PASO 1: Verificar que hay VACANTES activas (creadas por empresas)**

Para que el sistema funcione, necesitas que las empresas hayan publicado vacantes:

1. Ve a `/vacancies` (como empresa)
2. Confirma que hay vacantes activas
3. Luego ve al admin en `/admin/email-campaigns`
4. Deberías ver esas vacantes listadas automáticamente

❌ **Si no ves vacantes:** Las empresas aún no han publicado ninguna

### **PASO 2: Acceder al panel de campañas de email (ADMIN)**

```
https://conectau-be1a2.web.app/admin/email-campaigns
```

**Aquí verás:**
- 📋 Lista de **TODAS las vacantes activas** (publicadas por empresas)
- 👥 Número de **LEADS capturados**
- ✅ Checkbox para **SELECCIONAR vacantes**
- 📧 Botón **"Enviar a X leads"**

### **PASO 3: Seleccionar vacantes e enviar**

1. **Ver vacantes disponibles** (publicadas por empresas)
2. **Seleccionar las que quieres compartir** (checkboxes)
3. **Click en "Enviar a 45 leads"** (o el número que tengas)
4. **Confirmar**: Aparece confirmación: "✅ 45 correos registrados"

### **PASO 4: Configurar Google Apps Script (UNA SOLA VEZ)**

#### A) Generar credenciales Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Proyecto: `conectau-be1a2`
3. ⚙️ **Configuración** → **Cuentas de servicio**
4. Click **"Generar nueva clave privada"** → JSON
5. **Copia el contenido** del archivo JSON que descarga

#### B) Crear Google Apps Script:

1. Ve a https://script.google.com
2. Click **"Nuevo proyecto"**
3. Nombre: `ConectaU-Email-Automático`
4. **Reemplaza TODO el código** con: [scripts/google-apps-script.gs](../scripts/google-apps-script.gs)

#### C) Agregar credenciales:

Abre el archivo `google-apps-script.gs` que copiaste y reemplaza:

**Línea 11-12:**
```javascript
const PRIVATE_KEY = 'AQUÍ_PEGA_LA_PRIVATE_KEY_del_JSON'
const ADMIN_EMAIL = 'tu_email@gmail.com'
```

Por ejemplo:
```javascript
const PRIVATE_KEY = 'MIIEvgIBADANBgkqhkiG9w0BAQE...' // Tu clave real
const ADMIN_EMAIL = 'admin@tuempresa.com'
```

#### D) Instalar librería Firebase:

1. En el editor, click **"+"** junto a "Librerías"
2. **Script ID**: `1ReeQ6WO8kKfWb5cd933mo7Z3HKvMxvSJZDOUUUvjW5v57AxIqihVkrP1`
3. **Versión**: Última
4. **Click "Añadir"**

#### E) Crear disparador automático:

1. **Lado izquierdo**, click **"Activadores"** ⏰
2. Click **"Crear un nuevo disparador"**
3. **Configurar:**
   - Función: `onCheckNewLeads`
   - Evento: "Ver calendario de tiempo"
   - Frecuencia: **"Diariamente"**
   - Hora: **Cualquier hora** (ej: 9:00 - 10:00 AM)
4. **Click "Crear"**
5. **Autorizar** cuando pida permisos

✅ **LISTO** - Cada día a esa hora, Google Apps Script:
- Leerá correos pendientes de enviar
- Enviará automáticamente (máx 100/día)
- Registrará el envío en la BD

---

## ✅ CÓMO FUNCIONA EN PRODUCCIÓN

### 1️⃣ EMPRESAS publican vacantes

Las empresas van a `/vacancies/new` y crean vacantes:
- Título, descripción, requisitos
- Se guardan en Firestore (collection `projects`)
- Status: `active` (visible en todo el sistema)

### 2️⃣ ADMIN gestiona (NO crea) vacantes

Tú (admin) vas a `/admin/email-campaigns`:
- **Ves automáticamente** todas las vacantes activas
- **Seleccionas** cuáles notificar a los leads
- **Haces click** "Enviar"
- Se registra en `emails_sent` collection

### 3️⃣ Google Apps Script envía correos

Cada día (automático):
- Lee `emails_sent` collection
- Busca correos con status `sent`
- Envía via Gmail API (máximo 100/día)
- Actualiza status: `sent` → `delivered`

### 4️⃣ Leads reciben notificaciones

```
Subject: 📋 Nuevas oportunidades en ConectaU

Hola [nombre],

Tenemos nuevas vacantes exclusivas para ti:

🎯 Oportunidades disponibles:
• [Título del proyecto] - [Empresa]
• [Título del proyecto] - [Empresa]

¡Accede ahora y explora todas las oportunidades!

https://conectau-be1a2.web.app
```

---

## 📊 LÍMITES (PLAN GRATIS)

| Recurso | Límite | Lo que significa |
|---------|--------|------------------|
| Emails/día (Gmail) | 100 | Si tienes 50 leads y 2 vacantes = 100 correos (máximo por día) |
| Firestore reads | 50K | Muchísimo - No hay problema |
| Firestore writes | 20K | Muchísimo - No hay problema |
| Apps Script executions | 1000 | Sin problema - Ejecuta 1 vez al día |

---

## 🔧 VERIFICACIÓN: ¿Funciona?

### Prueba 1: Ver vacantes en el admin

1. Ve a `/admin/email-campaigns`
2. **¿Ves vacantes listadas?**
   - ✅ SÍ → Las empresas han publicado, continúa
   - ❌ NO → Las empresas aún no publican vacantes

### Prueba 2: Ver leads

1. En `/admin/email-campaigns`
2. **¿Dice "Leads para Notificar: 5" (o más)?**
   - ✅ SÍ → Hay leads capturados, continúa
   - ❌ NO → Nadie ha completado el formulario del landing

### Prueba 3: Enviar correos test

1. Selecciona 1 vacante
2. Click "Enviar a X leads"
3. **¿Dice "✅ 5 correos registrados"?**
   - ✅ SÍ → Sistema listo, ahora depende de Google Apps Script
   - ❌ NO → Error en la BD, revisa Firestore

### Prueba 4: Google Apps Script envía

1. Ve a https://script.google.com (tu Apps Script)
2. Click **"Ejecuciones"** (lado izquierdo)
3. **¿Ves "onCheckNewLeads" completado?**
   - ✅ SÍ → Script funciona
   - ❌ NO → Revisar logs de error

---

## 🆘 TROUBLESHOOTING

### "No veo vacantes en el admin"
→ Verifica que empresas hayan publicado en `/vacancies`  
→ Confirma que tengan status: `active` en Firestore

### "No veo leads"
→ Ve a landing page y completa el formulario  
→ Verifica que los datos estén en collection `leads` en Firestore

### "Hago click en Enviar pero no pasa nada"
→ Abre la consola (F12) y revisa si hay errores  
→ Verifica que Firestore tenga permisos de lectura/escritura

### "Google Apps Script no envía"
→ Ve a https://script.google.com → Ejecuciones  
→ Busca errores rojo (Failed)  
→ Verifica que PRIVATE_KEY esté correcta  
→ Verifica que ADMIN_EMAIL sea válido

### "Error de autenticación en Apps Script"
→ El PRIVATE_KEY no está completo  
→ Descarga nueva clave JSON de Firebase  
→ Pega el contenido completo de "private_key"

---

## 📈 SIGUIENTE PASO: MÉTRICAS

Para tu clase, documenta:
- Cuántos leads capturados
- Cuántos correos enviados
- Cuántas conversiones a aplicantes
- Abre Excel y haz gráficos 📊

---

## 🆓 COSTO FINAL

✅ **Formulario de captura**: GRATIS (tu código)  
✅ **Almacenamiento Firestore**: GRATIS (plan básico)  
✅ **Google Apps Script**: GRATIS (Gmail API 100/día)  
✅ **Total**: **$0.00** 🎉

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Puedo crear vacantes desde el admin?**  
R: NO. El admin solo gestiona las que crean las empresas. Las empresas publican en `/vacancies`

**P: ¿Cuándo se envían los correos?**  
R: Cada día a la hora que configuraste en Google Apps Script (ej: 9 AM)

**P: ¿Cuántos correos puedo enviar?**  
R: 100 por día en el plan gratuito. Si tienes 50 leads y 2 proyectos = 100 correos (agotado)

**P: ¿Qué pasa si los correos fallan?**  
R: Se registran con status `failed` en la BD. Google Apps Script lo reintenta mañana

**P: ¿Puedo personalizar el correo?**  
R: SÍ. Edita la sección "body" en `google-apps-script.gs`

---

Sistema **100% sincronizado** y **100% gratis** listo para producción 🚀
