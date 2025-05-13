# TaleMe - Cuentos Personalizados

TaleMe es una aplicación para la creación de cuentos personalizados con narración por voz para niños, diseñada para fomentar la lectura y el aprendizaje.

## Versión Actual

**v1.1.2** - Consulta el [CHANGELOG](./CHANGELOG.md) para más detalles sobre los cambios en cada versión.

## Características Principales

- **Historias Personalizadas**: Cuentos adaptados a los gustos, edad y personalidad de cada niño.
- **Narración de Voz**: Narraciones profesionales con diferentes tonos y personalidades.
- **Retos Educativos**: Mejora la lectura, matemáticas e idiomas con actividades integradas.
- **Interfaz Intuitiva**: Diseño centrado en la experiencia de usuario para todas las edades.
- **Configuración de Personajes**: Crea y personaliza los personajes de tus historias.

## Tecnologías Utilizadas

- React + Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- OpenAI TTS

## Estructura del Proyecto

La aplicación sigue una estructura organizada por características:

- `/src/components`: Componentes reutilizables de la UI
- `/src/pages`: Vistas principales de la aplicación
- `/src/services`: Servicios para interactuar con APIs externas
- `/src/store`: Estado global de la aplicación usando stores
- `/src/config`: Configuraciones globales de la aplicación

## Configuración 

El archivo `src/config/app.ts` contiene las configuraciones globales de la aplicación, incluida la versión actual.

## Mejoras Recientes

- Mejoras en la generación de historias
- Sistema de preview de voces para las narraciones
- Footer global con información de versión
- Mejoras en la personalidad de los personajes

## Desarrollo Local

1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Configura las variables de entorno en un archivo `.env` (ver `.env.example`)
4. Ejecuta la aplicación con `npm run dev`

## Changelog

Consulta el [CHANGELOG](./CHANGELOG.md) para ver la historia completa de cambios en el proyecto.
