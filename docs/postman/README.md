# Postman Collection

Esta carpeta contiene la colección de Postman utilizada para validar los endpoints principales del backend de Umarí OS.

La colección está organizada por módulos para facilitar la validación de autenticación, autorización por perfiles, roles, mantenimiento de usuarios, configuración del establecimiento y monitor de cocina.

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

También debe existir el archivo de variables de entorno:

```txt
backend/.env
```

Puedes tomar como referencia:

```txt
backend/.env.example
```

---

## Estructura de la colección

La colección está organizada de la siguiente manera:

```txt
Umari OS API
├─ Health
│  └─ Health Check
│
├─ Auth
│  ├─ Login - Admin
│  ├─ Auth - Me
│  ├─ Login - Cashier
│  ├─ Login - Waiter
│  ├─ Login - Kitchen
│  └─ Login - User
│
├─ Authorization / Profiles
│  ├─ Permission - Admin Check
│  ├─ Cashier - Cashier Area Allowed
│  ├─ Cashier - POS Area Denied
│  ├─ Waiter - Cashier Area Denied
│  └─ Waiter - POS Area Allowed
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
│  ├─ Get Establishment
│  └─ Update Establishment
│
└─ KDS - Kitchen Monitor
   ├─ List Kitchen Orders
   ├─ List Kitchen Orders Without Token
   ├─ List Kitchen Orders Denied
   ├─ Change Order Status to In Preparation
   ├─ Change Order Status to Ready
   ├─ Change Item Status to In Preparation
   ├─ Change Item Status to Ready
   ├─ Reject Item Ready Before Order Starts
   ├─ Reject Order Invalid Status
   ├─ Reject Item Invalid Status
   ├─ Reject Order Status Without Body
   ├─ Reject Missing Order
   └─ Reject Missing Item
```

---

## Variables recomendadas

La colección utiliza variables de Postman para evitar valores fijos dentro de las peticiones y para permitir que el archivo exportado no contenga credenciales, tokens o IDs reales.

Las variables están definidas en inglés y con formato `snake_case`.

```txt
base_url = http://localhost:3000/api

auth_token =
admin_token =
cashier_token =
waiter_token =
kds_token =
user_token =

admin_identifier =
admin_password =

cashier_identifier =
cashier_password =

waiter_identifier =
waiter_password =

kds_identifier =
kds_password =

user_identifier =
user_password =

create_user_first_name =
create_user_last_name =
create_user_email =
create_user_username =
create_user_mobile =
create_user_password =
create_user_role_id =
create_user_status = true

edit_user_id =
edit_user_first_name =
edit_user_last_name =
edit_user_email =
edit_user_username =
edit_user_mobile =
edit_user_role_id =
edit_user_status = true

status_user_id =
status_user_status = true

establishment_trade_name =
establishment_legal_name =
establishment_ruc =
establishment_address =
establishment_phone =
establishment_email =
establishment_logo_url =
establishment_igv_percentage = 18
establishment_currency_code = PEN
establishment_currency_symbol = S/.

order_id =
item_id =
open_order_id =
open_order_item_id =

invalid_order_id = 00000000-0000-0000-0000-000000000000
invalid_item_id = 00000000-0000-0000-0000-000000000000
```

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
  "password": "{{admin_password}}"
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
  "estado": {{edit_user_status}}
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
  "igv_porcentaje": {{establishment_igv_percentage}},
  "moneda_codigo": "{{establishment_currency_code}}",
  "moneda_simbolo": "{{establishment_currency_symbol}}"
}
```

Ejemplo de body para actualizar el estado de una comanda de cocina:

```json
{
  "status": "EN_PREPARACION"
}
```

Ejemplo de body para actualizar el estado de un ítem de cocina:

```json
{
  "status": "LISTO"
}
```

Los valores booleanos y numéricos deben enviarse sin comillas.

Ejemplos:

```txt
"estado": {{edit_user_status}}
"igv_porcentaje": {{establishment_igv_percentage}}
```

---

## Flujo recomendado de pruebas

### 1. Verificar backend

Ejecutar:

```txt
Health / Health Check
```

Endpoint:

```txt
GET /api/health
```

Esta prueba confirma que el backend está activo.

---

### 2. Iniciar sesión como administrador

Ejecutar:

```txt
Auth / Login - Admin
```

Endpoint:

```txt
POST /api/auth/login
```

Esta petición devuelve un token JWT de administrador.

El token debe guardarse en:

```txt
admin_token
```

También puede guardarse en:

```txt
auth_token
```

---

### 3. Validar sesión autenticada

Ejecutar:

```txt
Auth / Auth - Me
```

Endpoint:

```txt
GET /api/auth/me
```

Esta prueba valida el usuario autenticado, sus permisos y sus módulos disponibles.

---

### 4. Validar permisos de administrador

Ejecutar:

```txt
Authorization / Profiles / Permission - Admin Check
```

Esta prueba confirma que el usuario administrador accede correctamente a rutas protegidas por permisos.

---

### 5. Probar acceso por perfiles

Ejecutar las pruebas de la carpeta:

```txt
Authorization / Profiles
```

Casos incluidos:

```txt
Cashier - Cashier Area Allowed
Cashier - POS Area Denied
Waiter - Cashier Area Denied
Waiter - POS Area Allowed
```

Estas pruebas validan que cada perfil acceda únicamente a las áreas permitidas.

---

### 6. Probar roles

Ejecutar:

```txt
Roles / Admin Roles
```

Endpoint:

```txt
GET /api/roles
```

Esta prueba lista los roles disponibles para el mantenimiento de usuarios.

Debe ejecutarse con un token de administrador.

---

### 7. Probar mantenimiento de usuarios

Ejecutar las pruebas de la carpeta:

```txt
User Maintenance
```

Endpoints principales:

```txt
GET    /api/users
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status
```

Operaciones incluidas:

```txt
Listar usuarios
Crear usuario
Editar usuario
Activar o desactivar usuario
Validar acceso denegado para usuario sin permiso
```

---

### 8. Probar configuración del establecimiento

Ejecutar las pruebas de la carpeta:

```txt
Establishment
```

Endpoints principales:

```txt
GET /api/establishment
PUT /api/establishment
```

Operaciones incluidas:

```txt
Consultar datos del establecimiento
Actualizar datos fiscales
Actualizar parámetros de venta
Actualizar identidad visual
Validar acceso denegado para usuario sin permiso
```

Debe ejecutarse con un token de administrador o con un usuario que tenga los permisos correspondientes:

```txt
establishment.ver
establishment.editar
```

---

### 9. Probar monitor de cocina

Ejecutar las pruebas de la carpeta:

```txt
KDS - Kitchen Monitor
```

Endpoints principales:

```txt
GET   /api/kds/orders
PATCH /api/kds/orders/:id/status
PATCH /api/kds/items/:id/status
```

Operaciones incluidas:

```txt
Listar comandas activas de cocina
Guardar automáticamente IDs de comanda e ítem
Cambiar comanda a EN_PREPARACION
Cambiar comanda a LISTA
Cambiar ítem a EN_PREPARACION
Cambiar ítem a LISTO
Validar rechazo de listado sin token
Validar rechazo de listado sin permiso
Validar rechazo de actualización sin permiso
Validar rechazo de estados no permitidos
Validar rechazo de body sin status
Validar rechazo de comanda inexistente
Validar rechazo de ítem inexistente
```

Debe ejecutarse con un usuario que tenga los permisos correspondientes:

```txt
kds.ver
kds.actualizar_estado
```

Para pruebas negativas de autorización, debe usarse un usuario sin permisos del monitor de cocina.

---

## Descripción de carpetas

### Health

Contiene la prueba básica para verificar que el backend está activo.

### Auth

Contiene las pruebas de inicio de sesión y validación de sesión autenticada.

Los logins guardan tokens en variables de colección para que puedan reutilizarse en las rutas protegidas.

Variables de token usadas:

```txt
admin_token
cashier_token
waiter_token
kds_token
user_token
auth_token
```

### Authorization / Profiles

Contiene pruebas para validar el acceso permitido o denegado según el perfil del usuario.

### Roles

Contiene la prueba para listar roles disponibles dentro del sistema.

### User Maintenance

Contiene las pruebas principales del mantenimiento de usuarios.

Incluye operaciones de consulta, creación, edición y cambio de estado.

### Establishment

Contiene las pruebas principales de configuración del establecimiento.

Incluye operaciones de consulta y actualización de datos fiscales, parámetros de venta e identidad visual.

### KDS - Kitchen Monitor

Contiene las pruebas principales del monitor de cocina.

Incluye operaciones de consulta de comandas activas, actualización de estado de comanda, actualización de estado de ítems y validaciones de permisos.

Los estados permitidos para comanda en estas pruebas son:

```txt
ABIERTA
EN_PREPARACION
LISTA
```

Los estados permitidos para ítems de cocina en estas pruebas son:

```txt
PENDIENTE
EN_PREPARACION
LISTO
```

No se incluyen pruebas de entrega, despacho o cierre final de atención en esta carpeta.

---

## Consideraciones de seguridad

No se deben subir al repositorio:

```txt
Tokens reales
Contraseñas reales
Credenciales personales
Datos sensibles de conexión
Datos privados del establecimiento
IDs reales innecesarios
URLs con credenciales
Variables de entorno locales
```

La colección debe trabajar con datos de prueba y variables locales de Postman.

Los valores sensibles deben mantenerse vacíos en la colección exportada.

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
cashier_token
waiter_token
kds_token
user_token
auth_token
order_id
item_id
open_order_id
open_order_item_id
```

---

## Recomendación antes de exportar

Antes de exportar la colección desde Postman:

1. Verificar que las peticiones estén agrupadas en carpetas.
2. Eliminar requests vacíos o temporales.
3. Confirmar que no existan tokens reales guardados en los headers.
4. Confirmar que no existan contraseñas reales en los bodies.
5. Confirmar que las URLs usen `{{base_url}}`.
6. Confirmar que los IDs de usuarios, roles, órdenes e ítems estén parametrizados.
7. Confirmar que las variables sensibles estén vacías.
8. Exportar la colección actualizada.
9. Abrir el archivo exportado y buscar posibles secretos antes de commitear.
10. Reemplazar el archivo:

```txt
docs/postman/umari-os-api.postman_collection.json
```

Búsquedas recomendadas en el archivo exportado:

```txt
eyJ
Bearer
password
token
postgresql
supabase
DATABASE_URL
JWT_SECRET
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
