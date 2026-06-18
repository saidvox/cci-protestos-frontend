# CCI Protestos Frontend

Base inicial del **Sistema Digital de Gestión de Protestos y Moras para la Cámara de Comercio de Ica**. Es una SPA académica independiente del backend, construida con React, TypeScript, Vite, Tailwind CSS v4 y shadcn/ui.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm 10+

## Inicio rápido

```bash
npm install
copy .env.example .env
npm run dev
```

Abre la URL indicada por Vite. La aplicación usa datos simulados por defecto, incluso si todavía no existe un archivo `.env`.

## Usuarios de demostración

La contraseña puede ser cualquier texto no vacío.

| Correo | Rol |
|---|---|
| `admin@demo.local` | ADMIN |
| `analista@demo.local` | ANALISTA |
| `entidad@demo.local` | ENTIDAD |

No son credenciales reales y no deben reutilizarse fuera del proyecto.

## Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8080/api` |
| `VITE_USE_MOCKS` | `true` usa el adaptador local; `false` usa Axios | `true` |

Los adaptadores mock y API implementan el mismo contrato en `src/services/contracts.ts`. El cliente Axios inyecta el token almacenado en `sessionStorage`.

## Estructura

```text
src/
├── components/       # Layout, componentes compartidos y shadcn/ui
├── config/           # Navegación
├── contexts/         # Contexto de autenticación
├── hooks/            # Hooks compartidos
├── lib/              # Sesión, permisos y utilidades
├── mocks/            # Datos ficticios
├── pages/            # Pantallas por módulo
├── routes/           # Rutas protegidas y autorización por rol
├── services/         # Contrato y adaptadores mock/API
├── test/             # Configuración de pruebas
└── types/            # Tipos de dominio
```

## Comandos

```bash
npm run dev       # servidor de desarrollo
npm run test      # pruebas unitarias
npm run lint      # análisis estático
npm run build     # compilación de producción
npm run preview   # vista previa del build
```

## Alcance actual

Incluye login, dashboard, consulta de protestos, registro y seguimiento de solicitudes, cargas de documentos y Excel, entidades, analistas, revisión, reportes y auditoría. Las cargas solo simulan validación/registro y no procesan información real.
