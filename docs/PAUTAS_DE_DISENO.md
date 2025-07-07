# Pautas de Diseño UI/UX – FantasIA

## ⚠️ DISCLAIMER IMPORTANTE: PRESERVACIÓN DE FUNCIONALIDAD

**EXTREMADAMENTE IMPORTANTE: Al aplicar estas pautas de diseño, NUNCA se debe alterar la funcionalidad existente.**

- **Mantener toda la lógica intacta:** Al rediseñar componentes, solo modificar aspectos visuales (colores, espaciado, tipografía, etc.).
- **No eliminar ni añadir botones:** La cantidad y tipo de elementos interactivos debe permanecer exactamente igual.
- **Preservar todos los estados:** Asegurarse de que estados como hover, active, disabled, loading, etc. sigan funcionando correctamente.
- **No modificar manejadores de eventos:** Las funciones onClick, onChange y similares deben permanecer intactas.
- **Mantener la estructura de datos:** No alterar la forma en que se almacenan o procesan los datos.
- **Respetar los permisos y restricciones:** Los bloqueos para usuarios free/premium deben seguir funcionando igual.

El objetivo es **ÚNICAMENTE mejorar la apariencia visual** manteniendo toda la funcionalidad existente. Cualquier cambio que afecte el comportamiento de la aplicación está estrictamente prohibido.

## 1. Identidad Visual
- **Logotipo:** Utiliza siempre el logotipo oficial en sus variantes de color y fondo según el manual de marca.
- **Iconografía:** Usa los iconos oficiales de FantasIA, preferiblemente en formato SVG o PNG de alta calidad.

## 2. Paleta de Colores
Utiliza la paleta oficial para todos los elementos de la interfaz:
- **Rosa:** #F6A5B7  (principal, botones primarios)
- **Morado:** #BB79D1  (acentos, fondos suaves)
- **Celeste:** #A5D6F6  (botones secundarios, fondos)
- **Amarillo:** #F9DA60  (acentos, detalles)
- **Lavanda:** #E6B7D9  (fondos suaves, tarjetas)
- **Azul Claro:** #7DC4E0  (fondos, detalles)

## 3. Tipografía
- **Principal (encabezados):** Quicksand, bold y semibold.
- **Secundaria (texto):** Open Sans, regular y semibold.
- **Tamaños:**
  - Títulos: grandes y llamativos.
  - Botones: medianos, legibles y en mayúsculas si aplica.

## 4. Estilo Visual
- **Fondo:** Gradientes pastel, nubes y estrellas decorativas (preferentemente SVG o PNG).
- **Botones:**
  - Grandes, redondeados (`border-radius: 24px` o más).
  - Colores sólidos de la paleta, texto blanco.
  - Sombra suave y efecto hover.
- **Componentes:**
  - Bordes suaves y esquinas redondeadas.
  - Espaciado generoso y aireado.

## 5. Uso de Imágenes y Decoraciones
- **Logo y fondo:** Siempre centrados, con espacio suficiente.
- **Ilustraciones:** Usa las oficiales del manual de marca.
- **No sobrecargar:** Mantén la interfaz limpia y amigable.

## 6. Accesibilidad
- Contraste suficiente entre texto y fondo.
- Botones grandes y fácilmente tocables.
- Texto legible y jerarquías claras.

## 7. Tono y Estilo de Comunicación
- Moderno, amigable, imaginativo.
- Mensajes claros, positivos y cercanos.

## 8. Distribución del Espacio
- **Agrupación de elementos:** Mantén juntos los elementos relacionados.
- **Espaciado vertical:** 
  - Reduce espacios entre logo y contenido principal (usar `mt-4 mb-0` y `py-0`).
  - Asegura suficiente espacio entre el contenido y el borde inferior (usar `mb-10` para botones inferiores).
- **Estructura de página:** Usa contenedores flex con `min-h-[80vh]` y `justify-between` para distribuir el espacio.
- **Jerarquía visual:** Elementos importantes más grandes y con mayor contraste.

## 9. Preservación de Funcionalidad
- **⚠️ EXTREMADAMENTE IMPORTANTE: Nunca eliminar botones ni cambiar funcionalidades existentes.**
- Todos los botones y elementos interactivos deben preservarse en el rediseño.
- Si un botón existe en la versión original, debe existir en la versión rediseñada.
- Mantener la misma navegación y flujos de usuario que en la versión original.
- Solo se permite mejorar el aspecto visual, no modificar comportamientos.

## 10. Legibilidad
- Usar fondos con opacidad adecuada (40-50% para fondos de tarjetas).
- Texto principal en colores oscuros de la paleta (#BB79D1).
- Texto secundario en colores contrastantes (#7DC4E0).
- Usar `font-bold` para elementos importantes y `font-medium` para mejorar legibilidad.

## 11. Legibilidad y Uso de Colores en Texto
- **Regla general:** Siempre prioriza el contraste entre texto y fondo para garantizar la legibilidad.

### Cuándo usar cada color:
- **Texto principal en tarjetas o bloques claros (fondos blancos, lavanda, pastel):**
  - Usa **gris oscuro** (`#222` o `#333`) para el texto principal. Esto asegura máxima legibilidad en fondos claros/pastel.
  - Ejemplo: títulos, frases clave, información principal.
- **Números, datos clave o acentos:**
  - Usa colores de la paleta para resaltar: rosa (`#F6A5B7`), amarillo (`#F9DA60`), azul claro (`#7DC4E0`), morado (`#BB79D1`).
  - Ejemplo: “8 / 10”, precios, alertas.
- **Iconos:**
  - Usa el color corporativo correspondiente según el contexto (ej. morado para elementos generales, azul para info, rosa para acciones, amarillo para alertas positivas).
- **Texto secundario o descripciones:**
  - Usa azul claro (`#7DC4E0`) o morado claro, siempre que el fondo sea suficientemente claro.

### Fondos:
- **Tarjetas y bloques de información:**
  - Usa fondo blanco translúcido (`bg-white/70` o `#fff9`), lavanda muy clara o pastel con suficiente opacidad.
  - Nunca uses fondo morado medio con texto morado o azul claro encima.
  - Si el fondo es pastel/morado claro y el texto no se lee bien, sube la opacidad del fondo o cambia el texto a gris oscuro.

### Reglas de contraste:
- **No usar negro puro** (`#000`) salvo casos extremos de accesibilidad. Prefiere gris oscuro.
- **Evita morado sobre morado y azul sobre morado claro**: el contraste es insuficiente.
- **Para alertas o mensajes críticos:**
  - Usa fondo claro y texto oscuro o viceversa, nunca dos colores de baja diferencia de luminosidad.

### Sombra de texto:
- Puedes añadir `text-shadow: 0 1px 4px rgba(187, 121, 209, 0.15);` para separar el texto del fondo en fondos translúcidos o pastel.

### Resumen de buenas prácticas:
- Texto principal: gris oscuro (`#222`), nunca morado/azul claro sobre pastel/morado claro.
- Números/acento: color de la paleta.
- Iconos: color de la paleta según contexto.
- Fondos: blanco translúcido, pastel claro, suficiente opacidad.
- Sombra de texto para mejorar legibilidad si es necesario.

## 12. Consistencia Visual y Matices Aprendidos

### Fondo general de la aplicación
- **Siempre usar el mismo fondo:** Utiliza `public/fondo_png.png` en todas las pantallas principales.
- **Modo de aplicación:** Aplica el fondo usando `style` con las siguientes propiedades para evitar zoom excesivo o repetición:
  ```jsx
  style={{
    backgroundImage: 'url(/fondo_png.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
  ```
- **No uses clases como `bg-cover` si no garantizan el mismo comportamiento cross-browser.**

### Tarjetas y bloques de información
- **Fondo:** Usa `bg-white/40` (blanco translúcido) para tarjetas y bloques principales, con `rounded-3xl`, borde pastel (`border-[#BB79D1]/20`) y sombra suave.
- **No uses blanco sólido salvo en menús desplegables o casos de legibilidad crítica.**
- **No uses translúcido en dropdowns:** Los menús desplegables deben ser `bg-white` sólido para máxima legibilidad.

### Menús desplegables (selects)
- **Fondo:** `bg-white` sólido, nunca translúcido.
- **Borde:** Pastel (`border-[#BB79D1]/40`), sombra y esquinas redondeadas.
- **Texto:** Siempre oscuro (`#222`).
- **Focus:** Fondo morado translúcido suave (`focus:bg-[#BB79D1]/20`).

### Consistencia de colores para cada elemento
- **Texto principal:** Gris oscuro (`#222` o `#333`) en tarjetas, formularios y menús.
- **Números/acento:** Usa la paleta oficial:
  - Rosa (`#F6A5B7`): para cantidades, estados destacados.
  - Amarillo (`#F9DA60`): para edades, avisos positivos.
  - Azul claro (`#7DC4E0`): para descripciones, textos secundarios.
  - Morado (`#BB79D1`): para títulos, iconos principales y acentos.
- **Iconos:** Color de la paleta según contexto (ejemplo: azul para info, rosa para acciones, amarillo para alertas, morado para elementos generales).

### Legibilidad y contraste
- **Nunca uses texto morado o azul claro sobre fondo morado claro o pastel:** El contraste es insuficiente.
- **No uses negro puro:** Prefiere gris oscuro.
- **En menús y tarjetas, prioriza la legibilidad sobre la estética pastel.**

### Resumen de buenas prácticas
- Fondo uniforme y sin zoom excesivo.
- Tarjetas translúcidas, menús sólidos.
- Colores coherentes para cada tipo de elemento.
- Máxima legibilidad en todos los contextos.

## 13. Patrones de Diseño Específicos

### Fondos y Contenedores

#### Fondo Principal
- **Cuándo usar**: En todas las pantallas principales de la aplicación.
- **Implementación**: 
  ```jsx
  style={{
    backgroundImage: 'url(/fondo_png.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
  ```
- **Razón**: Proporciona una identidad visual consistente y un ambiente acogedor para la aplicación de cuentos.

#### Contenedores de Información
- **Cuándo usar**: Para agrupar información relacionada (textos explicativos, preguntas).
- **Implementación**: Fondo blanco con opacidad 70-80% (`bg-white/70` o `bg-white/80`), bordes redondeados (`rounded-xl`), sombra suave.
- **Razón**: Mejora la legibilidad del texto sobre el fondo decorativo, manteniendo la estética general.

### Tarjetas de Selección

#### Estilo Base
- **Implementación**: 
  - Fondo blanco con opacidad 70% (`bg-white/70`)
  - Bordes redondeados amplios (`rounded-2xl`)
  - Bordes coloreados según su contenido (`border-2 border-[#COLOR]/60`)
  - Sombra suave para elevación visual
  - Transiciones suaves para interacciones

#### Estados Interactivos
- **Normal**: Fondo blanco translúcido, icono colorido, texto oscuro para máxima legibilidad.
- **Hover**: Ligero tinte del color temático (`hover:bg-[#COLOR]/10`), aumento de escala (`hover:scale-105`), sombra mejorada.
- **Seleccionado**: Anillo de color destacado (`ring-4 ring-[#COLOR]`), sombra más prominente, escala ligeramente aumentada.

### Código de Colores Funcionales

- **Rosa (#F6A5B7)**: Para elementos primarios, acciones principales, duración corta.
- **Amarillo (#F9DA60)**: Para alertas positivas, elementos medios, duración media.
- **Azul Claro (#7DC4E0)**: Para información, elementos secundarios, duración larga.
- **Morado (#BB79D1)**: Para navegación, títulos, botones de avance en el flujo.

### Botones de Acción

#### Botones Principales (como "Continuar")
- **Implementación**: 
  ```jsx
  <div className="flex justify-center w-full">
    <button className="w-full max-w-xs py-4 rounded-2xl text-white text-lg font-semibold 
                      shadow-lg bg-[#BB79D1] hover:bg-[#BB79D1]/90 
                      border-2 border-[#BB79D1]/50 transition-all duration-200">
      Texto del botón
    </button>
  </div>
  ```
- **Razón**: Destacan visualmente como puntos de acción principales, manteniendo coherencia con el flujo de la aplicación.

#### Botón de Retroceso
- **Implementación**: 
  ```jsx
  <button className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center 
                    rounded-full bg-white shadow-lg border-2 border-[#BB79D1]/60 
                    text-[#BB79D1] hover:bg-[#BB79D1]/10 hover:text-[#7DC4E0] 
                    focus:ring-4 focus:ring-[#BB79D1]/30 transition-all duration-300 z-20">
    <ChevronLeft size={28} />
  </button>
  ```
- **Razón**: Proporciona una forma consistente de navegación hacia atrás sin competir visualmente con el contenido principal.

### Consideraciones para Pantallas de Selección

1. **Uso de colores diferenciados por opción**: Cada opción debe tener su propio color de la paleta para crear asociación visual y facilitar la identificación.

2. **Mayor opacidad en fondos de tarjetas** (70% en lugar de 40%): Mejora significativamente la legibilidad del texto mientras mantiene la estética translúcida.

3. **Texto oscuro en lugar de blanco para tarjetas**: Siguiendo las pautas de legibilidad, el texto oscuro (`text-[#222]`) sobre fondo claro proporciona mejor contraste.

4. **Estados visuales claros**: Los estados normal, hover y seleccionado deben tener diferencias visuales significativas pero coherentes.

5. **Botones de acción centrados y con ancho controlado**: Seguir el patrón de los botones principales de la Home, creando consistencia en la experiencia de usuario.

---

_Última actualización: 17 de abril de 2025_

---

**Referencia:**
Estas pautas se basan en el manual de marca oficial de FantasIA (ver imágenes adjuntas en docs/manual_marca.png o docs/manual_marca.pdf si están disponibles).

---

_Actualiza este documento si el manual de marca evoluciona o hay nuevas directrices de diseño._
