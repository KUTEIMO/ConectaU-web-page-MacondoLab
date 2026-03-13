# 📧 SETUP: Envío de Emails GRATUITO - ConectaU

## ¿Cómo funciona?

1. **Tú** (admin) seleccionas vacantes en `/admin/email-campaigns` y haces clic en "Enviar"
2. Los datos se guardan en Firestore como **"pending"** (pendientes)
3. **El AppScript ejecuta automáticamente** cada día a las 9 AM
4. Los emails se envían vía **SendGrid (100 emails/día FREE)**
5. Firestore marca como **"sent_successfully"** e historial se actualiza

---

## PASO 1: Crear cuenta en SendGrid (2 minutos)

1. Ve a https://sendgrid.com/pricing/ → Click en **Free**
2. Crea una cuenta (email, contraseña, acepta términos)
3. Confirma tu email
4. En el dashboard: **Settings → API Keys**
5. Click **Create API Key**
6. Dale nombre: `ConectaU` y permisos completos
7. **COPIA la clave** (aparece una sola vez) - se ve así:
   ```
   SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
   ```

---

## PASO 2: Configurar AppScript

### Opción A: Crear un nuevo AppScript desde cero

1. Ve a https://script.google.com
2. **New project → Untitled project**
3. Elimina el código por defecto
4. **Copia TODO el código** de [email-sender-simple.gs](./email-sender-simple.gs)
5. Pega en AppScript
6. Guarda el proyecto con nombre: `ConectaU Email Sender`

### Opción B: Usar el AppScript existente

Si ya tienes uno, solo reemplaza el código anterior.

---

## PASO 3: Reemplazar configuración

En AppScript, edita estas líneas (líneas 10-11):

```javascript
const SENDGRID_API_KEY = 'SG.YOUR_API_KEY_HERE'; // ← Pega tu API Key aquí
const FROM_EMAIL = 'noreply@conectau.com'; // ← O usa tu email personal
```

**Ejemplo:**
```javascript
const SENDGRID_API_KEY = 'SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890';
const FROM_EMAIL = 'ejsotoherrera1@gmail.com';
```

Guarda (Ctrl+S)

---

## PASO 4: Prueba rápida

1. En AppScript: **Run → testSendSimpleEmail**
2. Mira los logs en **View → Logs** (abajo)
3. Deberías ver: `✅ Email de prueba enviado exitosamente`
4. Revisa tu email - deberías recibir el test

Si NO funciona:
- ❌ `Authorization: Bearer` error → API Key incorrecta
- ❌ No aparece entre los logs → Revisa la consola del navegador

---

## PASO 5: Crear trigger automático DIARIO

1. En AppScript: **Triggers** (ícono de reloj a la izquierda)
2. **Create new trigger**
3. Configura así:
   - **Function to run:** `processPendingEmails`
   - **Deployment:** Head
   - **Event source:** Time-driven
   - **Type of time:** Day timer
   - **Time of day:** 09:00 - 10:00 (9 AM)

4. **Save**
5. Te pedirá permisos - acepta en la pantalla de autorización

¡Listo! Ahora se ejecutará automáticamente cada día a las 9 AM.

---

## PASO 6: Probar el flujo completo

1. Captura un lead desde la landing page (formulario)
2. Ve a `/admin/email-campaigns`
3. Selecciona una vacante
4. Haz clic **"Enviar a X leads"**
5. Verás: `✅ X correos pendientes de envío`
6. Los datos se guardaron en Firestore como "pending"

**Para probar INMEDIATAMENTE (sin esperar 24h):**
- En AppScript: **Run → processPendingEmails**
- Mira los logs
- Los leads deberían recibir emails

---

## Monitoreo y Troubleshooting

### Ver el historial de campañas exitosas
- Ve a `/admin/email-campaigns`
- Click en tab **"Historial"**
- Muestra todas las campañas enviadas exitosamente

### Limpiar datos de prueba
- En `/admin/email-campaigns`
- Click **"Eliminar datos de prueba"**
- Borra registros pendientes más viejos de 24h

### Comprobar si existe spam
- La BD tiene lógica "anti-spam": **NO envía la misma vacante al mismo lead dos veces**
- Se verifica antes de agregar el registro como "pending"

### Límites de SendGrid FREE
- **100 emails/día** (más que suficiente para MVP)
- **30,000 emails/mes** teóricamente
- Si necesitas más: upgrade a plan de pago ($20/mes)

---

## Resumen: Cómo fluye un email

```
1. USER en landing page → llena formulario de lead
   ↓
2. Lead guardado en Firestore collection "leads"
   ↓
3. ADMIN ve lead capturado
   ↓
4. ADMIN va a /admin/email-campaigns
   ↓
5. ADMIN selecciona vacantes (published por companies)
   ↓
6. ADMIN hace clic "Enviar a X leads"
   ↓
7. Firestore: guardado como "pending" (anti-spam: no duplicados)
   ↓
8. AppScript ejecuta AUTOMÁTICAMENTE cada día (9 AM)
   ↓
9. SendGrid ENVÍA emails (100/día)
   ↓
10. Firestore: marcado "sent_successfully"
   ↓
11. Historial actualizado en `/admin/email-campaigns` → tab "Historial"
   ↓
12. LEAD recibe email con nueva oportunidad
```

---

## IMPORTANTE: Detalles técnicos

- ✅ **GRATIS**: 0 pesos hasta 100 emails/día
- ✅ **SIMPLE**: No requiere OAuth complicado
- ✅ **AUTOMÁTICO**: Se ejecuta cada 24h sin necesidad de hacer nada
- ✅ **PROFESIONAL**: Emails HTML con branding
- ✅ **AUDITABLE**: Historial completo en Firestore

---

## ¿Y si algo falla?

**AppScript no ejecuta:**
- Revisa que el trigger esté creado (Triggers → debe haber uno)
- Revisa los logs: View → Logs

**Emails no llegan:**
- SendGrid puede enviar a spam - revisa carpeta Spam/Promociones
- Aumenta credibilidad: Registra dominio en SendGrid (opcional)

**¿Necesitas soporte?**
- Mira los logs en AppScript: View → Logs
- Captura pantalla del error
- Contacta con soporte

