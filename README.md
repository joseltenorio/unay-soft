# Umarí OS

Umarí OS es una plataforma web bespoke desarrollada para apoyar la gestión interna de Umarí mediante una solución digital propia, modular y escalable. Su objetivo es centralizar procesos operativos y administrativos del negocio en un entorno web moderno, permitiendo que el personal autorizado acceda a herramientas específicas según su rol.

El sistema está orientado a cubrir necesidades reales de una operación gastronómica, como la gestión de pedidos, coordinación de cocina, control de insumos, visualización de indicadores, administración de usuarios, control de accesos y soporte a la toma de decisiones. A diferencia de una plantilla genérica, el proyecto se estructura como una solución a medida, pensada para adaptarse progresivamente a los flujos internos del negocio.

## Estado del proyecto

Proyecto en desarrollo.

Actualmente el proyecto cuenta con:

- Frontend desarrollado con React y Vite.
- Páginas principales de presentación, login y recuperación de contraseña.
- Estructura inicial del dashboard.
- Base de datos modelada en PostgreSQL/Supabase.
- Scripts SQL para creación, carga inicial y validación de datos.
- Backend inicial desarrollado con Node.js y Express.
- Conexión del backend con Supabase/PostgreSQL mediante variables de entorno.

Pendiente de implementación:

- Login funcional con bcrypt y JWT.
- Middleware de autenticación.
- Middleware de permisos por rol.
- Endpoints protegidos.
- Pruebas en Postman o Insomnia.
- Documentación de endpoints y credenciales demo.
- Video explicativo de base de datos y módulo de seguridad.

## Tecnologías principales

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- CSS modular por componente

### Backend

- Node.js
- Express
- PostgreSQL
- Supabase
- dotenv
- cors
- pg
- bcryptjs
- jsonwebtoken
- nodemon

### Base de datos

- PostgreSQL
- Supabase

La base de datos inicial del proyecto ya se encuentra definida mediante scripts SQL ubicados en la carpeta `database/`.

Archivos principales:

- `schema.sql`: contiene la creación de tablas, claves primarias, claves foráneas, constraints, checks, índices y triggers de actualización automática.
- `seed.sql`: contiene data maestra e inicial válida para el caso de estudio.
- `validation.sql`: contiene consultas de apoyo para verificar registros, usuarios, roles, permisos, productos, órdenes y relaciones principales.

La base de datos contempla información relacionada con:

- Establecimiento.
- Usuarios.
- Roles.
- Módulos.
- Permisos.
- Sesiones.
- Recuperación de contraseña.
- Auditoría.
- Zonas y mesas.
- Categorías y productos.
- Variantes y adicionales.
- Órdenes y comandas.
- Pagos.
- Caja.
- Códigos QR.
- Inventario.
- Insumos y movimientos.

## Estructura del proyecto

```txt
unay-soft/
├─ frontend/
│  ├─ src/
│  │  ├─ assets/
│  │  │  ├─ icons/
│  │  │  │  ├─ icon-bi.svg
│  │  │  │  ├─ icon-inventory.svg
│  │  │  │  ├─ icon-kds.svg
│  │  │  │  ├─ icon-pos.svg
│  │  │  │  ├─ logo-umari.svg
│  │  │  │  └─ logo-umari-dark.svg
│  │  │  ├─ images/
│  │  │  │  ├─ access-illustration.jpg
│  │  │  │  ├─ hero-background.jpg
│  │  │  │  └─ login-illustration.jpg
│  │  │  └─ styles/
│  │  │     ├─ base.css
│  │  │     ├─ buttons.css
│  │  │     └─ utilities.css
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  │  ├─ AuthToast/
│  │  │  │  └─ FeatureCard/
│  │  │  ├─ layout/
│  │  │  │  ├─ AuthLayout/
│  │  │  │  ├─ Footer/
│  │  │  │  └─ Navbar/
│  │  │  └─ sections/
│  │  │     ├─ Access/
│  │  │     ├─ Hero/
│  │  │     └─ Modules/
│  │  ├─ pages/
│  │  │  ├─ Dashboard/
│  │  │  ├─ Home/
│  │  │  ├─ Login/
│  │  │  └─ RestorePassword/
│  │  ├─ services/
│  │  ├─ App.jsx
│  │  ├─ App.css
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ index.html
│  ├─ package.json
│  ├─ package-lock.json
│  └─ vite.config.js
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  │  └─ database.js
│  │  ├─ controllers/
│  │  │  └─ auth.controller.js
│  │  ├─ middlewares/
│  │  │  ├─ auth.middleware.js
│  │  │  └─ permission.middleware.js
│  │  ├─ routes/
│  │  │  └─ auth.routes.js
│  │  ├─ services/
│  │  │  └─ auth.service.js
│  │  ├─ utils/
│  │  │  └─ jwt.js
│  │  └─ server.js
│  ├─ .env.example
│  ├─ package.json
│  └─ package-lock.json
├─ database/
│  ├─ schema.sql
│  ├─ seed.sql
│  └─ validation.sql
├─ docs/
├─ design/
├─ .gitignore
└─ README.md
```

## Requisitos previos

Antes de ejecutar el proyecto, se recomienda tener instalado:

- Node.js
- npm
- Git
- Una cuenta o proyecto activo en Supabase
- Postman o Insomnia para probar el backend

Versiones recomendadas:

- Node.js 18 o superior
- npm 9 o superior

Para verificar las versiones instaladas:

```txt
node -v
npm -v
git --version
```

## Instalación

Clonar el repositorio:

```txt
git clone URL_DEL_REPOSITORIO
```

Ingresar a la carpeta del proyecto:

```txt
cd unay-soft
```

## Instalación y ejecución del frontend

Ingresar a la carpeta del frontend:

```txt
cd frontend
```

Instalar dependencias:

```txt
npm install
```

Ejecutar el servidor de desarrollo:

```txt
npm run dev
```

Abrir el proyecto en el navegador usando la URL indicada por Vite, normalmente:

```txt
http://localhost:5173
```

## Instalación y ejecución

Ingresar a la carpeta del frontend:

```txt
cd frontend
```

Instalar dependencias:

```txt
npm install
npm install react-router-dom
```

Ejecutar el servidor de desarrollo:

```txt
npm run dev
```

Abrir el proyecto en el navegador usando la URL indicada por Vite, normalmente:

```txt
localhost:5173
```

## Instalación del backend

Desde la raíz del proyecto, ingresar a la carpeta del backend:

```txt
cd backend
```

Instalar dependencias:

```txt
npm install
```

IMPORTANTE:
Colocar el archivo .env dentro de la carpeta backend/.

Ejecutar el backend en modo desarrollo:

```txt
npm run dev
```

## Scripts SQL

Los scripts de base de datos se encuentran en la carpeta:

database/

Orden recomendado de ejecución en Supabase SQL Editor:

1. schema.sql
2. seed.sql
3. validation.sql

Descripción:

- schema.sql: crea la estructura completa de la base de datos.
- seed.sql: inserta la información inicial necesaria.
- validation.sql: permite verificar que la data y las relaciones principales estén correctamente cargadas.

## Convención de commits

El proyecto sigue una convención basada en el propósito del cambio.

Tipos recomendados:

feat Nueva funcionalidad o nueva sección
style Cambios visuales o de CSS
fix Corrección de errores
refactor Reorganización interna sin cambiar comportamiento
docs Documentación
chore Configuración, dependencias o tareas menores

## Criterio de commits

No se recomienda hacer commits por cada archivo modificado.
Se recomienda hacer commits por unidad lógica de cambio.

Ejemplos correctos:

Un commit para agregar una sección completa.
Un commit para configurar rutas.
Un commit para crear páginas de autenticación.
Un commit para ajustar estilos visuales de autenticación.
Un commit para actualizar documentación.

Ejemplos que se deben evitar:

Un commit solo porque se modificó un archivo CSS.
Un commit solo porque se modificó un archivo JSX.
Un commit mezclando Navbar, Login, README y Dashboard sin relación clara.
