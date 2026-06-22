# Postman Collection

Esta carpeta contiene la colección de Postman utilizada para validar los endpoints principales del backend de Umarí OS.

La colección está organizada por módulos para facilitar la validación de autenticación, autorización por perfiles, mantenimiento de usuarios, configuración del establecimiento, carta, salón, POS, KDS, sesiones y auditoría de autenticación.

La colección trabaja con variables y no debe almacenar credenciales reales, tokens reales, cadenas de conexión ni datos privados del establecimiento.

---

## Archivo principal

```txt
umari-os-api.postman_collection.json
```

---

## Requisitos previos

Antes de ejecutar la colección, el backend debe estar levantado localmente.

Desde la carpeta del backend:

```txt
cd backend
npm run dev
```

El backend debe estar disponible en:

```txt
http://localhost:3000
```

La variable base de la colección debe apuntar a:

```txt
base_url = http://localhost:3000/api
```

También debe existir el archivo de variables de entorno del backend:

```txt
backend/.env
```

Puedes tomar como referencia:

```txt
backend/.env.example
```

---

## Estructura de la colección

```txt
Umari OS API
├─ Health
│  └─ Health Check
│
├─ Auth
│  ├─ Login - Admin
│  ├─ Login - KDS
│  ├─ Login - Cashier
│  ├─ Login - Waiter
│  ├─ Login - User
│  └─ Auth - Me
│
├─ Authorization / Profiles
│  ├─ Permission - Admin Check
│  ├─ Cajero - Caja Permitido
│  ├─ Cajero - POS Denegado
│  ├─ Mesero - Caja Denegado
│  └─ Mesero - POS Permitido
│
├─ Roles
│  └─ Admin Roles
│
├─ User Maintenance
│  ├─ Users - Protected
│  ├─ Create User
│  ├─ Edit User
│  ├─ Edit Status User
│  └─ Create User No Permission
│
├─ Establishment
│  ├─ Visual Establishment
│  └─ Edit Establishment
│
├─ Carta
│  ├─ Categorías
│  └─ Productos
│
├─ POS - Orders
│  ├─ POS - List Tables
│  ├─ POS - List Menu
│  ├─ POS - Create Order
│  ├─ POS - List Tables After Order
│  ├─ POS - Create Order Without Token
│  ├─ POS - Create Order Denied
│  ├─ POS - Reject Order Without Table
│  ├─ POS - Reject Order Without Items
│  ├─ POS - Reject Invalid Table
│  └─ POS - Reject Invalid Product
│
├─ KDS - Kitchen Monitor
│  ├─ KDS - List Kitchen Orders
│  ├─ KDS - Change Order Status to In Preparation
│  ├─ KDS - Change Item Status to In Preparation
│  ├─ KDS - Change Item Status to Ready
│  ├─ KDS - Change Order Status to Ready
│  └─ Validaciones negativas de permisos, estados y recursos inexistentes
│
├─ KDS - Service Notifications
│  ├─ KDS - Create Ready Order Service Call
│  ├─ KDS - Create Kitchen Incident Service Call
│  ├─ KDS - List Kitchen Service Calls
│  ├─ KDS - Attend Kitchen Service Call
│  ├─ KDS - Confirm Delivered Order
│  └─ Validaciones negativas de permisos, tipos y recursos inexistentes
│
├─ Salón
│  ├─ Zonas
│  └─ Mesas
│
├─ Auth - Session Hardening
│  ├─ Refresh - Current Session
│  ├─ Logout - Current Session
│  ├─ Login - Reject Unexpected Field
│  ├─ Refresh - Missing Token
│  ├─ Refresh - Invalid Token
│  └─ Login - Invalid Credentials / Rate Limit Probe
│
└─ Auth - Audit Events
   ├─ Audit - Trigger Login Success
   ├─ Audit - Trigger Login Failed
   ├─ Audit - Trigger Refresh Success
   ├─ Audit - Trigger Refresh Failed
   └─ Audit - Trigger Logout
```

---

## Variables recomendadas

La colección utiliza variables para evitar valores fijos dentro de las peticiones y para mantener el archivo exportado libre de credenciales y tokens reales.

Las variables están definidas en inglés y con formato `snake_case`.

```txt
base_url = http://localhost:3000/api

auth_token =
auth_refresh_token =
auth_session_id =
auth_session_expires_at =

admin_token =
admin_refresh_token =
admin_session_id =
admin_session_expires_at =

cashier_token =
cashier_refresh_token =
cashier_session_id =
cashier_session_expires_at =

waiter_token =
waiter_refresh_token =
waiter_session_id =
waiter_session_expires_at =

kds_token =
kds_refresh_token =
kds_session_id =
kds_session_expires_at =

user_token =
user_refresh_token =
user_session_id =
user_session_expires_at =

admin_identifier =
admin_password =
admin_remember = false

cashier_identifier =
cashier_password =
cashier_remember = false

waiter_identifier =
waiter_password =
waiter_remember = false

kds_identifier =
kds_password =
kds_remember = false

user_identifier =
user_password =
user_remember = false

bad_password =
invalid_refresh_token =
auth_validation_extra_field = true

invalid_id = 00000000-0000-0000-0000-000000000000
invalid_table_id = 00000000-0000-0000-0000-000000000000
invalid_product_id = 00000000-0000-0000-0000-000000000000
invalid_order_id = 00000000-0000-0000-0000-000000000000
invalid_item_id = 00000000-0000-0000-0000-000000000000
invalid_service_call_id = 00000000-0000-0000-0000-000000000000
```

La colección también utiliza variables funcionales para datos de usuarios, roles, establecimiento, carta, salón, POS y KDS. Estas variables deben completarse con datos de prueba locales antes de ejecutar los flujos correspondientes.

---

## Uso de variables

Ejemplo de endpoint parametrizado:

```txt
{{base_url}}/users
```

Ejemplo de header para rutas protegidas:

```txt
Authorization: Bearer {{admin_token}}
```

Ejemplo de body parametrizado para login:

```json
{
  "identifier": "{{admin_identifier}}",
  "password": "{{admin_password}}",
  "remember": "{{admin_remember}}"
}
```

Ejemplo de body parametrizado para editar usuario:

```json
{
  "nombres": "{{edit_user_first_name}}",
  "apellidos": "{{edit_user_last_name}}",
  "email": "{{edit_user_email}}",
  "username": "{{edit_user_username}}",
  "celular": "{{edit_user_mobile}}",
  "id_rol": "{{edit_user_role_id}}",
  "estado": "{{edit_user_status}}"
}
```

Ejemplo de body parametrizado para actualizar establecimiento:

```json
{
  "nombre_comercial": "{{establishment_trade_name}}",
  "razon_social": "{{establishment_legal_name}}",
  "ruc": "{{establishment_ruc}}",
  "direccion": "{{establishment_address}}",
  "telefono": "{{establishment_phone}}",
  "email": "{{establishment_email}}",
  "logo_url": "{{establishment_logo_url}}",
  "igv_porcentaje": "{{establishment_igv_percentage}}",
  "moneda_codigo": "{{establishment_currency_code}}",
  "moneda_simbolo": "{{establishment_currency_symbol}}"
}
```

Los valores booleanos y numéricos deben enviarse sin comillas.

Ejemplos:

```txt
"estado": {{edit_user_status}}
"remember": {{admin_remember}}
"igv_porcentaje": {{establishment_igv_percentage}}
```

---

## Flujo recomendado de validación

### Health

Ejecutar:

```txt
Health / Health Check
```

Confirma que el backend está activo y responde correctamente.

---

### Autenticación base

Ejecutar:

```txt
Auth / Login - Admin
Auth / Auth - Me
```

El login de administrador guarda las variables principales de sesión:

```txt
admin_token
admin_refresh_token
admin_session_id
admin_session_expires_at
auth_token
auth_refresh_token
auth_session_id
auth_session_expires_at
```

`Auth - Me` valida que el access token actual esté asociado a una sesión activa y devuelve usuario, permisos y módulos.

---

### Autorización por perfiles

Ejecutar la carpeta:

```txt
Authorization / Profiles
```

Estas pruebas validan el acceso permitido o denegado según permisos asociados al rol del usuario.

---

### Mantenimiento administrativo

Ejecutar según necesidad:

```txt
Roles
User Maintenance
Establishment
```

Estas carpetas cubren listado de roles, mantenimiento de usuarios y configuración del establecimiento. Deben ejecutarse con un usuario que tenga permisos administrativos.

---

### Carta, salón, POS y KDS

Las carpetas funcionales deben ejecutarse con variables coherentes entre sí.

Flujo operativo sugerido:

```txt
1. Auth / Login - Admin
2. Carta / Categorías
3. Carta / Productos
4. Salón / Zonas
5. Salón / Mesas
6. Auth / Login - Waiter
7. POS - Orders
8. Auth / Login - KDS
9. KDS - Kitchen Monitor
10. KDS - Service Notifications
```

Este orden permite generar datos reutilizables entre módulos, como categorías, productos, mesas, órdenes, ítems y avisos de servicio.

---

## Auth - Session Hardening

Esta carpeta valida el endurecimiento de sesión implementado en el backend.

Cubre:

```txt
Refresh de sesión actual
Logout de sesión actual
Rechazo de campos inesperados en login
Rechazo de refresh sin token
Rechazo de refresh inválido
Prueba de credenciales inválidas y rate limit
```

La petición `Refresh - Current Session` usa:

```txt
auth_refresh_token
```

y actualiza:

```txt
auth_token
auth_refresh_token
auth_session_id
auth_session_expires_at
```

La petición `Logout - Current Session` usa:

```txt
auth_token
```

y revoca la sesión actual en backend.

Después de ejecutar logout, cualquier request protegido con ese token debe fallar porque la sesión ya no está activa.

---

## Auth - Audit Events

Esta carpeta valida la integración de auditoría backend para la HU AAT-11.

Los requests de esta carpeta no consultan directamente la tabla `auditoria`. Su función es disparar eventos de autenticación y permitir la verificación posterior en base de datos.

Eventos esperados:

```txt
AUTH_LOGIN_SUCCESS
AUTH_LOGIN_FAILED
AUTH_REFRESH_SUCCESS
AUTH_REFRESH_FAILED
AUTH_LOGOUT
```

Flujo recomendado:

```txt
1. Audit - Trigger Login Success
2. Audit - Trigger Login Failed
3. Audit - Trigger Refresh Success
4. Audit - Trigger Refresh Failed
5. Audit - Trigger Logout
```

Validación SQL recomendada:

```sql
select
  id_auditoria,
  id_usuario,
  id_establecimiento,
  tabla_afectada,
  registro_id,
  accion,
  datos_nuevos,
  ip_origen,
  user_agent,
  created_at
from auditoria
where accion like 'AUTH_%'
order by created_at desc
limit 30;
```

Resultados esperados:

```txt
AUTH_LOGIN_SUCCESS debe registrar id_usuario, id_establecimiento y registro_id de sesión.
AUTH_LOGIN_FAILED puede registrar id_usuario e id_establecimiento como null si el usuario no se identifica.
AUTH_REFRESH_SUCCESS debe registrar la sesión renovada y rotated = true.
AUTH_REFRESH_FAILED no debe guardar el refresh token enviado.
AUTH_LOGOUT debe registrar la sesión revocada.
```

La auditoría no debe almacenar:

```txt
password
accessToken
refreshToken
refresh_token_hash
JWT completo
service role key
headers completos
```

---

## Descripción de carpetas

### Health

Contiene la prueba básica para verificar que el backend está activo.

### Auth

Contiene las pruebas de inicio de sesión por perfil y validación de sesión autenticada.

Los logins guardan tokens, refresh tokens y metadata de sesión en variables de colección para ser reutilizadas por rutas protegidas.

### Authorization / Profiles

Contiene pruebas para validar acceso permitido o denegado según el perfil operativo.

### Roles

Contiene la prueba para listar roles disponibles dentro del establecimiento autenticado.

### User Maintenance

Contiene las pruebas principales de mantenimiento de usuarios: consulta, creación, edición, activación/desactivación y validación de acceso sin permiso.

### Establishment

Contiene las pruebas principales de configuración del establecimiento: consulta y actualización de datos fiscales, parámetros de venta e identidad visual.

### Carta

Contiene las pruebas de categorías y productos. Incluye operaciones CRUD, cambios de estado, cambios de disponibilidad, carga de imágenes y validaciones de permisos.

### Salón

Contiene las pruebas de zonas y mesas. Incluye operaciones CRUD, cambios de disponibilidad, cambios de estado y validaciones de permisos.

### POS - Orders

Contiene las pruebas de mesas, carta disponible para POS y creación de comandas. También incluye validaciones negativas para token ausente, permisos insuficientes, mesa inválida, productos inválidos y body incompleto.

### KDS - Kitchen Monitor

Contiene las pruebas principales del monitor de cocina.

Estados de comanda usados:

```txt
ABIERTA
EN_PREPARACION
LISTA
```

Estados de ítems usados:

```txt
PENDIENTE
EN_PREPARACION
LISTO
```

### KDS - Service Notifications

Contiene las pruebas de notificación entre cocina y salón.

Tipos permitidos:

```txt
PEDIDO_LISTO
INCIDENCIA_COCINA
```

Estados permitidos:

```txt
PENDIENTE
ATENDIDA
CANCELADA
```

Estados usados para entrega:

```txt
orden: ENTREGADA
item_orden: ENTREGADO
```

### Auth - Session Hardening

Contiene pruebas de refresh, logout, validación estricta de payloads y escenarios negativos de sesión.

### Auth - Audit Events

Contiene requests diseñados para disparar eventos `AUTH_%` y validar trazabilidad en la tabla `auditoria`.

---

## Consideraciones de seguridad

No se deben subir al repositorio:

```txt
Tokens reales
Refresh tokens reales
Contraseñas reales
Credenciales personales
Cadenas de conexión
Datos privados del establecimiento
IDs reales innecesarios
URLs con credenciales
Variables de entorno locales
```

La colección debe trabajar con datos de prueba y variables locales de Postman.

Variables que deben quedar vacías antes de subir la colección:

```txt
admin_identifier
admin_password
cashier_identifier
cashier_password
waiter_identifier
waiter_password
kds_identifier
kds_password
user_identifier
user_password

admin_token
admin_refresh_token
cashier_token
cashier_refresh_token
waiter_token
waiter_refresh_token
kds_token
kds_refresh_token
user_token
user_refresh_token
auth_token
auth_refresh_token

admin_session_id
cashier_session_id
waiter_session_id
kds_session_id
user_session_id
auth_session_id

order_id
item_id
open_order_id
open_order_item_id
ready_order_id
service_call_id
incident_service_call_id
```

---

## Recomendación antes de exportar

Antes de exportar la colección desde Postman:

1. Verificar que las peticiones estén agrupadas en carpetas.
2. Eliminar requests vacíos o temporales.
3. Confirmar que no existan tokens reales guardados en headers, variables o bodies.
4. Confirmar que no existan contraseñas reales en los bodies.
5. Confirmar que las URLs usen `{{base_url}}`.
6. Confirmar que los IDs de usuarios, roles, órdenes e ítems estén parametrizados.
7. Confirmar que las variables sensibles estén vacías.
8. Exportar la colección actualizada.
9. Abrir el archivo exportado y buscar posibles secretos antes de commitear.
10. Reemplazar el archivo oficial de la colección en el repo.

Archivo esperado:

```txt
docs/postman/umari-os-api.postman_collection.json
```

Búsquedas recomendadas en el archivo exportado:

```txt
eyJ
Bearer
password
token
refreshToken
postgresql
supabase
DATABASE_URL
JWT_SECRET
SERVICE_ROLE
```

Si aparece un token, contraseña real o cadena de conexión real, no se debe subir el archivo hasta limpiarlo.

---

## Archivo de entorno local

No se recomienda subir un environment local de Postman con valores reales.

Si se desea documentar las variables necesarias, se puede crear un archivo de ejemplo sin credenciales ni tokens reales:

```txt
umari-os-api.example.postman_environment.json
```

Este archivo debe contener únicamente variables vacías o valores de ejemplo no sensibles.

Ejemplo permitido:

```txt
base_url = http://localhost:3000/api
invalid_order_id = 00000000-0000-0000-0000-000000000000
invalid_item_id = 00000000-0000-0000-0000-000000000000
```

Ejemplos no permitidos:

```txt
admin_password = contraseña_real
admin_token = token_real
DATABASE_URL = cadena_real_de_conexion
```

---

## Alcance de la colección

La colección permite validar de forma manual y controlada los principales flujos backend de Umarí OS.

No reemplaza pruebas automatizadas de backend, pruebas unitarias, pruebas de integración ni validaciones de despliegue.

La colección no debe almacenar información sensible y debe mantenerse como un artefacto reproducible para el equipo.
