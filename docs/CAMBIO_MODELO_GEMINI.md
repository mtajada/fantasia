# Actualización del Modelo de Gemini en las Edge Functions

## Cambio Realizado

Se ha actualizado el modelo de generación de Gemini en todas las Edge Functions
de Supabase, cambiando de:

```
model: "gemini-1.5-flash"
```

a:

```
model: "gemini-2.0-flash-thinking-exp-01-21"
```

## Archivos Modificados

- `supabase/functions/generate-story/index.ts`
- `supabase/functions/challenge/index.ts`
- `supabase/functions/story-continuation/index.ts`

## Motivo del Cambio

La actualización al modelo `gemini-2.0-flash-thinking-exp-01-21` proporciona:

- Mejor capacidad de razonamiento
- Mayor precisión en las respuestas
- Mayor coherencia en las historias generadas
- Mejor manejo de instrucciones complejas
- Capacidad mejorada para seguir formatos específicos

## Implementación

Las funciones edge ya han sido desplegadas nuevamente con el modelo actualizado
utilizando:

```bash
supabase functions deploy generate-story challenge story-continuation --no-verify-jwt
```

## Consideraciones Adicionales

Si se detecta algún comportamiento inesperado o problemas de rendimiento,
considerar:

1. Ajustar los parámetros de generación (temperatura, top_k, top_p) según sea
   necesario.
2. Revisar y actualizar los prompts para aprovechar mejor las capacidades del
   nuevo modelo.
3. Monitorear el uso y costo, ya que los modelos más avanzados pueden tener
   diferentes costos por token.
