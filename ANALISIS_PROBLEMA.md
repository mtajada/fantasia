# Plan de Implementación: Selección Múltiple de Personajes

## Problema

### Descripción del Problema Actual
La aplicación TaleMe actualmente solo permite seleccionar un personaje para generar historias. Los usuarios no pueden crear historias con múltiples personajes interactuando entre sí, lo que limita la narrativa y la experiencia del usuario.

### Análisis Técnico del Estado Actual

**1. Arquitectura de Datos (Limitaciones)**
- **Tipos de Datos**: `StoryCharacter` y `StoryOptions` diseñados para un solo personaje
- **Estado Global**: `characterStore.currentCharacter` almacena solo un personaje
- **Almacenamiento**: `storyOptionsStore.currentStoryOptions.character` es singular

**2. Flujo de Selección de Personajes**
- **UI Actual**: Grid de personajes con selección individual
- **Navegación**: Clic en personaje → selección inmediata → siguiente página
- **Problema**: No hay modo de selección múltiple ni botón "Continuar" independiente

**3. Flujo de Creación de Personajes**
- **Problema Identificado**: Después de crear un personaje nuevo, el usuario va directamente a `/story-genre` en lugar de regresar a `/character-selection`
- **Navegación Incorrecta**: No permite ver el personaje recién creado ni seleccionar múltiples personajes

**4. Integración con Edge Functions**
- **generate-story**: Recibe `options.character` (singular) en el payload
- **story-continuation**: Usa `story.options.character.name` para el contexto
- **Prompts de AI**: Estructurados para narrativas de un solo personaje

**5. Servicios y Almacenes**
- **GenerateStoryService**: Pasa un solo personaje en `options.character`
- **StoryContinuationService**: Maneja contexto de un solo personaje
- **storyGenerator.ts**: Usa `currentCharacter` singular del estado

## Solución Propuesta

### Enfoque de Implementación: Evolución Progresiva con Compatibilidad Hacia Atrás

**Estrategia Elegida**: Implementar selección múltiple manteniendo compatibilidad con el sistema actual, permitiendo tanto historias de un personaje como de múltiples personajes.

**Ventajas del Enfoque**:
- ✅ Mantiene funcionalidad existente
- ✅ Permite migración gradual
- ✅ Reduce riesgo de romper features existentes
- ✅ Facilita testing y validación

**Arquitectura de Datos Propuesta**:
```typescript
// Tipos extendidos (manteniendo compatibilidad)
interface StoryOptions {
  character?: StoryCharacter;      // Mantener para compatibilidad
  characters?: StoryCharacter[];   // Nuevo para múltiples personajes
  // ... otros campos
}

interface CharacterState {
  currentCharacter: StoryCharacter | null;     // Mantener para compatibilidad
  selectedCharacters: StoryCharacter[];        // Nuevo para múltiples personajes
  // ... otros campos
}
```

**Experiencia de Usuario Mejorada**:
- Selección múltiple con checkboxes en lugar de navegación inmediata
- Botón "Continuar" siempre visible (habilitado solo con al menos un personaje)
- Indicadores visuales de personajes seleccionados
- Opción para crear personajes adicionales sin perder selecciones actuales

## Plan de Tareas

### Fase 1: Preparación y Tipos de Datos
- [ ] **Extender tipos de datos en `storeTypes.ts`**
  - Añadir `selectedCharacters: StoryCharacter[]` a `CharacterState`
  - Añadir `characters?: StoryCharacter[]` a `StoryOptions`
  - Mantener campos existentes para compatibilidad
- [ ] **Actualizar `characterStore.ts`**
  - Implementar `selectedCharacters` en el estado
  - Crear funciones: `selectMultipleCharacters()`, `toggleCharacterSelection()`, `clearSelectedCharacters()`
  - Mantener funciones existentes para compatibilidad
- [ ] **Actualizar `storyOptionsStore.ts`**
  - Añadir soporte para almacenar múltiples personajes
  - Crear función `setSelectedCharacters()` que popule tanto `character` como `characters`

### Fase 2: Interfaz de Usuario - Selección Múltiple
- [ ] **Modificar `CharacterSelection.tsx`**
  - Cambiar de navegación inmediata a selección con checkboxes
  - Implementar estado local para seguimiento de selecciones (máximo 4 personajes)
  - Añadir botón "Continuar" independiente (habilitado con ≥1 personaje)
  - Mantener indicadores visuales de selección
  - Implementar lógica para manejar tanto selección única como múltiple
  - **Añadir mensaje explicativo**: "✨ ¡Puedes elegir hasta 4 personajes para tu historia! Para cuentos cortitos, recomendamos menos personajes para que cada uno brille más."
- [ ] **Actualizar estilos y UX**
  - Diseñar indicadores visuales para personajes seleccionados
  - Implementar animaciones de selección/deselección
  - Añadir contador de personajes seleccionados (ej: "2/4 personajes seleccionados")
  - Deshabilitar selección cuando se alcancen 4 personajes

### Fase 3: Corrección del Flujo de Creación de Personajes
- [ ] **Modificar `CharacterProfession.tsx`**
  - Detectar si viene de creación nueva (`?action=create`)
  - Redirigir a `/character-selection` en lugar de `/story-genre` para nuevos personajes
  - Mantener redirección actual para edición desde management
- [ ] **Actualizar `CharacterSelection.tsx`**
  - Modificar `handleCreateNewCharacter()` para añadir parámetro `?action=create`
  - Implementar auto-selección opcional del personaje recién creado
  - Mostrar mensaje de éxito al regresar con personaje nuevo

### Fase 4: Servicios y Generación de Historias
- [ ] **Actualizar `GenerateStoryService.ts`**
  - Modificar para enviar tanto `character` como `characters` en el payload
  - Implementar lógica de respaldo para compatibilidad
  - Añadir validación para múltiples personajes
- [ ] **Actualizar `StoryContinuationService.ts`**
  - Modificar para manejar múltiples personajes en continuaciones
  - Mantener contexto de todos los personajes seleccionados
- [ ] **Actualizar `storyGenerator.ts`**
  - Modificar para usar `selectedCharacters` además de `currentCharacter`
  - Implementar lógica híbrida para compatibilidad

### Fase 5: Edge Functions Backend
- [ ] **Modificar `generate-story/index.ts`**
  - Añadir validación para `params.options.characters` (array)
  - Mantener validación existente para `params.options.character`
  - Implementar lógica para procesar múltiples personajes
  - Actualizar manejo de errores para múltiples personajes
- [ ] **Actualizar `generate-story/prompt.ts`**
  - Modificar prompts para incluir múltiples personajes
  - Añadir lógica para describir relaciones entre personajes
  - Mantener prompts existentes para compatibilidad con un personaje
- [ ] **Modificar `story-continuation/index.ts`**
  - Añadir soporte para múltiples personajes en continuaciones
  - Mantener contexto de todos los personajes a través de las continuaciones
  - Actualizar validación de parámetros

### Fase 6: Prompts de AI y Narrativa
- [ ] **Mejorar prompts para múltiples personajes**
  - Crear plantillas de introducción para múltiples personajes
  - Implementar lógica para generar interacciones entre personajes
  - Añadir guidelines para dinámicas de grupo
  - Mantener calidad narrativa con múltiples protagonistas
- [ ] **Actualizar prompts de continuación**
  - Asegurar que todos los personajes mantengan consistencia
  - Implementar rotación de perspectivas si es apropiado
  - Añadir lógica para manejar arcos narrativos múltiples

### Fase 7: Testing y Validación
- [ ] **Pruebas de compatibilidad hacia atrás**
  - Validar que historias con un personaje siguen funcionando
  - Probar flujo de creación de personajes actualizado
  - Verificar que edge functions manejan ambos casos
- [ ] **Pruebas de selección múltiple**
  - Validar selección y deselección de múltiples personajes
  - Probar generación de historias con 2-4 personajes
  - Verificar continuaciones con múltiples personajes
  - Probar límite máximo de 4 personajes y mensaje explicativo
- [ ] **Pruebas de UX**
  - Validar que la navegación es intuitiva
  - Probar flujo completo de creación y selección
  - Verificar indicadores visuales y feedback del usuario

### Fase 8: Optimizaciones y Refinamientos
- [ ] **Optimizaciones de rendimiento**
  - Revisar cargas de datos para múltiples personajes
  - Optimizar prompts para contextos más grandes
  - Implementar lazy loading si es necesario
- [ ] **Mejoras de UX**
  - Implementar sugerencias de combinaciones de personajes
  - Añadir preview de cómo los personajes interactuarán
  - Mostrar mensaje explicativo con tono amigable de la app
- [ ] **Documentación y mantenimiento**
  - Actualizar documentación técnica
  - Documentar nuevos endpoints y parámetros
  - Crear guías de uso para múltiples personajes

## Consideraciones Técnicas

### Compatibilidad hacia Atrás
- **Prioridad Alta**: Mantener toda la funcionalidad existente
- **Estrategia**: Implementar campos adicionales sin modificar los existentes
- **Validación**: Asegurar que historias existentes continúen funcionando

### Limitaciones y Restricciones
- **Límite de Personajes**: Máximo 4 personajes por historia (por rendimiento y calidad narrativa)
- **Selección Opcional**: Los usuarios pueden elegir entre 1-4 personajes según sus preferencias
- **Recomendaciones UX**: Mostrar mensaje explicativo sobre historias cortas (tono amigable de la app)
- **Complejidad de Prompts**: Múltiples personajes requieren contexto más complejo
- **Costos de API**: Más personajes = prompts más largos = mayor costo

### Monitoreo y Métricas
- **Tracking**: Implementar métricas para uso de múltiples personajes
- **Performance**: Monitorear tiempo de respuesta con múltiples personajes
- **Calidad**: Seguir calidad narrativa con múltiples protagonistas

## Implementaciones Futuras

### Asignación de Roles a Personajes
**Descripción**: Permitir asignar roles específicos a cada personaje (protagonista, amigo, mentor, antagonista, etc.)

**Implementación Detallada**:

#### Fase 1: Extensión de Tipos de Datos
```typescript
// Nuevos tipos para roles
type CharacterRole = 'protagonist' | 'friend' | 'mentor' | 'antagonist' | 'sidekick' | 'wise_elder' | 'comic_relief';

interface CharacterWithRole extends StoryCharacter {
  role?: CharacterRole;
  roleDescription?: string;
}

interface StoryOptionsWithRoles extends StoryOptions {
  charactersWithRoles?: CharacterWithRole[];
}
```

#### Fase 2: UI de Asignación de Roles
- **Nueva página**: `CharacterRoleAssignment.tsx` después de `CharacterSelection.tsx`
- **Funcionalidad**:
  - Mostrar personajes seleccionados en tarjetas
  - Dropdown para seleccionar rol de cada personaje
  - Descripciones explicativas de cada rol
  - Validación: máximo 1 protagonista, roles balanceados
  - Sugerencias automáticas basadas en personalidades

#### Fase 3: Integración con Prompts de AI
- **Prompts específicos por rol**:
  - Protagonista: lidera la acción, toma decisiones importantes
  - Amigo: apoya al protagonista, momentos de compañerismo
  - Mentor: ofrece consejos, guía al protagonista
  - Antagonista: crea conflicto constructivo (apropiado para niños)
- **Dinámicas de roles**: Interacciones específicas entre roles diferentes
- **Arcos narrativos**: Cada rol tiene objetivos específicos en la historia

#### Fase 4: Configuración Avanzada
- **Roles personalizados**: Permitir crear roles únicos
- **Plantillas de historias**: Configuraciones predefinidas de roles para diferentes tipos de historias
- **Sugerencias inteligentes**: IA sugiere roles basándose en personalidades y hobbies

## Cronograma Estimado

**Fase 1-2**: 2-3 días (Tipos de datos + UI básica)
**Fase 3**: 1 día (Corrección flujo de creación)
**Fase 4-5**: 3-4 días (Servicios + Edge functions)
**Fase 6**: 2-3 días (Prompts de AI)
**Fase 7-8**: 2-3 días (Testing + optimizaciones)

**Total Estimado**: 10-14 días de desarrollo

## Criterios de Éxito

- [ ] ✅ Usuarios pueden seleccionar múltiples personajes (1-4)
- [ ] ✅ Flujo de creación de personajes regresa a selección
- [ ] ✅ Historias se generan correctamente con múltiples personajes
- [ ] ✅ Continuaciones mantienen consistencia entre personajes
- [ ] ✅ Compatibilidad hacia atrás 100% funcional
- [ ] ✅ Performance aceptable con múltiples personajes
- [ ] ✅ UX intuitiva y fluida