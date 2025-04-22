# Generate Story Edge Function

Esta función edge de Supabase se encarga de generar historias para niños
utilizando la API de Gemini (Google AI).

## Funcionalidad

- Genera cuentos infantiles personalizados basados en opciones como personaje,
  género, moraleja, etc.
- Adapta el contenido según la edad del niño y sus necesidades especiales, si
  las hay.
- Controla la longitud de la historia (corta, media, larga).
- Limpia el resultado para eliminar títulos incrustados.

## Formato de solicitud

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

## Formato de respuesta

```json
{
    "content": "Texto completo de la historia generada..."
}
```

## Variables de entorno

- `GEMINI_API_KEY`: Clave API para el servicio de Gemini API de Google.
