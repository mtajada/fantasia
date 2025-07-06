# 🧪 Test Edge Functions - TaleMe

Scripts para testear Edge Functions de múltiples personajes con autenticación real.

## 🎯 Tests Disponibles

### 📖 Story Generation (generate-story)
- **`multiple`**: Genera historia con 3 personajes (Luna, Chef Max, Dra. Ruby)
- **`single`**: Genera historia con 1 personaje (Capitán Leo) - *Compatibilidad hacia atrás*

### 📚 Story Continuation (story-continuation) 
- **`continue`**: Genera opciones de continuación para historia existente

---

## 🚀 Comandos por Caso de Uso

### 🔬 Testing & Desarrollo

```bash
# SIEMPRE ejecutar desde la carpeta correcta:
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Ejecutar todos los tests (consume más créditos)
deno run --allow-env --allow-net test-simple.js

# Solo Story Generation - Múltiples personajes
deno run --allow-env --allow-net test-simple.js multiple

# Solo Story Continuation 
deno run --allow-env --allow-net test-simple.js continue

# Solo compatibilidad hacia atrás (personaje único)
deno run --allow-env --allow-net test-simple.js single
```

### 🔍 Debugging & Diagnóstico

```bash
# PRIMERO: Ir a la carpeta correcta
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Ver payload completo enviado a Edge Functions
deno run --allow-env --allow-net test-simple.js multiple --verbose

# Diagnosticar por qué faltan personajes en historias
deno run --allow-env --allow-net test-simple.js multiple --verbose

# Ver respuesta completa del modelo de lenguaje
deno run --allow-env --allow-net test-simple.js continue --verbose

# Debugging completo (todos los tests con logs)
deno run --allow-env --allow-net test-simple.js --verbose
```

### 💡 Casos Específicos

```bash
# PRIMERO: Ir a la carpeta correcta
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Problema: Dra. Ruby no aparece en historias
deno run --allow-env --allow-net test-simple.js multiple --verbose

# Verificar que Story Continuation funciona
deno run --allow-env --allow-net test-simple.js continue

# Validar compatibilidad hacia atrás sin gastar créditos extra
deno run --allow-env --allow-net test-simple.js single

# Ver ayuda completa
deno run --allow-env --allow-net test-simple.js --help
```

---

## 🔍 Información de Debugging

### 📊 Con `--verbose` verás:

- **📤 Payload completo**: JSON exacto enviado a la Edge Function
- **🔐 Headers**: Autenticación y metadatos de la request
- **📥 Respuesta completa**: Output del modelo de lenguaje (Gemini)
- **🎯 Análisis detallado**: Conteo de menciones por personaje

### 🕵️ Para diagnosticar problemas:

1. **Edge Function no recibe datos**: Verificar payload en logs
2. **Modelo ignora personajes**: Ver respuesta completa en logs  
3. **Prompt mal formado**: Revisar cómo se construye el prompt
4. **Token limits**: Verificar si la respuesta se trunca

### 📈 Análisis de Personajes

El script muestra automáticamente:
```
📊 Análisis de Personajes:
  ✅ Luna: 15 menciones
  ✅ Chef Max: 10 menciones  
  ❌ Dra. Ruby: 0 menciones  ← Problema detectado
```

---

## 🔧 Configuración

### Variables Ya Configuradas ✅
- **SUPABASE_URL**: Proyecto TaleMe  
- **SUPABASE_ANON_KEY**: Autenticación pública
- **SUPABASE_SERVICE_ROLE_KEY**: Autenticación admin (fallback)
- **GEMINI_API_KEY**: Google Generative AI
- **Usuario Test**: 4zgz2000@gmail.com (configurado)

### Modelo de Lenguaje
- **Modelo**: gemini-2.5-flash
- **Configurado en**: Edge Functions de Supabase
- **Endpoint**: Via OpenAI-compatible API

---

## 📁 Archivos del Proyecto

- **`test-simple.js`**: Script principal con autenticación y logging
- **`test-data.js`**: Datos de prueba (personajes, payloads, validadores)  
- **`README.md`**: Esta documentación

---

## ⚠️ Troubleshooting

### 🔐 Problemas de Autenticación

**Error: "invalid claim: missing sub claim"**
- ✅ **Solucionado**: Script usa usuario real de la aplicación
- Si persiste: Verificar credenciales en `test-simple.js`

**Error: "email rate limit exceeded"**
- Las credenciales actuales son de usuario real (no necesita crear usuario)
- Si aparece: Usuario real está configurado, no debería ocurrir

### 💳 Límites de Uso

**Error: "Límite mensual (10) alcanzado"**
- Usuario free tiene límite de 10 historias/mes
- **Solución**: Usar tests específicos para no gastar créditos:
  ```bash
  deno run --allow-env --allow-net test-simple.js continue  # Solo continuación
  deno run --allow-env --allow-net test-simple.js multiple # Solo múltiples
  ```

### 🐛 Problemas de Personajes

**Personajes no aparecen en historias**
1. Ejecutar debugging: `deno run --allow-env --allow-net test-simple.js multiple --verbose`
2. Verificar payload: ¿Llegan los 3 personajes en `options.characters`?
3. Ver respuesta: ¿Menciona Gemini a todos los personajes?
4. Si payload OK pero respuesta incompleta: Problema en prompt generation

---

## 🎯 Casos de Uso Recomendados

### 👨‍💻 Desarrollo
```bash
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Test rápido después de cambios en Edge Functions
deno run --allow-env --allow-net test-simple.js multiple

# Validar Story Continuation tras cambios
deno run --allow-env --allow-net test-simple.js continue
```

### 🔧 Debugging
```bash
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Investigar problemas de personajes
deno run --allow-env --allow-net test-simple.js multiple --verbose

# Ver logs completos de continuación
deno run --allow-env --allow-net test-simple.js continue --verbose
```

### ✅ Testing Completo
```bash
cd "/Users/miguel/Mizat Ventures/TaleMe/test-edge-functions"

# Ejecutar suite completa (cuidado con límites de créditos)
deno run --allow-env --allow-net test-simple.js
```

---

**¡Todo listo para testear! 🎉**

**Comando más usado**: `deno run --allow-env --allow-net test-simple.js multiple --verbose`