# 🧪 Test Edge Functions - TaleMe

Script simplificado para testear las Edge Functions de múltiples personajes con autenticación real.

## 📋 Comandos Básicos

### Ejecutar todos los tests
```bash
cd test-edge-functions
deno run --allow-env --allow-net test-simple.js
```

### Ejecutar tests específicos
```bash
# Solo test de múltiples personajes
deno run --allow-env --allow-net test-simple.js multiple

# Solo test de personaje único 
deno run --allow-env --allow-net test-simple.js single

# Solo test de continuación
deno run --allow-env --allow-net test-simple.js continue
```

### Con output detallado (para debugging)
```bash
deno run --allow-env --allow-net test-simple.js --verbose
deno run --allow-env --allow-net test-simple.js multiple --verbose
```

### Solo test de múltiples personajes (para debugging)
```bash
# Para diagnosticar problemas sin consumir créditos extra
deno run --allow-env --allow-net test-simple.js multiple --verbose
```

### Ver ayuda
```bash
deno run --allow-env --allow-net test-simple.js --help
```

## 🎯 Qué hace cada test

1. **multiple**: Genera historia con 3 personajes (Luna, Chef Max, Dra. Ruby)
2. **single**: Genera historia con 1 personaje (Capitán Leo) 
3. **continue**: Genera opciones de continuación

## 🔧 Variables configuradas

- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ GEMINI_API_KEY
- ✅ Modelo: gemini-2.5-flash

## 🔐 Autenticación

El script intenta crear automáticamente un usuario test, pero puede encontrar límites de rate:

### Si aparece "email rate limit exceeded":

**Opción 1: Crear usuario manualmente**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a Authentication > Users
4. Crea un usuario: `test@example.com` / `password123!`

**Opción 2: Esperar y reintentar**
```bash
# Esperar 1-2 minutos y volver a ejecutar
deno run --allow-env --allow-net test-simple.js
```

**Opción 3: Usar usuario existente**
Modifica las credenciales en `test-simple.js`:
```javascript
const TEST_USER_EMAIL = "tu-email@ejemplo.com";
const TEST_USER_PASSWORD = "tu-password";
```

## 📁 Archivos

- `test-simple.js` - Script principal con autenticación
- `test-data.js` - Datos de prueba
- `README.md` - Esta documentación

## 🚀 Ejemplo de uso rápido

```bash
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"
deno run --allow-env --allow-net test-simple.js
```

## 🔍 Debugging de Múltiples Personajes

Si uno o más personajes no aparecen en la historia generada:

### Comando de debugging:
```bash
deno run --allow-env --allow-net test-simple.js multiple --verbose
```

### Qué analizar:

1. **Payload enviado**: Verificar que `options.characters` contiene todos los personajes
2. **Respuesta del modelo**: Ver si menciona todos los personajes en el contenido
3. **Prompt generation**: El problema puede estar en cómo la Edge Function construye el prompt

### Información que se muestra:

- ✅ **Payload completo**: JSON enviado a la Edge Function
- ✅ **Headers**: Autenticación y metadatos
- ✅ **Respuesta completa**: Lo que devuelve el modelo de lenguaje
- ✅ **Análisis de personajes**: Conteo de menciones por personaje

### Posibles causas:

1. **Edge Function**: No procesa correctamente el array `characters`
2. **Prompt**: No incluye todos los personajes en las instrucciones
3. **Modelo de lenguaje**: Ignora algunos personajes en la respuesta
4. **Token limits**: Respuesta truncada por límites de tokens

## ⚠️ Solución de problemas

### Error: "invalid claim: missing sub claim"
- Las Edge Functions requieren autenticación de usuario real
- El script está intentando crear un usuario test automáticamente
- Si persiste, crear usuario manualmente en Supabase Dashboard

### Error: "email rate limit exceeded"  
- Supabase limita la creación de usuarios
- Esperar 1-2 minutos o crear usuario manualmente
- El script intentará con múltiples usuarios test

### Error: "Límite mensual alcanzado"
- Usuario free tiene límite de 10 historias/mes
- Usar solo tests específicos: `multiple`, `continue`
- Evitar ejecutar todos los tests juntos

¡Eso es todo! 🎉