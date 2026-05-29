# TaskFlow

Aplicación web de gestión de proyectos y tareas. Permite crear proyectos, organizar tareas por estado y prioridad, asignar etiquetas y visualizar la carga de trabajo en un calendario semanal.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Expressjs, Sequelize ORM |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth (email/password + Google OAuth) |
| Almacenamiento | Supabase Storage (imágenes de portada) |

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- Cuenta en [Supabase](https://supabase.com) (plan gratuito es suficiente)
- ```git clone git@github.com:Googluu/prueba_GoPass.git```

---

## Estructura del proyecto

```
prueba-gopass/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Entry point
│   │   ├── config/
│   │   │   ├── database.js         # Conexión Sequelize
│   │   │   ├── supabase.js         # Cliente Supabase (service role)
│   │   │   └── swagger.js          # Spec OpenAPI 3.0
│   │   ├── controllers/
│   │   ├── middleware/             # auth, errorHandler, upload
│   │   ├── models/                 # Project, Task, Label + asociaciones
│   │   ├── repositories/           # BaseRepository + específicos
│   │   ├── routes/
│   │   └── services/
│   ├── supabase_schema.sql         # Schema inicial
│   ├── supabase_add_user_id.sql    # Aislamiento por usuario + RLS
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                    # Clientes HTTP (axios)
    │   ├── components/             # UI reutilizable + modales
    │   ├── contexts/               # AuthContext, ThemeContext
    │   ├── hooks/                  # useProjects, useTasks, useLabels
    │   ├── pages/                  # Dashboard, ProjectDetail, Hoy, Bandeja…
    │   └── lib/utils.js
    └── .env.example (→ .env)
```

---

## 1 · Configurar Supabase

### 1.1 Crear proyecto

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Guardar la contraseña de la base de datos

### 1.2 Ejecutar el schema

En **Supabase Dashboard → SQL Editor → New query**, ejecutar los archivos en este orden:

```sql
-- Paso 1: schema base (tablas, ENUMs, índices, triggers, seed de etiquetas)
-- Contenido de: backend/supabase_schema.sql

-- Paso 2: columna user_id en projects + políticas RLS
-- Contenido de: backend/supabase_add_user_id.sql
```

### 1.3 Crear bucket de imágenes

En **Supabase Dashboard → Storage → New bucket**:

- **Name:** `project-images`
- **Public bucket:** ✅ activado

### 1.4 Habilitar Google OAuth *(opcional)*

En **Authentication → Providers → Google**:

1. Activar el proveedor
2. Pegar **Client ID** y **Client Secret** de [Google Cloud Console](https://console.cloud.google.com)
3. Copiar la **Callback URL** de Supabase y añadirla como URI de redirección en Google Cloud

### 1.5 Obtener las credenciales

En **Project Settings → API**:

| Variable | Dónde encontrarla |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (mantener privada) |

En **Project Settings → Database → Connection string (URI)**:

| Variable | Dónde encontrarla |
|---|---|
| `DATABASE_URL` | Connection string completa (modo *Transaction* / pgBouncer) |

---

## 2 · Configurar variables de entorno

### Backend

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Opcional: bypass de auth para pruebas locales con Postman/curl
TEST_BYPASS_KEY=cualquier-clave-secreta
```

### Frontend

Crear `frontend/.env`:

```env
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3000/api
```

---

## 3 · Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## 4 · Ejecutar en desarrollo

Abrir **dos terminales**:

```bash
# Terminal 1 — Backend (puerto 3000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend (puerto 5173)
cd frontend
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

> El frontend hace proxy de `/api/*` hacia `localhost:3000` automáticamente (configurado en `vite.config.js`), por lo que no hay problemas de CORS en desarrollo.

---

## 5 · Documentación de la API

Con el backend corriendo, acceder a:

**http://localhost:3000/api/docs**

Interfaz Swagger UI con todos los endpoints documentados. Para probar los endpoints protegidos:

1. Iniciar sesión en la app
2. Abrir DevTools → Application → Local Storage → `sb-[ref]-auth-token`
3. Copiar el `access_token`
4. En Swagger UI → **Authorize** → pegar el token

> La documentación solo está disponible en `NODE_ENV=development`.

### Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/projects` | Listar proyectos (`?search=`) |
| `POST` | `/api/projects` | Crear proyecto |
| `GET` | `/api/projects/:id` | Obtener proyecto con stats |
| `PUT` | `/api/projects/:id` | Actualizar proyecto |
| `DELETE` | `/api/projects/:id` | Eliminar proyecto (cascade) |
| `POST` | `/api/projects/:id/image` | Subir imagen de portada |
| `GET` | `/api/projects/:id/tasks` | Tareas de un proyecto (`?status=&priority=`) |
| `POST` | `/api/projects/:id/tasks` | Crear tarea |
| `PUT` | `/api/tasks/:id` | Actualizar tarea + etiquetas |
| `PATCH` | `/api/tasks/:id/status` | Cambiar estado (kanban) |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea |
| `GET` | `/api/tasks/inbox` | Tareas activas del usuario |
| `GET` | `/api/tasks/today` | Tareas de hoy |
| `GET` | `/api/tasks/range` | Tareas en rango de fechas (`?from=&to=`) |
| `GET` | `/api/labels` | Listar etiquetas |
| `POST` | `/api/labels` | Crear etiqueta |
| `DELETE` | `/api/labels/:id` | Eliminar etiqueta |
| `GET` | `/api/labels/:id/tasks` | Tareas de una etiqueta |

---

## 7 · Funcionalidades principales

- **Autenticación** — Email/password y Google OAuth via Supabase
- **Proyectos** — CRUD, imagen de portada, búsqueda, estadísticas de tareas
- **Tareas** — CRUD con estado, prioridad, fecha límite, hora límite y etiquetas
- **Kanban** — Vista por columnas con drag & drop (`@dnd-kit`)
- **Calendario** — Vista semanal de tareas por fecha de vencimiento
- **Bandeja** — Todas las tareas activas agrupadas por recencia
- **Etiquetas** — Clasificación transversal de tareas, vista por etiqueta
- **Dark / Light mode** — Toggle en el sidebar, persiste en `localStorage`
- **Cache offline** — TanStack Query persiste el cache en `localStorage` (24 h)
- **Aislamiento de datos** — Cada usuario solo ve sus propios proyectos y tareas
