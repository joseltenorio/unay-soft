# Umarí OS

Umarí OS es una plataforma web bespoke desarrollada para apoyar la gestión interna de una operación gastronómica tipo restaurante/cevichería mediante una solución digital propia, modular y escalable.

El sistema busca centralizar procesos operativos y administrativos en un entorno web moderno, permitiendo que el personal autorizado acceda a herramientas específicas según su rol y permisos.

---

## Estado actual

El proyecto se encuentra en desarrollo.

Actualmente cuenta con:

- Frontend desarrollado con React y Vite.
- Backend desarrollado con Node.js y Express.
- Base de datos PostgreSQL alojada en Supabase.
- Landing pública con presentación del sistema y acceso al portal.
- Login conectado al backend.
- Autenticación con bcryptjs y JWT.
- Feedback visual de carga durante el inicio de sesión.
- Validación de sesión mediante `/api/auth/me`.
- Middleware de autenticación mediante Bearer Token.
- Middleware de autorización por permisos.
- Carga de usuario, permisos y módulos disponibles en la sesión del frontend.
- Layout interno autenticado con sidebar lateral.
- Sidebar con módulos visibles según permisos del usuario.
- Rutas internas protegidas por sesión y por permisos.
- Página interna principal protegida en `/app`.
- Páginas iniciales para los módulos POS, Caja, Inventario, BI y Seguridad.
- Página de acceso no autorizado para usuarios sin permisos suficientes.
- Módulo de Seguridad con mantenimiento de usuarios para el perfil Administrador.
- CRUD de usuarios desde el módulo de Seguridad:
  - Listado de usuarios.
  - Creación de usuarios.
  - Edición de usuarios.
  - Activación y desactivación de usuarios.
- Módulo de Establecimiento para configuración administrativa del negocio:
  - Datos fiscales.
  - Parámetros de venta.
  - Identidad visual.
  - Configuración de IGV y moneda.
- Endpoints protegidos para consultar y actualizar la configuración del establecimiento.
- Módulo POS / Salón conectado parcialmente a datos reales del backend:
  - Consulta de mesas reales por establecimiento.
  - Consulta de productos disponibles para venta desde la carta interna.
  - Registro de comandas reales desde salón.
  - Creación de órdenes asociadas a mesa y usuario autenticado.
  - Creación de ítems de orden con cantidades y precios calculados desde backend.
  - Cálculo de subtotal, IGV y total de la comanda.
  - Marcado de mesa como ocupada al registrar una comanda.
  - Visualización de cuenta abierta por mesa con órdenes activas y total acumulado.
  - Envío de nuevas comandas hacia el flujo del KDS sin reabrir órdenes listas o entregadas.
- Módulo KDS conectado a datos reales del backend:
  - Listado de comandas activas de cocina.
  - Visualización de mesa, número de orden, productos, cantidades, notas y tiempos.
  - Filtros por estado de preparación.
  - Búsqueda por comanda, mesa, mesero, producto o nota.
  - Indicadores visuales de urgencia por tiempo transcurrido.
  - Cambio de estado de comanda a preparación.
  - Cambio de estado de comanda a lista.
  - Actualización de ítems de cocina.
  - Bloqueo de acciones inválidas desde la interfaz.
  - Ocultamiento de comandas listas después de completar preparación.
  - Acción contextual para solicitar apoyo o llamar al mesero según el estado de la comanda.
- Flujo de avisos de cocina hacia salón:
  - Registro de avisos de pedido listo.
  - Registro de incidencias de cocina.
  - Pestaña de avisos dentro del módulo POS / Salón.
  - Consulta periódica de avisos pendientes mediante polling.
  - Atención de avisos desde salón.
  - Confirmación de entrega desde POS.
  - Cambio de comanda de `LISTA` a `ENTREGADA`.
  - Cambio de ítems de `LISTO` a `ENTREGADO`.
  - Registro de tiempos de entrega.
- Endpoints protegidos para consultar y actualizar estados del monitor de cocina.
- Endpoints protegidos para registrar avisos de servicio, atenderlos y confirmar entregas.
- Endpoints protegidos para operación POS de salón:
  - Listado de mesas y cuentas activas.
  - Listado de productos disponibles para venta.
  - Registro de nuevas comandas de salón.
- Scripts SQL para estructura, datos iniciales y validación de la base de datos.
- Colecciones/pruebas en Postman para validación de endpoints principales.

Pendiente de desarrollo:

- Desarrollar la lógica funcional completa de los módulos Caja, Inventario y BI.
- Completar el monitoreo avanzado de cuentas abiertas, consumos adicionales y flujo posterior de caja.
- Implementar funcionalidades avanzadas de roles y permisos.
- Mejorar validaciones visuales y manejo de errores por formulario.
- Implementar carga real de archivos o integración con almacenamiento externo para logos e imágenes.
- Preparar documentación técnica más detallada de endpoints si el proyecto escala.

---

## Tecnologías principales

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- Lucide React
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
│  │  │  ├─ icons/
│  │  │  └─ styles/
│  │  ├─ components/
│  │  │  ├─ app/
│  │  │  ├─ common/
│  │  │  ├─ layout/
│  │  │  └─ sections/
│  │  ├─ pages/
│  │  │  ├─ AppHome/
│  │  │  ├─ Home/
│  │  │  ├─ Login/
│  │  │  ├─ PermissionDemo/
│  │  │  ├─ RestorePassword/
│  │  │  ├─ Unauthorized/
│  │  │  └─ modules/
│  │  │     ├─ BiPage/
│  │  │     ├─ CashierPage/
│  │  │     ├─ EstablishmentPage/
│  │  │     ├─ InventoryPage/
│  │  │     ├─ KdsPage/
│  │  │     ├─ ModulePlaceholder/
│  │  │     ├─ PosPage/
│  │  │     └─ SecurityPage/
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
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
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

La base de datos incluye entidades para:

- Establecimiento.
- Usuarios.
- Roles.
- Módulos.
- Permisos.
- Relación rol-permiso.
- Salón y mesas.
- Carta y productos.
- Órdenes y comandas.
- Estados de preparación de cocina.
- Tiempos de preparación de comandas e ítems.
- Notificaciones de servicio entre cocina y salón.
- Tiempos de atención y entrega de comandas e ítems.
- Pagos y caja.
- Inventario.
- Auditoría y sesiones.

---

## Autenticación y autorización

El sistema utiliza autenticación con JWT.

Flujo general:

1. El usuario inicia sesión desde el frontend.
2. El backend valida las credenciales.
3. El backend compara la contraseña usando bcryptjs.
4. Si las credenciales son correctas, el backend genera un token JWT.
5. El frontend almacena la sesión.
6. Las rutas internas validan la sesión mediante `/api/auth/me`.
7. El backend devuelve el usuario autenticado, sus permisos y sus módulos disponibles.
8. El frontend usa esa información para mostrar u ocultar módulos, rutas y acciones según permisos.

Rutas principales de autenticación:

```txt
POST /api/auth/login
GET  /api/auth/me
```

---

## Módulos y permisos

El acceso interno se basa en roles, módulos y permisos.

Los roles permiten agrupar responsabilidades operativas, mientras que los permisos definen qué módulos o acciones puede usar cada perfil.

Módulos principales:

- Inicio
- POS / Salón
- KDS / Cocina
- Caja
- Inventario
- BI / Reportes
- Seguridad
- Establecimiento

Ejemplos de permisos utilizados:

```txt
dashboard.ver
pos.ver
pos.ver_avisos_cocina
pos.atender_avisos_cocina
pos.confirmar_entrega
kds.ver
kds.actualizar_estado
kds.notificar_servicio
cashier.ver
inventory.ver
bi.ver
security.ver
security.gestionar_usuarios
security.gestionar_roles
establishment.ver
establishment.editar
```

El backend mantiene la autoridad real de seguridad mediante middlewares de autenticación y autorización. El frontend usa los permisos para mejorar la experiencia del usuario mostrando únicamente las opciones disponibles para su perfil.

---

## Layout interno

La zona interna del sistema utiliza un layout autenticado con sidebar lateral.

Características actuales:

- Ruta padre protegida en `/app`.
- Renderizado de páginas internas mediante layout compartido.
- Sidebar con navegación filtrada por módulos disponibles.
- Iconos consistentes para los módulos.
- Buscador de módulos.
- Colapso del sidebar.
- Cierre de sesión desde la zona interna.
- Página `/app/unauthorized` para accesos no permitidos.
- Vista KDS optimizada como pantalla operativa de cocina.
- Vista POS con pestañas internas para separar venta y avisos de cocina.

---

## Mantenimiento de usuarios

El módulo de Seguridad incluye una opción de mantenimiento de usuarios para el perfil Administrador.

Funcionalidades actuales:

- Listar usuarios registrados.
- Crear nuevos usuarios.
- Editar datos de usuarios.
- Activar o desactivar usuarios.
- Asignar roles a usuarios.
- Validar permisos antes de acceder al módulo.
- Evitar acciones no autorizadas desde el backend.

Endpoints principales relacionados:

```txt
GET    /api/users
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status
GET    /api/roles
```

---

## Configuración del establecimiento

El módulo de Establecimiento permite administrar información global del negocio.

Funcionalidades actuales:

- Consultar datos del establecimiento.
- Editar datos fiscales.
- Editar información de contacto.
- Configurar porcentaje de IGV.
- Configurar código y símbolo de moneda.
- Registrar URL del logo del establecimiento.
- Previsualizar el logo registrado.
- Validar permisos antes de acceder o actualizar datos.

Endpoints principales relacionados:

```txt
GET /api/establishment
PUT /api/establishment
```

Permisos principales:

```txt
establishment.ver
establishment.editar
```

La configuración del establecimiento se ubica dentro del grupo Administración del sidebar, junto al módulo de Seguridad.

---

## Monitor de cocina

El módulo KDS permite visualizar y gestionar el flujo de preparación de comandas en cocina.

Funcionalidades actuales:

- Visualización de comandas activas de cocina.
- Consulta de órdenes reales desde el backend.
- Visualización de número de orden, mesa, productos, cantidades y notas de cocina.
- Visualización de tiempo transcurrido desde el ingreso de la comanda.
- Indicadores visuales de urgencia según antigüedad.
- Filtros por estado:
  - Nuevos.
  - En proceso.
  - Listos.
- Búsqueda por comanda, mesa, mesero, producto o nota.
- Filtros rápidos por criticidad, notas, pendientes y orden temporal.
- Cambio de comanda de `ABIERTA` a `EN_PREPARACION`.
- Cambio de comanda de `EN_PREPARACION` a `LISTA`.
- Cambio de ítems de cocina a `LISTO`.
- Registro de tiempos de preparación.
- Acción contextual para:
  - Pedir apoyo en comandas abiertas o en preparación.
  - Llamar al mesero en comandas listas.
- Bloqueo de checks cuando la comanda aún no inició preparación.
- Bloqueo de finalización mientras existan ítems pendientes.
- Feedback visual durante acciones de actualización.
- Mensajes mediante toast para errores operativos.
- Ocultamiento de comandas listas después de completar preparación.
- Exclusión de comandas listas antiguas al refrescar el tablero.

Endpoints principales relacionados:

```txt
GET   /api/kds/orders
PATCH /api/kds/orders/:id/status
PATCH /api/kds/items/:id/status
POST  /api/kds/orders/:id/service-calls
```

Permisos principales:

```txt
kds.ver
kds.actualizar_estado
kds.notificar_servicio
```

Alcance actual del monitor:

- Preparación de cocina.
- Seguimiento visual de comandas.
- Actualización de estados de preparación.
- Registro básico de tiempos de cocina.
- Notificación a salón cuando una comanda está lista.
- Solicitud de apoyo a salón ante incidencias de cocina.

No incluye:

- Confirmación de entrega desde cocina.
- Cobro o liquidación de cuentas.
- Impresión.
- WebSockets.

---

## POS / Salón y avisos de cocina

El módulo POS / Salón funciona como punto de atención para el personal de salón. Actualmente separa el flujo de venta y el seguimiento de avisos enviados desde cocina.

Pestañas actuales:

- Venta.
- Avisos de cocina.

Funcionalidades actuales de venta:

- Consulta de mesas reales del establecimiento.
- Visualización de zonas o ambientes del salón.
- Identificación visual de mesas libres y mesas con cuenta abierta.
- Consulta de productos disponibles desde la carta interna.
- Filtros por categoría y búsqueda de productos.
- Armado de pedido actual por mesa.
- Registro de cantidades por producto.
- Registro de observaciones generales de la comanda.
- Envío de comanda a cocina mediante backend.
- Creación de orden e ítems reales en base de datos.
- Cálculo de subtotal, IGV y total desde backend.
- Visualización de órdenes activas por mesa.
- Resumen de cuenta abierta con estados de órdenes y total acumulado.

Endpoints principales relacionados con venta:

```txt
GET  /api/pos/tables
GET  /api/pos/menu
POST /api/pos/orders
```

Permisos principales relacionados con venta:

```txt
pos.ver
pos.actualizar_orden
```

Alcance actual de venta:

- Registro de nuevas comandas desde salón.
- Asociación de comandas a una mesa del establecimiento.
- Envío de comandas al flujo operativo del KDS.
- Visualización básica de cuenta abierta por mesa.

No incluye todavía:

- Cobro de cuentas.
- Liberación definitiva de mesas desde caja.
- Gestión avanzada de consumos adicionales.
- Notas específicas por ítem desde la interfaz.
- Impresión de comprobantes.

Funcionalidades actuales de avisos de cocina:

- Listado de avisos pendientes enviados desde cocina.
- Diferenciación entre pedidos listos e incidencias de cocina.
- Visualización de orden, mesa, productos, cantidades, notas y hora del aviso.
- Actualización manual mediante botón de refresco.
- Consulta periódica de avisos pendientes mediante polling.
- Atención de incidencias de cocina.
- Confirmación de entrega de pedidos listos.
- Ocultamiento de avisos después de ser atendidos o entregados.
- Feedback visual mediante toasts ante acciones exitosas o errores.

Endpoints principales relacionados con avisos:

```txt
GET   /api/kds/service-calls
PATCH /api/kds/service-calls/:id/attend
PATCH /api/kds/orders/:id/delivered
```

Permisos principales relacionados con avisos:

```txt
pos.ver
pos.ver_avisos_cocina
pos.atender_avisos_cocina
pos.confirmar_entrega
```

Flujo operativo actual:

1. El personal de salón selecciona una mesa activa desde POS.
2. El sistema muestra productos disponibles de la carta interna.
3. El personal arma el pedido actual y registra la comanda.
4. El backend crea la orden y sus ítems asociados.
5. La orden queda disponible para el KDS como nueva comanda de cocina.
6. Cocina prepara la comanda desde el KDS.
7. Cocina marca la comanda como `LISTA`.
8. Cocina llama al mesero desde el KDS.
9. El aviso aparece en POS / Salón, dentro de la pestaña Avisos de cocina.
10. El personal de salón confirma la entrega.
11. La comanda pasa de `LISTA` a `ENTREGADA`.
12. Los ítems pasan de `LISTO` a `ENTREGADO`.

Cuando una mesa ya tiene órdenes activas, el POS permite registrar una nueva comanda para la misma mesa sin reabrir órdenes anteriores. Las órdenes `LISTA` o `ENTREGADA` se conservan con su estado actual y la nueva comanda ingresa al KDS como un registro independiente.

También se permite registrar incidencias desde cocina cuando una comanda está abierta o en preparación. Estas incidencias aparecen en la pestaña Avisos de cocina y pueden marcarse como atendidas desde salón.

---

## Rutas principales del frontend

Rutas públicas:

```txt
/
/login
/restore-password
```

Rutas internas:

```txt
/app
/app/permissions-demo
/app/unauthorized
/app/pos
/app/kds
/app/cashier
/app/inventory
/app/bi
/app/security
/app/establishment
```

---

## Flujo interno esperado

1. El usuario inicia sesión desde `/login`.
2. Si las credenciales son correctas, ingresa a `/app`.
3. El sistema carga los datos del usuario, permisos y módulos disponibles.
4. La pantalla interna muestra solo los módulos permitidos para el perfil.
5. Si un usuario intenta ingresar a una ruta sin permiso, el sistema muestra `/app/unauthorized`.
6. El perfil Administrador puede acceder al módulo de Seguridad y administrar usuarios.
7. El perfil Administrador puede acceder al módulo de Establecimiento y actualizar la configuración general del negocio.
8. El personal autorizado de cocina puede acceder al KDS y gestionar estados de preparación de comandas.
9. Cocina puede solicitar apoyo o llamar al mesero según el estado de la comanda.
10. El personal autorizado de salón puede revisar avisos de cocina desde `/app/pos`.
11. El personal autorizado de salón puede atender incidencias o confirmar entregas de pedidos listos.

---

## Pruebas con Postman

El proyecto puede validarse mediante pruebas manuales en Postman.

Flujo recomendado:

1. Verificar disponibilidad del backend con `/api/health`.
2. Iniciar sesión con `/api/auth/login`.
3. Copiar el token JWT obtenido.
4. Usar el token como Bearer Token en endpoints protegidos.
5. Validar `/api/auth/me`.
6. Probar endpoints protegidos de usuarios, roles, establecimiento y KDS.
7. Verificar respuestas esperadas ante permisos insuficientes o token inválido.

Ejemplos de endpoints protegidos:

```txt
GET    /api/users
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status
GET    /api/roles
GET    /api/establishment
PUT    /api/establishment
GET    /api/pos/tables
GET    /api/pos/menu
POST   /api/pos/orders
GET    /api/kds/orders
PATCH  /api/kds/orders/:id/status
PATCH  /api/kds/items/:id/status
POST   /api/kds/orders/:id/service-calls
GET    /api/kds/service-calls
PATCH  /api/kds/service-calls/:id/attend
PATCH  /api/kds/orders/:id/delivered
```

Las pruebas de POS / Salón cubren:

- Login de usuario autorizado para salón.
- Listado de mesas del establecimiento.
- Listado de productos disponibles para venta.
- Registro de comanda asociada a mesa.
- Persistencia de orden e ítems para consumo del KDS.
- Rechazo de registro sin token.
- Rechazo de registro sin permiso suficiente.
- Rechazo de comanda sin mesa.
- Rechazo de comanda sin productos.
- Rechazo de mesa inexistente.
- Rechazo de producto inexistente o no disponible.

Las pruebas del monitor de cocina y avisos de servicio cubren:

- Login de usuario autorizado.
- Listado de comandas activas de cocina.
- Cambio de comanda a preparación.
- Cambio de ítems de cocina a listo.
- Cambio de comanda a lista.
- Registro de aviso de pedido listo.
- Registro de incidencia de cocina.
- Listado de avisos pendientes de cocina.
- Atención de avisos desde salón.
- Confirmación de entrega desde POS.
- Rechazo de acciones sin permisos suficientes.
- Rechazo de estados no permitidos.

---

## Convención de commits

El proyecto sigue una convención basada en Conventional Commits.

Tipos principales:

- `feat`: nueva funcionalidad.
- `fix`: corrección de errores.
- `refactor`: mejora interna sin cambiar el comportamiento esperado.
- `style`: cambios visuales o de estilos.
- `docs`: cambios de documentación.
- `chore`: configuración, dependencias o mantenimiento.
- `db`: cambios relacionados con scripts o estructura de base de datos.

Ejemplos usados en el proyecto:

```txt
feat(auth): connect login form with backend API
feat(auth): validate protected session with backend
feat(auth): expose user permissions to frontend
feat(auth): add permission-based UI guard
feat(auth): protect app module routes by permission
refactor(routes): mount authenticated app layout
feat(security): connect user CRUD actions
db(establishment): add establishment module permissions
feat(establishment): add protected configuration endpoints
feat(establishment): add establishment settings page
feat(kds): add protected kitchen orders API
feat(kds): persist kitchen preparation status
feat(kds): connect kitchen board to real orders
fix(kds): prevent item completion before preparation starts
fix(kds): auto-hide completed kitchen orders
fix(kds): keep completed orders hidden after refresh
db(kds): add service notification tracking
feat(kds): add service notification endpoints
test(kds): add service notification validation cases
feat(kds): add contextual waiter call actions
feat(pos): show kitchen service notifications
fix(auth): prevent login loading feedback layout shift
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
- Un commit para implementar el mantenimiento de usuarios.
- Un commit para agregar la configuración del establecimiento.
- Un commit para agregar endpoints protegidos de un módulo.
- Un commit para conectar una pantalla con datos reales del backend.
- Un commit para corregir un comportamiento visual específico.
- Un commit para actualizar documentación.

Evitar:

- Commits por cada archivo individual.
- Commits con cambios no relacionados.
- Mezclar lógica de autenticación, rediseño visual y documentación en un solo commit.
- Mezclar cambios de backend, frontend y documentación sin una unidad lógica clara.
