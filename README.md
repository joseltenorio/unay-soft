# Umarí OS

Umarí OS es una plataforma web bespoke desarrollada para apoyar la gestión interna de una operación gastronómica tipo restaurante/cevichería mediante una solución digital propia, modular y escalable.

El sistema busca centralizar procesos operativos y administrativos en un entorno web moderno, permitiendo que el personal autorizado acceda a herramientas específicas según su rol y permisos.

---

## Estado actual

El proyecto se encuentra en desarrollo.

Actualmente cuenta con:

- Frontend desarrollado con React y Vite.
- Landing pública con secciones de presentación, módulos y acceso al portal.
- Páginas de autenticación para login y recuperación de contraseña.
- Backend desarrollado con Node.js y Express.
- Conexión del backend con Supabase/PostgreSQL.
- Autenticación con bcryptjs y JWT.
- Middleware de autenticación mediante Bearer Token.
- Middleware de autorización por permisos.
- Validación de sesión desde el frontend mediante `/api/auth/me`.
- Carga de usuario, permisos y módulos disponibles en la sesión del frontend.
- Ruta interna principal protegida en `/app`.
- Componentes de control visual por permisos.
- Base de datos modelada en PostgreSQL/Supabase.
- Scripts SQL para estructura, datos iniciales y validación.

Próximas partes del desarrollo:

- Proteger rutas internas por permiso.
- Crear páginas iniciales para los módulos principales.
- Implementar layout interno del sistema autenticado.
- Desarrollar progresivamente los módulos POS, KDS, Caja, Inventario, BI y Seguridad.
- Mejorar validaciones y manejo de errores del backend.

---

## Tecnologías principales

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- CSS modular por componente
- Variables CSS para tokens de diseño

### Backend

- Node.js
- Express
- PostgreSQL
- Supabase
- bcryptjs
- jsonwebtoken
- pg
- dotenv
- cors

### Base de datos

- PostgreSQL
- Supabase

---

## Estructura general

```txt
unay-soft/
├─ frontend/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ .env.example
│  ├─ index.html
│  └─ package.json
│
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middlewares/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
│
├─ database/
│  ├─ schema.sql
│  ├─ seed.sql
│  └─ validation.sql
│
├─ design/
├─ docs/
├─ .gitignore
└─ README.md
```

---

## Configuración del backend

Ingresar a la carpeta del backend:

```txt
cd backend
```

Instalar dependencias:

```txt
npm install
```

Crear un archivo `.env` dentro de `backend/` tomando como referencia:

```txt
backend/.env.example
```

Ejemplo de variables:

```txt
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=2h
```

Ejecutar el backend:

```txt
npm run dev
```

El backend queda disponible en:

```txt
http://localhost:3000
```

Ruta de verificación:

```txt
http://localhost:3000/api/health
```

---

## Configuración del frontend

Ingresar a la carpeta del frontend:

```txt
cd frontend
```

Instalar dependencias:

```txt
npm install
```

Crear un archivo `.env` dentro de `frontend/` tomando como referencia:

```txt
frontend/.env.example
```

Ejemplo de variable:

```txt
VITE_API_URL=http://localhost:3000/api
```

Ejecutar el frontend:

```txt
npm run dev
```

El frontend queda disponible normalmente en:

```txt
http://localhost:5173
```

---

## Base de datos

Los scripts SQL se encuentran en la carpeta:

```txt
database/
```

Orden recomendado de ejecución:

1. `schema.sql`
2. `seed.sql`
3. `validation.sql`

Descripción:

- `schema.sql`: define la estructura de la base de datos.
- `seed.sql`: inserta datos iniciales del sistema.
- `validation.sql`: contiene consultas para validar la carga y relaciones principales.

---

## Autenticación y permisos

El sistema utiliza autenticación con JWT.

Flujo general:

1. El usuario inicia sesión desde el frontend.
2. El backend valida las credenciales.
3. Si las credenciales son correctas, el backend genera un token JWT.
4. El frontend almacena la sesión.
5. Las rutas internas validan la sesión con `/api/auth/me`.
6. El backend devuelve el usuario autenticado, sus permisos y sus módulos disponibles.
7. El frontend usa esa información para mostrar u ocultar secciones según permisos.

Rutas principales:

```txt
POST /api/auth/login
GET  /api/auth/me
```

---

## Rutas principales del frontend

Rutas públicas:

```txt
/
 /login
/restore-password
```

Rutas internas actuales:

```txt
/app
/app/permissions-demo
```

Rutas internas planificadas:

```txt
/app/pos
/app/kds
/app/cashier
/app/inventory
/app/bi
/app/security
```

---

## Convención de commits

El proyecto sigue una convención basada en Conventional Commits.

Tipos principales:

- `feat`: nueva funcionalidad.
- `fix`: corrección de errores.
- `refactor`: mejora interna sin cambiar el comportamiento.
- `style`: cambios visuales o de estilos.
- `docs`: cambios de documentación.
- `chore`: configuración, dependencias o mantenimiento.
- `db`: cambios relacionados con scripts o estructura de base de datos.

Ejemplos:

```txt
feat(auth): connect login form with backend API
feat(auth): validate protected session with backend
feat(auth): expose user permissions to frontend
feat(auth): add permission-based UI guard
refactor(routes): rename dashboard entry page to app home
docs: update project documentation
```

---

## Criterio de commits

Los commits deben agrupar cambios por unidad lógica, no por archivo.

Ejemplos adecuados:

- Un commit para conectar el login con el backend.
- Un commit para validar sesión protegida.
- Un commit para exponer permisos al frontend.
- Un commit para proteger rutas por permiso.
- Un commit para actualizar documentación.

Evitar:

- Commits por cada archivo individual.
- Commits con cambios no relacionados.
- Mezclar lógica de autenticación, rediseño visual y documentación en un solo commit.
