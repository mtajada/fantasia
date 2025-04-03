# CuentaSueños - Generador de Cuentos Infantiles Personalizados

![CuentaSueños Logo](https://lovable.dev/projects/f290b21d-9a8e-415b-8025-bebb8625aa3d)

## Descripción del Proyecto

CuentaSueños es una aplicación web que permite a padres, madres y educadores crear cuentos infantiles personalizados para niños. La aplicación utiliza tecnologías modernas para ofrecer una experiencia de usuario fluida y atractiva, permitiendo:

- Crear y gestionar personajes personalizados
- Seleccionar géneros y temáticas para las historias
- Generar cuentos únicos adaptados a los intereses del niño
- Guardar y acceder a historias anteriores
- Compartir las historias generadas

## Tecnologías Utilizadas

Este proyecto está construido con un stack moderno de tecnologías web:

### Frontend
- **React**: Biblioteca para construir interfaces de usuario
- **TypeScript**: Superset tipado de JavaScript para mayor robustez
- **Vite**: Herramienta de compilación rápida para desarrollo
- **Framer Motion**: Biblioteca para animaciones fluidas
- **Tailwind CSS**: Framework CSS utility-first para diseño rápido
- **Lucide Icons**: Conjunto de iconos SVG

### Estado y Gestión de Datos
- **Zustand**: Biblioteca ligera de gestión de estado
- **React Router**: Enrutamiento declarativo para React

### Backend y Autenticación
- **Supabase**: Plataforma backend-as-a-service que proporciona:
  - Base de datos PostgreSQL
  - Autenticación y gestión de usuarios
  - Almacenamiento de archivos
  - Funciones serverless

## Autenticación

La aplicación implementa un sistema completo de autenticación con Supabase, que incluye:
- Registro con email/contraseña
- Inicio de sesión con Google
- Gestión de perfiles de usuario
- Protección de rutas para usuarios autenticados

## Características Principales

### Gestión de Personajes
- Creación de personajes con nombre, tipo, profesión, hobbies y personalidad
- Edición y eliminación de personajes existentes
- Interfaz intuitiva para la configuración de personajes

### Generación de Historias
- Selección de géneros y temáticas
- Personalización de elementos narrativos
- Generación de cuentos adaptados a los personajes creados

### Experiencia de Usuario
- Diseño responsive para dispositivos móviles y de escritorio
- Animaciones suaves para mejorar la interacción
- Flujos de navegación intuitivos

## Instalación y Desarrollo

```sh
# Clonar el repositorio
git clone https://github.com/mtajada/CuentaSuenos-investigacion.git

# Navegar al directorio del proyecto
cd CuentaSuenos-investigacion

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto está bajo licencia [MIT](LICENSE).

---

Desarrollado con ❤️ para inspirar la imaginación de los más pequeños.
