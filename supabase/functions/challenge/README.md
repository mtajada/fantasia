# Challenge Edge Function

Esta función edge de Supabase se encarga de generar desafíos educativos basados
en historias para niños utilizando la API de Gemini (Google AI).

## Funcionalidad

- Crea preguntas educativas basadas en el contenido de una historia.
- Soporta tres categorías de desafíos: lenguaje (idiomas), matemáticas y
  comprensión lectora.
- Adapta las preguntas según la edad del niño y sus necesidades especiales.
- Genera opciones de respuesta y explicaciones detalladas.
- Proporciona lista de idiomas disponibles para desafíos lingüísticos.

## Acciones disponibles

### 1. Crear un desafío (`createChallenge`)

#### Formato de solicitud

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
    "targetLanguage": "en" // Solo requerido para desafíos de idiomas
}
```

#### Formato de respuesta

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

### 2. Obtener idiomas disponibles (`getLanguages`)

#### Formato de solicitud

```json
{
    "action": "getLanguages",
    "profileSettings": {
        "language": "es"
    }
}
```

#### Formato de respuesta

```json
{
    "languages": [
        { "code": "en", "name": "Inglés" },
        { "code": "fr", "name": "Francés" }
        // Otros idiomas...
    ]
}
```

## Variables de entorno

- `GEMINI_API_KEY`: Clave API para el servicio de Gemini API de Google.
