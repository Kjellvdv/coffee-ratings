# Coffee Rater ☕

Una aplicación web para calificar cafés con perfiles de sabor guiados y una fuente social.

## Características

- 🔐 **Autenticación multi-usuario** - Registro y login seguros
- 📝 **Perfiles de sabor guiados** - Cuestionario paso a paso para determinar el perfil de sabor
- 🌍 **Feed social** - Ve las calificaciones de café de otros usuarios
- 🔍 **Búsqueda y filtros** - Encuentra cafés por nombre, tostador, nivel de tueste, etc.
- 📊 **Estadísticas** - Dashboard con métricas de tu colección
- 🎨 **Selector de color** - Extrae el color del café desde las imágenes
- 📱 **Responsive** - Funciona en móviles y escritorio

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Radix UI
- **Backend:** Express + TypeScript
- **Base de datos:** PostgreSQL + Drizzle ORM
- **Autenticación:** Passport.js + express-session
- **Validación:** Zod
- **Estado:** React Query + Context API

## Instalación

### Pre-requisitos

- Node.js 18+
- PostgreSQL 14+

### Configuración

1. Clonar el repositorio
```bash
git clone https://github.com/yourusername/coffee-rater.git
cd coffee-rater
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

4. Ejecutar migraciones de base de datos
```bash
npm run db:push
```

5. Iniciar servidor de desarrollo
```bash
npm run dev
```

El app estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Scripts

- `npm run dev` - Inicia servidor de desarrollo (frontend + backend)
- `npm run build` - Construye para producción
- `npm start` - Inicia servidor de producción
- `npm run check` - Verifica tipos de TypeScript
- `npm run db:generate` - Genera migraciones de base de datos
- `npm run db:push` - Aplica migraciones a la base de datos
- `npm run db:studio` - Abre Drizzle Studio (visualizador de base de datos)

## Estructura del Proyecto

```
coffee-rater/
├── client/src/          # Frontend React
│   ├── pages/          # Páginas/rutas
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React
│   ├── hooks/          # Hooks personalizados
│   └── lib/            # Utilidades y cliente API
├── server/             # Backend Express
│   ├── routes/         # Endpoints API
│   ├── middleware/     # Middleware de autenticación
│   └── storage.ts      # Capa de acceso a datos
└── shared/             # Tipos y esquemas compartidos
    └── schema.ts       # Fuente única de verdad (Drizzle + Zod)
```

## Despliegue

Ver [plan de implementación](/root/.claude/plans/snappy-snacking-brook.md) para instrucciones detalladas de despliegue en Railway, Render, Fly.io, u otros proveedores.

### Opción recomendada: Railway

1. Crea cuenta en Railway
2. Conecta repositorio de GitHub
3. Agrega servicio PostgreSQL
4. Configura variables de entorno
5. Railway despliega automáticamente

## Licencia

MIT

## Créditos

Basado en [Spirit Tracker](../Spirit-tracker) - Una aplicación para rastrear licores.
