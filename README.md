# Umarí OS

Umarí OS es una plataforma web bespoke desarrollada para apoyar la gestión interna de Umarí mediante una solución digital propia, modular y escalable. Su objetivo es centralizar procesos operativos y administrativos del negocio en un entorno web moderno, permitiendo que el personal autorizado acceda a herramientas específicas según su rol.

El sistema está orientado a cubrir necesidades reales de una operación gastronómica, como la gestión de pedidos, coordinación de cocina, control de insumos, visualización de indicadores, administración de usuarios, control de accesos y soporte a la toma de decisiones. A diferencia de una plantilla genérica, el proyecto se estructura como una solución a medida, pensada para adaptarse progresivamente a los flujos internos del negocio.

## Estado del proyecto

Proyecto en desarrollo.

## Tecnologías principales

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- CSS modular por componente

### Backend

Uso de Node.js
Se encuentra pendiente de implementación.

Se contempla desarrollar:

- Autenticación de usuarios.
- Gestión de sesiones.
- Recuperación de contraseña.
- Control de roles.
- Gestión de módulos del sistema.
- Conexión con base de datos.
- Validaciones del lado del servidor.

### Base de datos

Uso de PostgreSQL y Supabase.
La base de datos aún se encuentra pendiente de implementación.

Se contempla almacenar información relacionada con:

- Usuarios.
- Roles y permisos.
- Ventas.
- Pedidos.
- Inventario.
- Cocina / KDS.
- Indicadores de negocio.
- Configuraciones del sistema.

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
├─ database/
├─ docs/
├─ design/
├─ .gitignore
└─ README.md
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
