# Story Continuation Edge Function

Esta función edge de Supabase se encarga de generar continuaciones para
historias infantiles utilizando la API de Gemini (Google AI).

## Funcionalidad

- Genera continuaciones coherentes y creativas para historias existentes.
- Ofrece opciones de continuación estilo "elige tu propia aventura".
- Permite continuaciones libres, dirigidas por el usuario o basadas en opciones
  predefinidas.
- Genera títulos para nuevos capítulos.
- Mantiene la coherencia con el tono, estilo y narrativa del contenido anterior.

## Acciones disponibles

### 1. Generar opciones de continuación (`generateOptions`)

#### Formato de solicitud

```json
{
    "action": "generateOptions",
    "story": {
        "id": "id-de-la-historia",
        "title": "Título de la historia",
        "content": "Contenido principal de la historia...",
        "options": {
            "character": {/* datos del personaje */},
            "genre": "Género de la historia",
            "moral": "Enseñanza o moraleja",
            "duration": "short|medium|long"
        }
    },
    "chapters": [
        {
            "id": "id-del-capítulo",
            "storyId": "id-de-la-historia",
            "title": "Título del capítulo",
            "content": "Contenido del capítulo...",
            "order": 1,
            "createdAt": "2023-01-01T00:00:00.000Z"
        }
        // Más capítulos si existen...
    ]
}
```

#### Formato de respuesta

```json
{
    "options": [
        { "summary": "Buscar el tesoro escondido en el bosque." },
        { "summary": "Hablar con el misterioso anciano del pueblo." },
        { "summary": "Seguir el camino hacia las montañas nevadas." }
    ]
}
```

### 2. Continuación libre (`freeContinuation`)

#### Formato de solicitud

```json
{
    "action": "freeContinuation",
    "story": {/* datos de la historia */},
    "chapters": [/* capítulos existentes */]
}
```

#### Formato de respuesta

```json
{
    "content": "Texto completo de la continuación generada..."
}
```

### 3. Continuación basada en opción seleccionada (`optionContinuation`)

#### Formato de solicitud

```json
{
    "action": "optionContinuation",
    "story": {/* datos de la historia */},
    "chapters": [/* capítulos existentes */],
    "optionIndex": 0 // Índice de la opción seleccionada (0, 1 o 2)
}
```

#### Formato de respuesta

```json
{
    "content": "Texto completo de la continuación generada basada en la opción seleccionada..."
}
```

### 4. Continuación dirigida por el usuario (`directedContinuation`)

#### Formato de solicitud

```json
{
    "action": "directedContinuation",
    "story": {/* datos de la historia */},
    "chapters": [/* capítulos existentes */],
    "userDirection": "Instrucciones del usuario para dirigir la continuación..."
}
```

#### Formato de respuesta

```json
{
    "content": "Texto completo de la continuación generada siguiendo las instrucciones del usuario..."
}
```

### 5. Generar título para un capítulo (`generateTitle`)

#### Formato de solicitud

```json
{
    "action": "generateTitle",
    "content": "Contenido del capítulo para el cual se generará un título..."
}
```

#### Formato de respuesta

```json
{
    "title": "Título generado para el capítulo"
}
```

## Variables de entorno

- `GEMINI_API_KEY`: Clave API para el servicio de Gemini API de Google.
