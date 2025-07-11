# Implementaci�n y Validaci�n Completa de Stripe

## 1. Problema Actual

### Descripci�n General
La integraci�n de Stripe en Fantasia presenta varias fallas cr�ticas que impiden un funcionamiento correcto del sistema de suscripciones y l�mites de cr�ditos. A pesar de contar con una arquitectura s�lida, existen gaps significativos que afectan tanto a usuarios gratuitos como de pago.

### Problemas Identificados

#### =% **Cr�tico: L�gica de Continuaci�n de Historias Incompleta**
- **Ubicaci�n**: `/supabase/functions/story-continuation/index.ts`
- **Problema**: La funci�n de continuaci�n de historias no integra ni verifica los l�mites mensuales
- **Impacto**: Los usuarios gratuitos pueden exceder el l�mite de 10 historias mensuales mediante continuaciones
- **Estado actual**: Solo verifica l�mite de cap�tulos (d2 para usuarios gratuitos) pero no cuenta hacia el l�mite mensual de historias

#### =% **Cr�tico: Sistema de Reseteo Mensual Incompleto**
- **Ubicaci�n**: Base de datos / Sistema de automatizaci�n
- **Problema**: No existe un mecanismo autom�tico para resetear contadores mensuales
- **Impacto**: Los usuarios quedan permanentemente bloqueados despu�s de alcanzar sus l�mites
- **Estado actual**: Funci�n `reset_monthly_counters()` existe en SQL pero nunca se ejecuta

#### =% **Cr�tico: Plan Premium No Disponible**
- **Ubicaci�n**: `/src/pages/PlansPage.tsx`
- **Problema**: El plan premium muestra "Coming Soon" y est� deshabilitado
- **Impacto**: Los usuarios no pueden comprar suscripciones premium
- **Estado actual**: El flujo de checkout existe pero la interfaz lo bloquea

#### � **Medio: Inconsistencias en el Seguimiento de Cr�ditos**
- **Ubicaci�n**: M�ltiples componentes del sistema
- **Problema**: L�gica compleja entre cr�ditos de voz vs. asignaciones mensuales
- **Impacto**: Confusi�n para usuarios y posibles errores de c�lculo
- **Estado actual**: Cr�ditos de voz se manejan separadamente del uso mensual

#### � **Medio: Falta de Advertencias Proactivas**
- **Ubicaci�n**: Interfaz de usuario
- **Problema**: No hay indicadores de l�mites restantes ni advertencias
- **Impacto**: Los usuarios no saben cu�ndo est�n cerca de sus l�mites
- **Estado actual**: No existe UI para mostrar cr�ditos restantes

## 2. Soluci�n Propuesta

### Visi�n General
Implementar un sistema completo de gesti�n de l�mites y suscripciones que garantice:
1. **Flujo de pago sin fallos**: Checkout, suscripciones y portal de cliente funcionando correctamente
2. **L�mites mensuales precisos**: Contabilidad correcta para historias, continuaciones y cr�ditos de voz
3. **Reseteo autom�tico**: Renovaci�n mensual de l�mites para usuarios gratuitos y de pago
4. **Experiencia de usuario clara**: Advertencias, indicadores y redirecciones apropiadas

### Arquitectura de la Soluci�n

#### **Capa de Base de Datos**
- **Estado**:  **Completa** - Esquema s�lido con funciones SQL robustas
- **Componentes**: 
  - Tabla `profiles` con campos de suscripci�n y cr�ditos
  - Funciones SQL para gesti�n de cr�ditos y contadores
  - Pol�ticas RLS para seguridad

#### **Capa de Servicios Backend**
- **Estado**: = **Requiere mejoras** - Funciones Edge con gaps cr�ticos
- **Componentes**:
  - Funciones de generaci�n de historias
  - Webhook de Stripe para eventos de suscripci�n
  - Servicios de checkout y portal de cliente

#### **Capa de Interfaz de Usuario**
- **Estado**: = **Requiere mejoras** - Componentes b�sicos sin integraci�n completa
- **Componentes**:
  - P�gina de planes con premium deshabilitado
  - P�ginas de �xito/cancelaci�n de pago
  - Falta de indicadores de l�mites

### Principios de Dise�o

1. **Atomicidad**: Todas las operaciones de cr�ditos deben ser at�micas
2. **Transparencia**: Los usuarios deben conocer sus l�mites y uso actual
3. **Recuperaci�n**: Sistema resiliente con manejo de errores robusto
4. **Escalabilidad**: Arquitectura que soporte crecimiento de usuarios

## 3. Fases y Pasos T�cnicos de Implementaci�n

### **Fase 1: Resoluci�n de Problemas Cr�ticos** =%
*Prioridad: M�xima | Duraci�n estimada: 3-5 d�as*

#### **Paso 1.1: Integrar L�mites en Continuaci�n de Historias**
- **Archivo**: `/supabase/functions/story-continuation/index.ts`
- **Cambios necesarios**:
  ```typescript
  // Agregar verificaci�n de l�mites mensuales antes de generar continuaci�n
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_type, stories_generated_this_month')
    .eq('id', userId)
    .single();
  
  if (profile.subscription_type === 'free' && profile.stories_generated_this_month >= 10) {
    return new Response(JSON.stringify({
      error: 'Monthly story limit reached. Upgrade to premium for unlimited stories.'
    }), { status: 403 });
  }
  
  // Incrementar contador despu�s de generar continuaci�n
  await supabase.rpc('increment_story_count', { user_id: userId });
  ```

#### **Paso 1.2: Implementar Sistema de Reseteo Mensual**
- **Opci�n A**: Funci�n Edge con cron job
  ```typescript
  // Crear nueva funci�n: /supabase/functions/monthly-reset-scheduler/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from '@supabase/supabase-js';
  
  serve(async (req) => {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { error } = await supabase.rpc('reset_monthly_counters');
    
    if (error) {
      console.error('Error resetting monthly counters:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  });
  ```

- **Opci�n B**: Configurar cron job en Supabase
  ```sql
  -- Agregar al final de sql_supabase.sql
  SELECT cron.schedule(
    'monthly-reset',
    '0 0 1 * *', -- Ejecutar el 1 de cada mes a las 00:00
    $$SELECT reset_monthly_counters();$$
  );
  ```

#### **Paso 1.3: Habilitar Plan Premium**
- **Archivo**: `/src/pages/PlansPage.tsx`
- **Cambios necesarios**:
  ```typescript
  // Remover l�gica de "Coming Soon" y habilitar el bot�n de premium
  const handlePremiumSubscription = async () => {
    try {
      const { data } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: 'price_premium_plan_id' }
      });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };
  ```

### **Fase 2: Mejoras en la Experiencia de Usuario** =
*Prioridad: Alta | Duraci�n estimada: 2-3 d�as*

#### **Paso 2.1: Implementar Indicadores de L�mites**
- **Archivo**: `/src/components/LimitIndicator.tsx` (nuevo)
- **Funcionalidad**:
  ```typescript
  interface LimitIndicatorProps {
    type: 'stories' | 'voice_credits';
    current: number;
    limit: number;
    isUnlimited?: boolean;
  }
  
  export const LimitIndicator: React.FC<LimitIndicatorProps> = ({ 
    type, current, limit, isUnlimited 
  }) => {
    const percentage = isUnlimited ? 0 : (current / limit) * 100;
    const isNearLimit = percentage >= 80;
    
    return (
      <div className="limit-indicator">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {type === 'stories' ? 'Stories this month' : 'Voice credits'}
          </span>
          <span className={`text-sm ${isNearLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {isUnlimited ? 'Unlimited' : `${current}/${limit}`}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isNearLimit ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  };
  ```

#### **Paso 2.2: Agregar Advertencias Proactivas**
- **Archivo**: `/src/hooks/useLimitWarnings.ts` (nuevo)
- **Funcionalidad**:
  ```typescript
  export const useLimitWarnings = () => {
    const [warnings, setWarnings] = useState<LimitWarning[]>([]);
    
    const checkLimits = useCallback(async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_type, stories_generated_this_month, voice_credits_used_this_month')
        .eq('id', userId)
        .single();
      
      const newWarnings: LimitWarning[] = [];
      
      if (profile.subscription_type === 'free') {
        if (profile.stories_generated_this_month >= 8) {
          newWarnings.push({
            is_month >= 18) {
          newWarnings.push({
            type: 'voice',
            message: 'You have 2 voice credits left this month. Upgrade to premium for more credits.',
            severity: 'warning'
          });
        }
      }
      
      setWarnings(newWarnings);
    }, [userId]);
    
    return { warnings, checkLimits };
  };
  ```

### **Fase 3: Optimizaci�n y Monitoreo** =�
*Prioridad: Media | Duraci�n estimada: 2-3 d�as*

#### **Paso 3.1: Mejorar Webhook de Stripe**
- **Archivo**: `/supabase/functions/stripe-webhook/index.ts`
- **Mejoras**:
  ```typescript
  // Agregar manejo de errores robusto y logs detallados
  const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: 'premium',
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer);
      
      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }
      
      console.log(`Subscription created for customer: ${subscription.customer}`);
    } catch (error) {
      console.error('Error handling subscription creation:', error);
      throw error;
    }
  };
  ```

#### **Paso 3.2: Implementar Logging y Monitoreo**
- **Archivo**: `/src/services/analyticsService.ts` (nuevo)
- **Funcionalidad**:
  ```typescript
  export const trackLimitReached = async (userId: string, limitType: 'stories' | 'voice') => {
    await supabase
      .from('usage_events')
      .insert({
        user_id: userId,
        event_type: 'limit_reached',
        event_data: { limit_type: limitType },
        created_at: new Date().toISOString()
      });
  };
  
  export const trackUpgradeConversion = async (userId: string, source: string) => {
    await supabase
      .from('usage_events')
      .insert({
        user_id: userId,
        event_type: 'upgrade_conversion',
        event_data: { source },
        created_at: new Date().toISOString()
      });
  };
  ```

### **Fase 4: Validaci�n y Testing** 
*Prioridad: Alta | Duraci�n estimada: 2-3 d�as*

#### **Paso 4.1: Testing de Flujo de Pago**
- **Casos de prueba**:
  1. **Registro de usuario gratuito** � Verificar l�mites iniciales
  2. **Upgrade a premium** � Verificar actualizaci�n de l�mites
  3. **Cancelaci�n de suscripci�n** � Verificar downgrade
  4. **Compra de cr�ditos extra** � Verificar adici�n de cr�ditos
  5. **Webhooks de Stripe** � Verificar sincronizaci�n

#### **Paso 4.2: Testing de L�mites Mensuales**
- **Casos de prueba**:
  1. **Usuario gratuito genera 10 historias** � Verificar bloqueo
  2. **Usuario gratuito intenta continuaci�n** � Verificar l�mite aplicado
  3. **Usuario premium** � Verificar l�mites ilimitados
  4. **Reseteo mensual** � Verificar contadores en 0
  5. **Cr�ditos de voz** � Verificar descuento y l�mites

#### **Paso 4.3: Testing de Interfaz de Usuario**
- **Casos de prueba**:
  1. **Indicadores de l�mites** � Verificar exactitud
  2. **Advertencias proactivas** � Verificar triggers
  3. **Mensajes de error** � Verificar claridad
  4. **Redirecciones** � Verificar URLs correctas
  5. **Estados de loading** � Verificar UX

## 4. Validaci�n y M�tricas de �xito

### **M�tricas T�cnicas**
-  **Funcional**: Continuaci�n de historias respeta l�mites mensuales
-  **Automatizaci�n**: Reseteo mensual ejecut�ndose correctamente
-  **Pagos**: Flujo de checkout sin errores (< 1% tasa de error)
-  **Webhooks**: Sincronizaci�n exitosa de eventos de Stripe (> 99%)

### **M�tricas de Usuario**
-  **Experiencia**: Usuarios conocen sus l�mites restantes
-  **Conversi�n**: Usuarios upgradeando cuando alcanzan l�mites
-  **Satisfacci�n**: Feedback positivo sobre claridad del sistema
-  **Retenci�n**: Usuarios no abandonando por confusi�n con l�mites

### **M�tricas de Negocio**
-  **Ingresos**: Suscripciones premium funcionando correctamente
-  **Churn**: Reducci�n en cancelaciones por problemas t�cnicos
-  **Soporte**: Reducci�n en tickets relacionados con l�mites/pagos
-  **Escalabilidad**: Sistema soportando crecimiento de usuarios

## 5. Consideraciones Adicionales

### **Seguridad**
- Todas las operaciones de cr�ditos deben ser server-side
- Validaci�n de webhooks de Stripe con signatures
- Rate limiting en endpoints de generaci�n de contenido
- Logs de auditor�a para cambios en suscripciones

### **Performance**
- Cach� de informaci�n de suscripci�n para reducir queries
- Optimizaci�n de webhooks para procesamiento r�pido
- Batch processing para reseteos mensuales masivos
- Monitoring de latencia en funciones Edge

### **Mantenimiento**
- Documentaci�n actualizada de flujos de pago
- Runbooks para troubleshooting de webhooks
- Monitoring y alertas para fallos cr�ticos
- Backup y recovery procedures para datos de suscripci�n

## 6. Cronograma de Implementaci�n

| Fase | Duraci�n | Dependencias | Entregables |
|------|----------|--------------|-------------|
| **Fase 1** | 3-5 d�as | Acceso a Supabase | L�mites cr�ticos resueltos |
| **Fase 2** | 2-3 d�as | Fase 1 completa | UI mejorada con indicadores |
| **Fase 3** | 2-3 d�as | Fase 2 completa | Monitoring implementado |
| **Fase 4** | 2-3 d�as | Fase 3 completa | Testing completo |

**Tiempo total estimado**: 9-14 d�as

## 7. Riesgos y Mitigaciones

### **Riesgo Alto**: Webhooks de Stripe fallan durante migraci�n
- **Mitigaci�n**: Implementar cola de retry y logs detallados
- **Rollback**: Mantener funcionalidad actual hasta validaci�n completa

### **Riesgo Medio**: Usuarios existentes pierden cr�ditos durante reseteo
- **Mitigaci�n**: Hacer backup de datos antes de implementar reseteo autom�tico
- **Rollback**: Script de restauraci�n de cr�ditos

### **Riesgo Bajo**: Performance degradada por nuevas validaciones
- **Mitigaci�n**: Optimizaci�n de queries y cach� estrat�gico
- **Rollback**: Flags de feature para deshabilitar validaciones pesadas

---

**Documento creado**: Enero 2025  
**Versi�n**: 1.0  
**Estado**: Pendiente de implementaci�n  
**Responsable**: Equipo de desarrollo  
**Pr�xima revisi�n**: Post-implementaci�n Fase 1