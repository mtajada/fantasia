# Plan de Resolución: Errores de Autenticación y Perfil

**Fecha**: Enero 2025  
**Prioridad**: Alta  
**Estimación**: 2-3 horas  

## Resumen Ejecutivo

Se han identificado dos errores críticos en el flujo de autenticación post-login:

1. **Error 1**: Usuario ve página "Not Found" tras login exitoso
2. **Error 2**: Bucle infinito entre configuración de perfil y selección de planes

## Análisis Detallado de Problemas

### 🔍 Error 1: Página "Not Found" tras Login

**Síntomas observados en logs**:
```
[Error] Failed to load resource: the server responded with a status of 406 (Not Acceptable) (profiles, line 0)
[Error] Error loading profile: PGRST116 - JSON object requested, multiple (or no) rows returned
```

**Causa raíz**:
- Usuario autenticado no tiene registro en tabla `profiles`
- La consulta `getUserProfile()` falla con error 406/PGRST116
- AuthGuard intenta redirigir a `/profile-config` pero hay inconsistencias

**Archivos afectados**:
- `src/services/supabase.ts:63-70` (getUserProfile)
- `src/store/user/userStore.ts:28-50` (loginUser)
- `src/components/AuthGuard.tsx:42-59` (redirect logic)

### 🔄 Error 2: Bucle entre Perfil y Planes

**Flujo problemático**:
1. Usuario completa configuración en `/profile-config`
2. Navega a `/plans` con botón "Continue with free plan"  
3. Sistema vuelve a redirigir a `/profile-config`

**Causa raíz**:
- El flag `has_completed_setup` no se actualiza correctamente
- Múltiples consultas asíncronas causan condiciones de carrera
- Diferencia temporal entre guardar perfil y verificar autenticación

**Archivos afectados**:
- `src/pages/ProfileConfigPage.tsx:127-138` (handleSubmit)
- `src/store/user/userStore.ts:218-253` (checkAuth)
- `src/pages/PlansPage.tsx:447-454` (continue button)

## Plan de Implementación

### 📋 Fase 1: Solución de Base de Datos - Opción B (15 min)

**Objetivo**: Usar funciones existentes y agregar triggers faltantes

#### Checklist:
- [x] Actualizar función existente `handle_new_user()`
- [x] Crear trigger faltante para nuevos usuarios
- [x] Crear triggers para `updated_at` automático
- [ ] Ejecutar migración para usuarios existentes sin perfil (obviar, he borrado todos los perfiles)

#### Código SQL para ejecutar en Supabase SQL Editor:

1. **Actualizar función existente**:
   ```sql
   -- Modificar función existente para incluir has_completed_setup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
   BEGIN
     INSERT INTO public.profiles (id, language, has_completed_setup)
     VALUES (new.id, 'en', false);
     RETURN new;
   END;
   $$;
   ```

2. **Crear trigger para nuevos usuarios**:
   ```sql
   -- Crear trigger para auto-generar perfiles
   CREATE TRIGGER trigger_create_profile_on_signup
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Crear triggers para updated_at**:
   ```sql
   -- Agregar triggers para actualizar timestamps automáticamente
   CREATE TRIGGER trigger_profiles_updated_at
       BEFORE UPDATE ON public.profiles
       FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

   CREATE TRIGGER trigger_characters_updated_at
       BEFORE UPDATE ON public.characters
       FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

   CREATE TRIGGER trigger_stories_updated_at
       BEFORE UPDATE ON public.stories
       FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

   CREATE TRIGGER trigger_story_chapters_updated_at
       BEFORE UPDATE ON public.story_chapters
       FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

   CREATE TRIGGER trigger_user_voices_updated_at
       BEFORE UPDATE ON public.user_voices
       FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
   ```

4. **Migración para usuarios existentes**:
   ```sql
   -- Crear perfiles para usuarios existentes que no los tengan
   INSERT INTO public.profiles (id, language, has_completed_setup, created_at, updated_at)
   SELECT id, 'en', false, now(), now() 
   FROM auth.users 
   WHERE id NOT IN (SELECT id FROM public.profiles);
   ```

### 📋 Fase 2: Mejorar ProfileConfigPage (45 min)

**Objetivo**: Hacer el guardado de perfil más robusto

#### Checklist:
- [x] Cambiar `update` por `upsert` en ProfileConfigPage
- [x] Mejorar manejo de errores
- [x] Agregar validación de estado antes de navegación

#### Tareas específicas:

1. **Modificar ProfileConfigPage.tsx líneas 114-125**:
   ```typescript
   // Cambiar de .update() a .upsert()
   const { error: updateError } = await supabase
       .from('profiles')
       .upsert({
           id: currentUser.id,
           language: language,
           preferences: preferences.trim() || null,
           has_completed_setup: true
       }, {
           onConflict: 'id'
       });
   ```

2. **Agregar verificación post-guardado**:
   ```typescript
   // Después del upsert, verificar que se guardó correctamente
   const { data: savedProfile } = await supabase
       .from('profiles')
       .select('has_completed_setup')
       .eq('id', currentUser.id)
       .single();

   if (!savedProfile?.has_completed_setup) {
       throw new Error('Profile was not saved correctly');
   }
   ```

### 📋 Fase 3: Optimizar UserStore (45 min)

**Objetivo**: Eliminar consultas redundantes y condiciones de carrera

#### Checklist:
- [x] Reducir llamadas a `getUserProfile()`
- [x] Mejorar función `checkAuth()`
- [x] Agregar mejor cache de estado

#### Tareas específicas:

1. **Simplificar userStore.ts función loginUser (líneas 28-61)**:
   ```typescript
   loginUser: async (user: User): Promise<void> => {
       setCurrentAuthUser(user.id);
       set({ user, intendedRedirectPath: null });

       try {
           // Una sola consulta para cargar perfil
           const { success, profile } = await getUserProfile(user.id);
           
           if (success && profile) {
               set({ profileSettings: profile });
               const redirectPath = profile.has_completed_setup ? '/home' : '/profile-config';
               set({ intendedRedirectPath: redirectPath });
           } else {
               // Si no hay perfil, debe ir a configuración
               set({ intendedRedirectPath: '/profile-config' });
           }

           // Cargar otros datos en segundo plano (no bloqueante)
           syncAllUserData(user.id);
       } catch (error) {
           console.error("Error cargando datos de usuario:", error);
           set({ intendedRedirectPath: '/profile-config' });
       }
   }
   ```

2. **Optimizar checkAuth() (líneas 218-253)**:
   ```typescript
   checkAuth: async (): Promise<User | null> => {
       try {
           const { user, error } = await getCurrentUser();

           if (user && !error) {
               set({ user });
               
               // Solo cargar perfil si no está en cache
               const currentProfile = get().profileSettings;
               if (!currentProfile || currentProfile.id !== user.id) {
                   const { success, profile } = await getUserProfile(user.id);
                   if (success && profile) {
                       set({ profileSettings: profile });
                   }
               }
               
               return user;
           } else {
               set({ user: null, profileSettings: null });
               return null;
           }
       } catch (e) {
           console.error("Error en checkAuth:", e);
           set({ user: null, profileSettings: null });
           return null;
       }
   }
   ```

### 📋 Fase 4: Mejorar Manejo de Errores (30 min)

**Objetivo**: Mejor experiencia cuando hay problemas de red/base de datos

#### Checklist:
- [x] Agregar mejores mensajes de error
- [x] Implementar retry logic básico
- [x] Mejorar UX de estados de carga

#### Tareas específicas:

1. **Mejorar getUserProfile en supabase.ts**:
   ```typescript
   export const getUserProfile = async (userId: string, retries = 2): Promise<{ success: boolean, profile?: ProfileSettings, error?: any }> => {
       for (let attempt = 0; attempt <= retries; attempt++) {
           try {
               console.log(`Requesting profile for user: ${userId} (attempt ${attempt + 1}/${retries + 1})`);
               
               const { data, error } = await supabase
                   .from("profiles")
                   .select("*")
                   .eq("id", userId)
                   .single();

               if (error && error.code === 'PGRST116') {
                   console.log(`Profile not found for user ${userId}. This is a definitive result, no retry.`);
                   return { success: false };
               } else if (error) {
                   console.warn(`Attempt ${attempt + 1} to fetch profile for ${userId} failed:`, error.message);
                   if (attempt === retries) {
                       console.error(`Final attempt to fetch profile for ${userId} failed after multiple retries.`, error);
                       throw error;
                   }
                   await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                   continue;
               }

               if (data) {
                   const profile: ProfileSettings = {
                       language: data.language,
                       preferences: data.preferences,
                       // ... resto de campos
                       has_completed_setup: data.has_completed_setup,
                   };
                   return { success: true, profile: profile };
               }
           } catch (error) {
               if (attempt === retries) {
                   console.error(`A critical error occurred while fetching profile for ${userId}. All retries failed.`, error);
                   return { success: false, error };
               }
           }
       }
       return { success: false };
   };
   ```

### 📋 Fase 5: Testing y Validación (30 min)

**Objetivo**: Verificar que ambos errores están resueltos

#### Checklist de Testing:

**Test 1: Nuevo usuario**
- [ ] Crear nuevo usuario
- [ ] Verificar que se crea perfil automáticamente
- [ ] Login exitoso → redirección a `/profile-config`
- [ ] Completar perfil → redirección a `/plans`
- [ ] Continuar con plan gratuito → redirección a `/home`

**Test 2: Usuario existente sin perfil**
- [ ] Usuario existente hace login
- [ ] Se crea perfil automáticamente si no existe
- [ ] Flujo normal de configuración funciona

**Test 3: Usuario con perfil completo**
- [ ] Login exitoso → redirección directa a `/home`
- [ ] No pasa por configuración de perfil

**Test 4: Casos de error**
- [ ] Error de red durante guardado de perfil
- [ ] Retry logic funciona correctamente
- [ ] Mensajes de error son claros para el usuario

#### Validación en Logs:
- [ ] No más errores 406 (Not Acceptable)
- [ ] No más errores PGRST116
- [ ] No más consultas redundantes a profiles
- [ ] Redirecciones funcionan correctamente

## Archivos a Modificar

### Base de Datos:
- `docs/sql_supabase.sql` - Agregar trigger y migration

### Frontend:
- `src/pages/ProfileConfigPage.tsx` - Cambiar update por upsert
- `src/store/user/userStore.ts` - Optimizar checkAuth y loginUser  
- `src/services/supabase.ts` - Mejorar getUserProfile con retry

## Consideraciones Importantes

1. **Backup**: Hacer backup de la base de datos antes de ejecutar migrations
2. **RLS**: Verificar que los triggers no rompen Row Level Security
3. **Performance**: Las consultas optimizadas deben mejorar el rendimiento
4. **UX**: Los usuarios no deben notar cambios negativos en la experiencia

## Criterios de Éxito

✅ **Error 1 resuelto**: Usuario nunca ve página "Not Found" tras login  
✅ **Error 2 resuelto**: No hay bucle entre configuración y planes  
✅ **Performance mejorado**: Menos consultas redundantes a base de datos  
✅ **UX mejorada**: Mejor manejo de errores y estados de carga  

---

**Nota**: Este plan se basa en el análisis de los logs del navegador y la revisión del código actual. Cada fase debe completarse y probarse antes de pasar a la siguiente.