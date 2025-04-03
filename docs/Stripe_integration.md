# Guía Detallada: Integración de Stripe en Web App con Supabase (Cuenta Cuentos)

**Documento creado para:**

*   Servir como referencia detallada del proceso de integración de Stripe.
*   Facilitar la consulta y resolución de dudas sobre la implementación.
*   Proporcionar una guía paso a paso para la futura implementación de Stripe en aplicaciones similares.

**Versión:** 1.1 (Actualizado para reflejar manejo de creación de personajes sin límite)
**Fecha:** 2024-04-03

---

## 1. Introducción

Este documento describe el proceso completo para integrar **Stripe** como pasarela de pagos en una aplicación web (Cuenta Cuentos) que utiliza **Supabase** como backend y **Vite** como framework frontend. La integración permite:

*   **Suscripción Premium:** Venta de un plan de suscripción mensual recurrente.
*   **Compra de Créditos:** Venta de paquetes de créditos de voz (pago único).
*   **Gestión de Suscripción:** Permite a los usuarios gestionar sus suscripciones (cancelar, actualizar método de pago) a través del **Stripe Customer Portal**.

La implementación se basa en **Stripe Checkout**, **Supabase Edge Functions** para la lógica segura del backend y **Stripe Webhooks** para mantener la sincronización del estado.

---

## 2. Prerrequisitos

*   **Cuenta de Stripe:** Activa ([https://stripe.com/](https://stripe.com)). Usar **modo de prueba** durante el desarrollo.
*   **Proyecto Supabase:** Funcional (Base de datos, Auth, Edge Functions habilitadas).
*   **CLI de Supabase:** Instalada y configurada.
*   **CLI de Stripe (Opcional):** Útil para pruebas básicas.
*   **Entorno Frontend:** Configurado (Vite).
*   **Variables de Entorno/Secretos de Supabase Configurados:** (Ver paso 3.2).

---

## 3. Configuración Inicial

### 3.1. Configuración de Productos y Precios en Stripe

1.  **Accede al Dashboard de Stripe** (modo de prueba).
2.  **Crea Productos:**
    *   Navega a "Productos" > "Catálogo de productos" > "+ Añadir producto".
    *   **Producto 1: Suscripción Premium**
        *   Nombre: "Plan Premium Cuenta Cuentos"
        *   Modelo: "Periódico", Mensual, Precio (ej. 10 USD).
        *   Guarda. Anota **ID Producto (`prod_...`)** y **ID Precio (`price_...`)**.
    *   **Producto 2: Créditos de Voz**
        *   Nombre: "Paquete Créditos de Voz"
        *   Modelo: "Pago único", Precio (ej. 5 USD).
        *   Guarda. Anota **ID Producto (`prod_...`)** y **ID Precio (`price_...`)**.

### 3.2. Configuración de Secretos en Supabase

Usa la CLI de Supabase (`supabase secrets set <NOMBRE>=<VALOR>`):

```bash
# Clave secreta de Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Clave publicable de Stripe (Prefijo VITE_ para Vite)
supabase secrets set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_zzzzzzzzzzzz

# ID del Precio del Plan Premium
supabase secrets set PREMIUM_PLAN_PRICE_ID=price_12345abcdefg

# ID del Precio de los Créditos de Voz
supabase secrets set VOICE_CREDITS_PRICE_ID=price_67890hijklmn

# URL base de tu app frontend (Ajusta para producción)
supabase secrets set APP_BASE_URL=http://localhost:8080

# Clave Service Role de Supabase (Usa nombre personalizado)
supabase secrets set APP_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR.......

# Secreto de Firma de Webhooks (Obtenido más tarde de Stripe)
supabase secrets set STRIPE_SIGNING_SECRET=whsec_yyyyyyyyyyyy_TEMPORAL
```

### 3.3. Configuración de la Base de Datos (profiles)

Asegura que la tabla public.profiles (vinculada a auth.users.id) contenga los campos necesarios.

Código SQL para definir/modificar tabla profiles (SQL Editor de Supabase):

```sql
-- Añadir o asegurar columnas para Stripe y límites de la app
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS plan_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS voice_credits INT4 DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_stories_generated INT4 DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_story_reset_date TIMESTAMPTZ;

-- Hacer columnas NULLables si se establecen después del registro
ALTER TABLE public.profiles ALTER COLUMN child_age DROP NOT NULL; -- Ejemplo
```

Función SQL RPC increment_voice_credits (SQL Editor de Supabase): (Usada por Webhook)

```sql
CREATE OR REPLACE FUNCTION increment_voice_credits(user_uuid uuid, credits_to_add integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET voice_credits = COALESCE(voice_credits, 0) + credits_to_add
  WHERE id = user_uuid;
END; $$;
GRANT EXECUTE ON FUNCTION public.increment_voice_credits(uuid, integer) TO service_role;
```

Funciones SQL RPC para Límites (SQL Editor de Supabase): (Usadas por Edge Functions)

```sql
-- Incrementa contador de historias (llamada desde generate-story)
CREATE OR REPLACE FUNCTION increment_story_count(user_uuid UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_stories_generated = COALESCE(monthly_stories_generated, 0) + 1
  WHERE id = user_uuid;
END; $$;
GRANT EXECUTE ON FUNCTION public.increment_story_count(UUID) TO service_role;

-- Decrementa créditos de voz (llamada desde narrate-voice)
CREATE OR REPLACE FUNCTION decrement_voice_credits(user_uuid UUID)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE updated_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET voice_credits = voice_credits - 1
  WHERE id = user_uuid AND voice_credits > 0
  RETURNING voice_credits INTO updated_credits;
  RETURN COALESCE(updated_credits, -1); -- -1 si no se pudo decrementar
END; $$;
GRANT EXECUTE ON FUNCTION public.decrement_voice_credits(UUID) TO service_role;
```

## 4. Implementación del Backend (Supabase Edge Functions)

### 4.1. Función: create-checkout-session

Propósito: Inicia el proceso de compra (Suscripción o Créditos).
Código (supabase/functions/create-checkout-session/index.ts):
(Inserta aquí el código completo y final de la función proporcionado anteriormente).
Despliegue: `supabase functions deploy create-checkout-session --no-verify-jwt`

### 4.2. Función: stripe-webhook

Propósito: Recibe eventos de Stripe y actualiza la BD Supabase.
Código (supabase/functions/stripe-webhook/index.ts):
(Inserta aquí el código completo y final (versión con APP_SERVICE_ROLE_KEY) proporcionado anteriormente).
Despliegue: `supabase functions deploy stripe-webhook --no-verify-jwt`
Configuración del Endpoint en Stripe: (Realizar DESPUÉS de desplegar)

Dashboard Stripe -> Desarrolladores -> Webhooks -> "+ Añadir endpoint".
URL: `https://<TU_PROYECTO_REF>.supabase.co/functions/v1/stripe-webhook`
Eventos: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
Añadir endpoint y copiar "Secreto de firma" (whsec_...).
Guardar secreto en Supabase: `supabase secrets set STRIPE_SIGNING_SECRET=<SECRETO_WHSEC_REAL>`

### 4.3. Función: create-customer-portal-session

Propósito: Genera enlace al Stripe Customer Portal para gestión de suscripción.
Código (supabase/functions/create-customer-portal-session/index.ts):
(Inserta aquí el código completo y final de la función proporcionado anteriormente).
Despliegue: `supabase functions deploy create-customer-portal-session --no-verify-jwt`

### 4.4. Lógica de Límites y Reset Mensual (Integrada en Funciones Existentes)

Importante: La aplicación de límites (10 historias/mes, 1 continuación gratuita, créditos de voz) y el reset mensual dinámico se integran directamente en las funciones que manejan esas acciones (ej. generate-story, continue-story, narrate-voice), no en funciones separadas.

**Generar Historia (generate-story function):**
Debe incluir lógica para:
- Obtener subscription_status, monthly_stories_generated, last_story_reset_date del perfil.
- Reset Dinámico: Si el usuario es gratuito, comparar last_story_reset_date con la fecha actual. Si es un mes nuevo, actualizar monthly_stories_generated = 0 y last_story_reset_date ANTES de la verificación de límite.
- Verificación Límite: Si es gratuito, comprobar monthly_stories_generated < 10. Si no, devolver error 429.
- Actualización Post-Éxito: Si la generación es exitosa y el usuario es gratuito, llamar a supabaseAdmin.rpc('increment_story_count', { user_uuid: user.id }).
(Nota: El código detallado para esta lógica se proporcionó en la conversación anterior).

**Continuar Historia (continue-story function):**
Debe incluir lógica para:
- Obtener subscription_status.
- Obtener free_continuation_used de la tabla stories.
- Verificación Límite: Si es gratuito y free_continuation_used es true, devolver error 403.
- Actualización Post-Éxito: Si la continuación es exitosa y el usuario es gratuito, actualizar stories.free_continuation_used = true.
(Nota: El pseudocódigo para esta lógica se proporcionó anteriormente).

**Narración de Voz (narrate-voice function):**
Debe incluir lógica para:
- Obtener subscription_status y voice_credits.
- Verificación Límite: Si no es 'active', devolver error 403. Si voice_credits <= 0, devolver error 402.
- Actualización Post-Éxito: Si la generación es exitosa, llamar a supabaseAdmin.rpc('decrement_voice_credits', { user_uuid: user.id }). Verificar que el resultado RPC no sea -1.
(Nota: El pseudocódigo para esta lógica se proporcionó anteriormente).

### 4.5. Manejo de Creación de Personajes (Sin Límite Actual)

Implementación Actual: La creación de personajes se maneja directamente desde el frontend mediante llamadas al cliente Supabase (supabase.from('characters').insert(...)). No se aplica límite entre usuarios gratuitos y premium en esta versión.

Nota de Seguridad: Este enfoque frontend es aceptable mientras no haya límites. Si se introduce un límite en el futuro (ej. 2 personajes para gratuitos), será necesario implementar una Edge Function dedicada (create-character) para aplicar el límite de forma segura en el backend.

## 5. Configuración del Stripe Customer Portal

Dashboard Stripe -> Configuración (⚙️) -> Billing -> Customer portal.
Activar y Configurar:
- Actualizar suscripciones -> Cancelar suscripciones (marcar, fin de periodo).
- Actualizar métodos de pago.
- Ver historial de facturación.
- Revisar Información del Negocio y Branding.
- URL de Redirección Predeterminada: http://localhost:8080/profile (Ajustar para producción).
- Guardar cambios.

## 6. Implementación del Frontend (Vite Ejemplo)

### 6.1. Inicialización de Stripe.js

En tu punto de entrada JS/TS:

```typescript
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### 6.2. Lógica para Iniciar Checkout

En el componente con botones "Suscribirse"/"Comprar Créditos":

```typescript
import { supabase } from './supabaseClient';
async function redirectToCheckout(itemType: 'premium' | 'credits') {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', { body: JSON.stringify({ item: itemType }) });
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
    else alert('Error al iniciar el pago.');
  } catch (error) { console.error(error); alert('Ocurrió un error.'); }
}
// Asignar a botones...
```

### 6.3. Página de Éxito (/payment-success)

Crea esta ruta/componente:

```typescript
// Ejemplo React (adaptar)
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
function PaymentSuccessPage() {
  const location = useLocation(); const navigate = useNavigate();
  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (sessionId) alert('¡Gracias! Tu cuenta se actualizará.');
    else alert('Pago procesado, revisa tu perfil.');
    setTimeout(() => navigate('/profile'), 3000);
  }, [location, navigate]);
  return <div><h1>¡Pago Exitoso!</h1><p>Actualizando cuenta...</p></div>;
}
export default PaymentSuccessPage;
```

### 6.4. Lógica para Gestionar Suscripción (Customer Portal)

En el componente con el botón "Gestionar Suscripción":

```typescript
import { supabase } from './supabaseClient';
async function handleManageSubscriptionClick() {
  try {
    const { data: { session }, error: se } = await supabase.auth.getSession();
    if (se || !session) { alert('Inicia sesión.'); return; }
    const { data, error } = await supabase.functions.invoke('create-customer-portal-session');
    if (error) {
      if (error.context?.status === 404) alert(data?.error || 'No se encontró info de facturación.');
      else throw error;
    } else if (data?.url) window.location.href = data.url;
    else alert('No se pudo obtener el enlace.');
  } catch (err) { console.error(err); alert('Ocurrió un error.'); }
}
// Asignar al botón...
```

### 6.5. Lógica para Crear Personajes

En el servicio/componente que crea personajes:

```typescript
import { supabase } from './supabaseClient';
async function createCharacterDirectly(characterData: { name: string, user_id: string, /*...*/ }) {
  console.log(`Inserting character directly for user ${characterData.user_id}...`);
  const { data: newCharacter, error } = await supabase
    .from('characters')
    .insert(characterData) // Inserción directa
    .select().single();
  if (error) { console.error(error); throw error; }
  return newCharacter;
}
// Llamar a esta función desde la UI
```

## 7. Estrategia de Pruebas

- Pruebas Backend (curl): Verifica respuestas básicas de las Edge Functions desplegadas.
- Pruebas End-to-End (Esencial):
  - Compra: Flujo completo desde frontend (login -> comprar -> checkout Stripe prueba -> /payment-success).
  - Webhook: Monitorizar logs de stripe-webhook en Supabase Dashboard.
  - Base de Datos: Verificar actualizaciones en profiles (status, créditos, contadores).
  - Límites: Probar generar/continuar/narrar/crear (según aplique) como usuario gratuito y premium para confirmar que los límites (o ausencia de ellos) se aplican correctamente según la lógica integrada en las funciones.
  - Gestión: Flujo completo desde frontend (login -> gestionar -> portal Stripe -> cancelar -> volver). Verificar logs y BD.

## 8. Consideraciones Adicionales

- Manejo de Errores: Refinar mensajes de error en frontend y backend.
- UI Dinámica: Mostrar estado (Gratuito/Premium), créditos restantes, deshabilitar/ocultar funciones según plan.
- Seguridad Producción:
  - Usar claves Live de Stripe.
  - Configurar webhook y secreto de firma Live.
  - Restringir CORS a tu dominio de producción.
  - Actualizar APP_BASE_URL.
- Future Character Limits: Si se introducen límites de personajes gratuitos, implementar una Edge Function dedicada (create-character) para validación segura en backend.

Este documento actualizado refleja la estructura completa de la integración, incluyendo la decisión actual sobre la creación de personajes.
