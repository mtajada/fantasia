# Guía de Integración con Supabase

## Problemas Identificados

### Problemas de Sincronización de Datos

1. **Persistencia entre sesiones:**
   - Los usuarios podían iniciar sesión, pero sus datos generados (historias,
     personajes, etc.) no estaban correctamente vinculados a su cuenta.
   - Cuando un usuario cerraba sesión e iniciaba con otra cuenta, veía el
     contenido creado por el usuario anterior.
   - Al limpiar el navegador o cambiar de dispositivo, los usuarios perdían
     acceso a su contenido previamente creado.

2. **Sobrescritura de personajes:**
   - Cuando un usuario creaba un nuevo personaje, el anterior desaparecía.
   - En lugar de mantener múltiples personajes por usuario, el sistema
     reemplazaba el personaje anterior con el nuevo.
   - Al cargar datos desde Supabase, se limpiaba el array de personajes
     guardados antes de cargar.
   - El uso incorrecto de `upsert` con `onConflict: 'id'` causaba que nuevos
     personajes reemplazaran a los existentes.

3. **Inconsistencia en IDs:**
   - Algunos personajes no tenían IDs generados consistentemente.
   - Faltaba validación en la creación de nuevos personajes para garantizar IDs
     únicos.
   - No se separaban claramente las operaciones de creación y actualización.

4. **Filtración de datos entre usuarios:**
   - Los personajes de otros usuarios aparecían en la interfaz después de
     cambiar de cuenta.
   - La función de limpieza de localStorage (`cleanPreviousUserStores`) estaba
     deshabilitada.
   - Las operaciones de carga no filtraban correctamente por el ID del usuario
     actual.
   - Los datos del usuario anterior permanecían en localStorage después de
     iniciar sesión con una nueva cuenta.

## Soluciones Implementadas

### 1. Arquitectura de Sincronización Mejorada

Hemos rediseñado la arquitectura de sincronización para asegurar que:

1. Cada usuario tenga sus propios datos separados tanto en el almacenamiento
   local como en Supabase
2. Los datos se vinculen correctamente a cada usuario por su ID
3. La sincronización funcione de manera bidireccional para mantener la
   persistencia de los datos

#### Nombres de Store Vinculados al Usuario

Modificamos `createPersistentStore` para incluir el ID del usuario en el nombre
del store de Zustand:

```typescript
export const createPersistentStore = <T>(
    initialState: Partial<T>,
    storeLogic: (set: Function, get: Function) => Partial<T>,
    storeName: string,
) => {
    return create<T>()(
        persist(
            (set, get) =>
                ({
                    ...initialState,
                    ...storeLogic(set, get),
                }) as T,
            {
                name: getStoreNameWithUserId(storeName),
                // ...
            },
        ),
    );
};
```

De esta forma, cada usuario tiene sus propios stores en localStorage, evitando
mezclar datos entre usuarios.

#### Validación de Usuario en Cada Operación

Implementamos una validación estricta de seguridad en las operaciones de
Supabase:

```typescript
const validateUserId = async (providedUserId: string): Promise<boolean> => {
    // Verifica que el ID de usuario proporcionado coincida con el usuario autenticado
    // ...
    return isValid;
};
```

Esta función se utiliza en cada operación de Supabase para asegurar que:

- El usuario está autenticado
- El usuario está intentando acceder/modificar solo sus propios datos

#### Limpieza de Datos al Cambiar de Usuario

Cuando un usuario cierra sesión o un nuevo usuario inicia sesión, limpiamos
todos los datos del usuario anterior:

```typescript
export const cleanPreviousUserStores = (currentUserId: string) => {
    console.log(`Limpiando stores previos para usuario: ${currentUserId}`);

    let cleaned = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("story-app-")) {
            // Si no es una clave del usuario actual y no es la clave global de usuario
            if (
                !key.includes(`-${currentUserId}-`) &&
                !key.includes("story-app-user")
            ) {
                console.log(`Eliminando store: ${key}`);
                localStorage.removeItem(key);
                i--; // Ajustar el índice
                cleaned++;
            }
        }
    }
    console.log(`Se limpiaron ${cleaned} stores anteriores`);
};
```

Este proceso es fundamental para garantizar que el usuario actual solo ve sus
propios datos y no los de usuarios anteriores. La causa principal de la
filtración de datos entre usuarios era que esta función estaba comentada en el
código.

#### Carga de Datos Filtrada por Usuario

Para garantizar que solo se cargan los datos del usuario actual, cada función de
carga desde Supabase:

1. Verifica que el usuario esté autenticado
2. Limpia los datos existentes antes de cargar nuevos
3. Filtra explícitamente por el ID del usuario actual en las consultas a
   Supabase

```typescript
const loadCharactersFromSupabase = async (userId: string) => {
    try {
        // Primero, limpiar el array existente para evitar mezclar personajes
        set({ savedCharacters: [] });

        // Log para depuración
        console.log(
            `[DEBUG] Consultando personajes SOLO para el usuario con ID: ${userId}`,
        );

        const { success, characters } = await getUserCharacters(userId);

        if (success && characters) {
            // Establecer solo los personajes recuperados de Supabase
            set({ savedCharacters: characters });
        }
    } catch (error) {
        console.error(
            `Error cargando personajes desde Supabase para usuario ${userId}:`,
            error,
        );
    }
};
```

#### Sincronización Bidireccional

La sincronización bidireccional asegura que:

1. Los datos creados localmente se sincronizan con Supabase
2. Al iniciar sesión, los datos se cargan desde Supabase

Por ejemplo, en `userStore.ts`:

```typescript
syncAllUserData(user.id);
```

Este método carga todos los datos del usuario desde Supabase, incluyendo
historias, personajes, etc.

### 2. Corrección de la Gestión de Personajes

Para solucionar el problema de sobrescritura de personajes, implementamos los
siguientes cambios:

#### Función `syncCharacter` mejorada

En lugar de usar `upsert` con `onConflict: 'id'`, que sobrescribía personajes
existentes, modificamos la función para decidir explícitamente entre actualizar
o insertar:

```typescript
export const syncCharacter = async (
    userId: string,
    character: StoryCharacter,
) => {
    try {
        // Verificar si ya existe un personaje con ese ID
        const { data: existingChar, error: existingError } = await supabase
            .from("characters")
            .select("id, name, user_id")
            .eq("id", character.id)
            .maybeSingle();

        // Preparar datos para guardar
        const characterData = {
            id: character.id,
            user_id: userId,
            name: character.name,
            hobbies: character.hobbies,
            description: character.description,
            profession: character.profession,
            character_type: character.characterType,
            personality: character.personality,
            updated_at: new Date(),
        };

        let result;

        // Si el personaje ya existe, actualizarlo; si no, insertarlo como nuevo
        if (existingChar) {
            // Si el personaje pertenece a otro usuario, no permitir sobreescribirlo
            if (existingChar.user_id !== userId) {
                return {
                    success: false,
                    error: new Error(
                        "No tienes permiso para modificar este personaje",
                    ),
                };
            }

            // Actualizar el personaje existente
            result = await supabase
                .from("characters")
                .update(characterData)
                .eq("id", character.id)
                .eq("user_id", userId);
        } else {
            // Insertar nuevo personaje
            result = await supabase
                .from("characters")
                .insert(characterData);
        }

        // Resto del código...
    } catch (error) {
        // Manejo de errores...
    }
};
```

#### Preservación de personajes al cargar desde Supabase

Modificamos la función `loadCharactersFromSupabase` para no limpiar la lista de
personajes antes de cargar:

```typescript
const loadCharactersFromSupabase = async (userId: string) => {
    try {
        // Ya no limpiamos el array antes de cargar para evitar sobreescribir
        // set({ savedCharacters: [] });  <- ELIMINADO

        const { success, characters } = await getUserCharacters(userId);

        if (success && characters) {
            // En lugar de reemplazar todo, actualizar los existentes y agregar los nuevos
            set((state) => {
                const currentCharacters = [...state.savedCharacters];
                const updatedCharacters = [...currentCharacters];

                // Actualizar o agregar personajes nuevos
                characters.forEach((character) => {
                    const existingIndex = currentCharacters.findIndex((c) =>
                        c.id === character.id
                    );
                    if (existingIndex >= 0) {
                        // Actualizar existente
                        updatedCharacters[existingIndex] = character;
                    } else {
                        // Agregar nuevo
                        updatedCharacters.push(character);
                    }
                });

                return { savedCharacters: updatedCharacters };
            });
        }
    } catch (error) {
        // Manejo de errores...
    }
};
```

#### Generación consistente de IDs para nuevos personajes

Mejoramos la función `resetCharacter` para garantizar IDs únicos:

```typescript
resetCharacter: (() => {
    console.log("Reseteando personaje actual con nuevo ID");
    const newId = generateId("char");
    console.log(`Nuevo ID generado: ${newId}`);

    // Crear un personaje completamente vacío con un nuevo ID
    set({
        currentCharacter: {
            id: newId,
            name: "",
            hobbies: [],
            description: "",
            profession: "",
            characterType: "",
            personality: "",
        },
    });
});
```

También aseguramos que al crear un nuevo personaje siempre se llame a
`resetCharacter`:

```typescript
const handleCreateNewCharacter = () => {
    // Resetear el personaje actual para asegurar un ID único
    const { resetCharacter } = useCharacterStore.getState();
    resetCharacter();
    navigate("/character-name");
};
```

## Flujo de Datos

### 1. Ciclo de vida de la autenticación

#### Inicio de Sesión

- Usuario inicia sesión/se registra
- El ID de usuario se almacena globalmente con `setCurrentAuthUser`
- Se configuran los nombres de store con el ID de usuario
- Se cargan los datos del usuario desde Supabase

#### Durante la sesión

- Los stores mantienen estado local y se sincronizan periódicamente con Supabase
- Las operaciones críticas se sincronizan inmediatamente
- Operaciones fallidas se agregan a la cola de sincronización

#### Cierre de Sesión

- Se sincronizan datos pendientes con Supabase
- Se resetea el ID de usuario global con `setCurrentAuthUser(null)`
- Se limpian los datos locales del usuario

### 2. Ciclo de vida de un personaje

1. **Creación:**
   - Al iniciar la creación, se genera un ID único con `resetCharacter()`
   - El usuario completa la información del personaje a través de varios pasos
   - Cada actualización llama a `updateCharacter()` que preserva el ID
   - Al finalizar, se llama a `saveCurrentCharacter()` que:
     - Guarda localmente el personaje con su ID en `savedCharacters`
     - Sincroniza con Supabase usando `syncCharacter()`

2. **Carga:**
   - Al iniciar sesión o entrar a la pantalla de selección, se cargan personajes
     con `loadCharactersFromSupabase()`
   - La función mantiene personajes existentes y agrega/actualiza nuevos
   - Cada personaje mantiene su ID único

3. **Selección:**
   - Al seleccionar un personaje existente, se usa
     `selectCharacter(characterId)`
   - Esto establece el personaje actual sin modificar su ID

4. **Actualización:**
   - Al editar un personaje existente, se usa su ID original
   - Los cambios se sincronizan con Supabase manteniendo el mismo ID

5. **Eliminación:**
   - Se elimina localmente y en Supabase mediante `deleteCharacter(characterId)`
   - Se verifica que el usuario sea el propietario antes de permitir la
     eliminación

## Verificaciones de Seguridad

### 1. Validación de Propiedad y Permisos

Cada operación en Supabase verifica que:

- El usuario esté autenticado
- El ID de usuario coincida con el token de autenticación
- El usuario solo acceda a sus propios datos

```typescript
// Verificar que el recurso pertenezca al usuario actual
const { data } = await supabase
    .from("resource_table")
    .select("user_id")
    .eq("id", resourceId)
    .single();

if (!data || data.user_id !== userId) {
    return {
        success: false,
        error: new Error("No tienes permiso para esta operación"),
    };
}
```

### 2. Políticas de Seguridad en Supabase (RLS)

Las políticas RLS (Row Level Security) en Supabase son cruciales para restringir
el acceso a nivel de base de datos:

```sql
-- Ejemplo de políticas RLS para personajes
CREATE POLICY "Los usuarios pueden ver sus propios personajes" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden crear sus propios personajes" ON public.characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propios personajes" ON public.characters
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propios personajes" ON public.characters
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Validación de IDs

Aseguramos que:

- Cada personaje tenga un ID único mediante `generateId("char")`
- Se valide el formato y estructura de los IDs
- No se permita la modificación de IDs una vez asignados

## Patrones y Mejores Prácticas

### 1. Patrones de Arquitectura

#### Patrón de Store con Cache y Sincronización

- Almacenamiento local para operaciones rápidas (Zustand + localStorage)
- Sincronización con la base de datos remota (Supabase)
- Cola de sincronización para operaciones fallidas

#### Patrón de Validación en Capas

- Validación en UI (front-end)
- Validación en el servicio (lógica de negocio)
- Validación en la base de datos (RLS en Supabase)

### 2. Mejores Prácticas

#### Gestión de IDs

- Generar IDs únicos en el cliente para poder trabajar offline
- Usar un formato consistente para los IDs (prefijos, UUIDs, etc.)
- Verificar la unicidad de los IDs antes de insertar

#### Operaciones de Actualización vs Inserción

- Ser explícito sobre cuando actualizar o insertar (no usar `upsert`
  automáticamente)
- Verificar la existencia y propiedad antes de actualizar

#### Limpieza de Datos

- No limpiar colecciones completas antes de cargar nueva data
- Usar actualizaciones incrementales/diferenciales
- Mantener una estrategia de merge clara para conflictos

#### Logs y Depuración

- Incluir logs detallados para las operaciones de sincronización
- Usar identificadores de sesión para agrupar logs relacionados
- Registrar errores con contexto suficiente para diagnosticar problemas

## Errores Comunes a Evitar

### 1. Sobrescritura de Datos

#### ❌ Error: Limpiar colecciones antes de cargar

```typescript
// Incorrecto: Elimina todos los personajes existentes
set({ savedCharacters: [] });
const { success, characters } = await getUserCharacters(userId);
if (success && characters) {
    set({ savedCharacters: characters });
}
```

#### ✅ Solución: Actualizar de forma incremental

```typescript
const { success, characters } = await getUserCharacters(userId);
if (success && characters) {
    set((state) => {
        const currentCharacters = [...state.savedCharacters];
        // Actualizar existentes y agregar nuevos...
        return { savedCharacters: updatedCharacters };
    });
}
```

**Nota:** En el caso específico de cambio de usuario, sí es recomendable limpiar
completamente los datos antes de cargar los del nuevo usuario, pero esto debe
hacerse en el proceso de login/logout, no en cada operación de carga.

### 2. Uso incorrecto de `upsert`

#### ❌ Error: Usar upsert sin control adecuado

```typescript
// Incorrecto: Puede sobrescribir datos no intencionalmente
const { error } = await supabase
    .from("characters")
    .upsert(characterData, { onConflict: "id" });
```

#### ✅ Solución: Decisión explícita entre actualizar o insertar

```typescript
// Verificar existencia primero
const { data: existing } = await supabase
    .from("characters")
    .select("id")
    .eq("id", characterId)
    .maybeSingle();

// Luego decidir explícitamente
if (existing) {
    // Actualizar
    await supabase.from("characters").update(data).eq("id", characterId);
} else {
    // Insertar
    await supabase.from("characters").insert(data);
}
```

### 3. No validar propiedad antes de operaciones

#### ❌ Error: Actualizar sin verificar propiedad

```typescript
// Incorrecto: No verifica si el usuario es propietario
await supabase
    .from("characters")
    .update(characterData)
    .eq("id", characterId);
```

#### ✅ Solución: Verificar propiedad primero

```typescript
// Verificar propiedad
const { data } = await supabase
    .from("characters")
    .select("user_id")
    .eq("id", characterId)
    .single();

if (!data || data.user_id !== userId) {
    return { success: false, error: "No tienes permiso" };
}

// Luego actualizar
await supabase
    .from("characters")
    .update(characterData)
    .eq("id", characterId)
    .eq("user_id", userId); // Doble verificación
```

### 4. No manejar IDs consistentemente

#### ❌ Error: Generación inconsistente de IDs

```typescript
// Incorrecto: No garantiza unicidad entre sesiones
const id = Math.random().toString();
// o
const id = new Date().getTime().toString();
```

#### ✅ Solución: Usar generación de IDs consistente

```typescript
// Recomendado: UUID v4 o similar con prefijo para categorizar
import { v4 as uuidv4 } from "uuid";
const id = `char_${uuidv4()}`;
// o
const generateId = (prefix: string) => `${prefix}_${uuidv4()}`;
const id = generateId("char");
```

### 5. No limpiar datos de usuarios anteriores

#### ❌ Error: Comentar o deshabilitar la limpieza de localStorage

```typescript
// Incorrecto: La función está comentada o deshabilitada
export const cleanPreviousUserStores = (currentUserId: string) => {
    console.log(
        `[DEBUG] DESACTIVADO - Limpiando stores previos para usuario: ${currentUserId}`,
    );
    /*
  let cleaned = 0;
  for (let i = 0; i < localStorage.length; i++) {
    // Código de limpieza...
  }
  */
};
```

#### ✅ Solución: Mantener activa la limpieza de localStorage

```typescript
// Correcto: Activamente limpia los datos de usuarios anteriores
export const cleanPreviousUserStores = (currentUserId: string) => {
    console.log(`Limpiando stores previos para usuario: ${currentUserId}`);

    let cleaned = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("story-app-")) {
            // Si no es una clave del usuario actual y no es la clave global de usuario
            if (
                !key.includes(`-${currentUserId}-`) &&
                !key.includes("story-app-user")
            ) {
                console.log(`Eliminando store: ${key}`);
                localStorage.removeItem(key);
                i--; // Ajustar el índice
                cleaned++;
            }
        }
    }
    console.log(`Se limpiaron ${cleaned} stores anteriores`);
};
```

Este paso es crítico para evitar la filtración de datos entre usuarios. Sin esta
limpieza, los personajes y otros datos de usuarios anteriores permanecerán en
localStorage y podrían mezclarse con los datos del usuario actual.

## Para Desarrolladores

### 1. Creación de Nuevos Stores

- Usa siempre `createPersistentStore` para crear nuevos stores
- Implementa funciones de carga desde Supabase (`loadXXXFromSupabase`)
- Agrega la sincronización al método `syncAllUserData` en userStore
- Asegúrate de que tu función de carga haga limpieza de datos existentes al
  cambiar de usuario

### 2. Nuevas Tablas en Supabase

- Asegúrate que cada tabla tenga un campo `user_id`
- Implementa políticas de seguridad RLS (Row Level Security) en Supabase para
  cada operación (SELECT, INSERT, UPDATE, DELETE)
- Valida siempre el `user_id` en las consultas
- Utiliza el filtro `.eq("user_id", userId)` en todas las consultas

### 3. Verificación de Estado de Autenticación

- Usa `useUserStore.getState().user` para verificar si hay un usuario
  autenticado
- Para operaciones críticas, verifica también con `supabase.auth.getSession()`
- Incluye timeout y manejo de errores para las verificaciones de autenticación

### 4. Gestión de Errores de Sincronización

- Utiliza `syncQueue.addToQueue()` para operaciones que fallan
- Implementa reintentos para operaciones críticas
- Proporciona feedback al usuario cuando sea apropiado

## Posibles Mejoras Futuras

1. Implementar una estrategia de sincronización offline/online más robusta
   - Indicadores visuales de estado de sincronización
   - Resincronización automática cuando se recupera la conexión

2. Mejorar el manejo de conflictos cuando se modifican datos en múltiples
   dispositivos
   - Estrategia basada en timestamps para resolución de conflictos
   - UI para resolución manual de conflictos en casos críticos

3. Implementar pruebas automatizadas para la sincronización
   - Tests unitarios para funciones de sincronización
   - Tests de integración para el flujo completo

4. Agregar eventos para notificar a la UI sobre estados de sincronización
   - Sistema de eventos centralizado para estados (en progreso, completado,
     error)
   - Toast notifications para errores críticos de sincronización

5. Optimización de rendimiento
   - Batch updates para sincronización masiva
   - Sincronización diferencial (solo enviar cambios, no objetos completos)
   - Compresión de datos para reducir el tamaño de las transferencias
