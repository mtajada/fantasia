# Edge Functions de CuentaSueños

Este documento describe las Edge Functions implementadas en Supabase para
manejar la generación de contenido utilizando modelos de lenguaje.

## Descripción General

Se han implementado las siguientes Edge Functions:

1. **generate-story**: Genera historias personalizadas basadas en las opciones
   proporcionadas.
2. **challenge**: Crea desafíos educativos basados en historias.
3. **story-continuation**: Genera continuaciones para historias existentes.

Estas funciones utilizan el modelo de lenguaje
**gemini-2.0-flash-thinking-exp-01-21** de Google para generar contenido de alta
calidad, permitiendo:

- Mantener las claves API seguras en el servidor.
- Reducir la carga en el dispositivo del cliente.
- Centralizar la lógica de generación de contenido.
- Mejorar la seguridad y el rendimiento.

## Configuración

Las funciones utilizan las siguientes variables de entorno:

- `GEMINI_API_KEY`: Clave para acceder a la API de Gemini de Google.

Para configurar las variables de entorno en Supabase:

```bash
supabase secrets set GEMINI_API_KEY="tu-clave-api"
```

## Funciones Disponibles

### generate-story

Genera una historia infantil personalizada basada en las opciones
proporcionadas.

#### Solicitud:

```json
{
    "options": {
        "character": {
            "name": "Nombre del personaje",
            "profession": "Profesión",
            "hobbies": ["Afición 1", "Afición 2"],
            "characterType": "Tipo de personaje",
            "personality": "Personalidad"
        },
        "genre": "Género de la historia",
        "moral": "Enseñanza o moraleja",
        "duration": "short|medium|long"
    },
    "language": "español",
    "childAge": 7,
    "specialNeed": "Ninguna|TEA|TDAH|Dislexia|Ansiedad|Down|Comprension"
}
```

#### Respuesta:

```json
{
    "content": "Texto completo de la historia generada..."
}
```

### challenge

Genera desafíos educativos basados en historias.

#### Acción: createChallenge

##### Solicitud:

```json
{
    "action": "createChallenge",
    "story": {
        "id": "id-de-la-historia",
        "title": "Título de la historia",
        "content": "Contenido completo de la historia...",
        "options": {
            "character": {
                "id": "id-del-personaje",
                "name": "Nombre del personaje",
                "profession": "Profesión",
                "characterType": "Tipo de personaje",
                "hobbies": ["Afición 1", "Afición 2"],
                "personality": "Personalidad"
            },
            "genre": "Género de la historia",
            "moral": "Enseñanza o moraleja",
            "duration": "short|medium|long"
        }
    },
    "category": "language|math|comprehension",
    "profileSettings": {
        "childAge": 7,
        "specialNeed": "Ninguna|TEA|TDAH|Dislexia",
        "language": "es"
    },
    "targetLanguage": "en" // Solo para desafíos de idiomas
}
```

##### Respuesta:

```json
{
    "id": "id-del-desafío",
    "storyId": "id-de-la-historia",
    "questions": [
        {
            "id": "id-de-la-pregunta",
            "category": "language|math|comprehension",
            "question": "Texto de la pregunta",
            "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
            "correctOptionIndex": 0,
            "explanation": "Explicación de la respuesta correcta",
            "targetLanguage": "en" // Solo para desafíos de idiomas
        }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Acción: getLanguages

##### Solicitud:

```json
{
    "action": "getLanguages",
    "profileSettings": {
        "language": "es"
    }
}
```

##### Respuesta:

```json
{
    "languages": [
        { "code": "en", "name": "Inglés" },
        { "code": "fr", "name": "Francés" }
        // Otros idiomas...
    ]
}
```

### story-continuation

Genera continuaciones para historias existentes.

#### Acción: generateOptions

##### Solicitud:

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

##### Respuesta:

```json
{
    "options": [
        { "summary": "Buscar el tesoro escondido en el bosque." },
        { "summary": "Hablar con el misterioso anciano del pueblo." },
        { "summary": "Seguir el camino hacia las montañas nevadas." }
    ]
}
```

#### Acción: freeContinuation, optionContinuation, directedContinuation

Todos estos endpoints tienen estructuras similares, variando según el tipo de
continuación.

##### Respuesta para todas las acciones de continuación:

```json
{
    "content": "Texto completo de la continuación generada..."
}
```

#### Acción: generateTitle

##### Solicitud:

```json
{
    "action": "generateTitle",
    "content": "Contenido del capítulo para el cual se generará un título..."
}
```

##### Respuesta:

```json
{
    "title": "Título generado para el capítulo"
}
```

## Beneficios de la Migración a Edge Functions

1. **Seguridad**: Las claves API se almacenan de forma segura en el servidor y
   no se exponen al cliente.
2. **Rendimiento**: La generación de contenido se realiza en el servidor,
   reduciendo la carga en el dispositivo del cliente.
3. **Mantenibilidad**: La lógica de generación está centralizada y es más fácil
   de mantener y actualizar.
4. **Escalabilidad**: Las Edge Functions pueden escalar automáticamente según la
   demanda.

## Próximos Pasos

Considerar la migración de los siguientes servicios a Edge Functions:

1. **syncService**: Para sincronización de datos con la base de datos.
2. **Otros servicios** que requieran acceso a APIs externas o procesamiento
   intensivo.
