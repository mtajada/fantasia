# Lógica de Consumo de Créditos de Voz

## Objetivo

Definir el proceso y las reglas para verificar la disponibilidad de créditos de
voz y registrarlos como gastados cuando un usuario solicita la generación de una
narración (audio TTS) para un capítulo de una historia.

## Ubicación de la Lógica

Esta lógica **debe implementarse en el backend**, específicamente dentro de la
**Edge Function encargada de procesar la solicitud de generación de audio**
(probablemente llamada `generate-audio` o similar). No debe realizarse en el
frontend por razones de seguridad y control.

## Flujo General

1. **Recepción de Solicitud:** La función recibe una petición del frontend para
   generar audio para un texto/capítulo específico, incluyendo el ID de la voz
   deseada.
2. **Autenticación:** Se verifica el token del usuario para confirmar que es una
   solicitud válida y obtener su `user_id`. Si falla, se devuelve un error 401
   (No autorizado).
3. **Obtención de Perfil:** Se consulta la tabla `profiles` en la base de datos
   (usando el `user_id`) para obtener el estado actual del usuario:
   - `subscription_status` (ej. 'free', 'active', 'trialing', 'canceled')
   - `monthly_voice_generations_used` (contador de uso para Premium)
   - `voice_credits` (créditos comprados) Si no se encuentra el perfil, se
     devuelve un error 500.
4. **Verificación de Créditos (¡Lógica Clave!):** Se aplican las reglas para
   determinar si el usuario tiene permiso y créditos suficientes para generar el
   audio (ver detalles abajo).
5. **Error por Falta de Créditos:** Si la verificación determina que no hay
   créditos suficientes, se devuelve un error al frontend **antes** de realizar
   cualquier llamada a la API de TTS. Se recomienda usar el código de estado
   HTTP:
   - `402 Payment Required`: Si el usuario podría obtener más créditos
     (comprando o esperando la renovación del plan).
   - `403 Forbidden`: Si el tipo de usuario (ej. gratuito sin opción de compra)
     simplemente no tiene acceso a la función. (En nuestro caso, como los
     gratuitos pueden comprar, 402 suele ser más apropiado si se quedan sin
     créditos).
6. **Actualización de Base de Datos (¡CRÍTICO!):** Si la verificación de
   créditos es exitosa, se debe **actualizar inmediatamente** el contador
   correspondiente en la base de datos **ANTES** de llamar a la API externa de
   TTS. Esto se hace llamando a la función SQL apropiada mediante RPC:
   - Si se usa un crédito del plan mensual:
     `increment_monthly_voice_usage(user_id)`
   - Si se usa un crédito comprado: `decrement_voice_credits(user_id)` Si esta
     actualización falla, se debe devolver un error 500 al frontend y **no**
     proceder con la generación de TTS.
7. **Generación de Audio (TTS):** Solo si la actualización de la base de datos
   fue exitosa, se procede a llamar a la API externa de Text-to-Speech (ej.
   ElevenLabs, OpenAI TTS) con el texto y la voz solicitada.
8. **Manejo de Errores TTS:** Si la API de TTS devuelve un error, se debe
   registrar el fallo y devolver un error apropiado (ej. 500 o 502) al frontend.
   _Nota: El crédito ya se gastó en el paso 6, lo cual es intencional para
   evitar abusos o reintentos infinitos si la API externa falla
   intermitentemente._
9. **Respuesta Exitosa:** Si la generación de TTS es exitosa, se devuelve el
   buffer de audio (o la URL, según la implementación) al frontend con un estado
   200 OK.

## Lógica Detallada por Tipo de Usuario

### Usuario Premium (`subscription_status` es 'active' o 'trialing')

1. **Verificar Límite Mensual:** Se comprueba si
   `monthly_voice_generations_used` es menor que el límite mensual permitido
   (ej. 20).
   - **Si SÍ (< 20):** El usuario puede generar.
     - **Acción DB (ANTES de TTS):** Llamar a
       `increment_monthly_voice_usage(user_id)`.
   - **Si NO (>= 20):** Pasar al siguiente paso.
2. **Verificar Créditos Comprados:** Se comprueba si `voice_credits` es mayor
   que 0.
   - **Si SÍ (> 0):** El usuario puede generar.
     - **Acción DB (ANTES de TTS):** Llamar a
       `decrement_voice_credits(user_id)`.
   - **Si NO (<= 0):** El usuario **no** puede generar. Devolver error 402 (Pago
     Requerido).

### Usuario Gratuito (o Cancelado, etc.)

1. **Verificar Créditos Comprados:** Se comprueba si `voice_credits` es mayor
   que 0.
   - **Si SÍ (> 0):** El usuario puede generar.
     - **Acción DB (ANTES de TTS):** Llamar a
       `decrement_voice_credits(user_id)`.
   - **Si NO (<= 0):** El usuario **no** puede generar. Devolver error 402 (Pago
     Requerido), indicando que necesita comprar créditos.

## Funciones SQL Necesarias (Supabase RPC)

Asegúrate de que estas funciones existan en tu base de datos y sean accesibles
por el rol `service_role` (usado por `supabaseAdmin`):

- `increment_monthly_voice_usage(user_uuid uuid)`: Incrementa el contador
  `monthly_voice_generations_used` en 1 para el usuario dado.
- `decrement_voice_credits(user_uuid uuid)`: Decrementa `voice_credits` en 1
  para el usuario dado, idealmente devolviendo el nuevo saldo o un indicador
  (-1) si no había créditos para decrementar (aunque la lógica principal ya lo
  verifica).

## Consideraciones Adicionales

- **Constantes:** Definir el límite mensual (ej. 20) como una constante o
  variable de entorno para fácil mantenimiento.
- **Atomicidad:** Las llamadas RPC a funciones SQL que actualizan una sola fila
  suelen ser suficientemente atómicas para este caso de uso, minimizando riesgos
  de condiciones de carrera.
- **Errores:** Manejar adecuadamente los errores de red, de base de datos y de
  la API de TTS, devolviendo códigos de estado HTTP informativos.
