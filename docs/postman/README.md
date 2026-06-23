# Postman Collection

Colección oficial de Postman para consumir y validar manualmente los endpoints principales del backend de Umarí OS.

La colección está organizada por módulos y usa variables de colección para credenciales de prueba, tokens, IDs y datos reutilizables. El archivo exportado no debe contener credenciales reales, tokens reales, cadenas de conexión ni datos privados del establecimiento.

---

## Archivo principal

```txt
umari-os-api.postman_collection.json
```

---

## Requisitos previos

El backend debe estar levantado localmente y disponible en:

```txt
http://localhost:3000
```

La colección debe usar:

```txt
base_url = http://localhost:3000/api
```

El backend debe tener configurado su archivo local:

```txt
backend/.env
```

Referencia:

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
├─ User Maintenance - Validation
│  ├─ Create User - Valid Identity Format
│  ├─ Create User - Reject Name With Number
│  ├─ Create User - Reject Invalid Email
│  ├─ Create User - Reject Invalid Peru Phone
│  ├─ Create User - Reject Reserved Username
│  ├─ Create User - Reject Weak Password
│  ├─ Create User - Reject Unexpected Field
│  ├─ Edit User - Reject Malformed User ID
│  └─ Edit Status User - Reject String Boolean
│
├─ Establishment
│  ├─ Visual Establishment
│  └─ Edit Establishment
│
├─ Carta
│  ├─ Categorías
│  └─ Productos
│
├─ Salón
│  ├─ Zonas
│  └─ Mesas
│
├─ POS - Orders
│  ├─ POS - List Tables
│  ├─ POS - List Menu
│  ├─ POS - Create Order
│  ├─ POS - List Tables After Order
│  └─ Casos negativos de token, permisos y datos inválidos
│
├─ KDS - Kitchen Monitor
│  ├─ KDS - List Kitchen Orders
│  ├─ KDS - Change Order Status to In Preparation
│  ├─ KDS - Change Item Status to In Preparation
│  ├─ KDS - Change Item Status to Ready
│  ├─ KDS - Change Order Status to Ready
│  └─ Casos negativos de permisos, estados y recursos inexistentes
│
├─ KDS - Kitchen Context
│  ├─ KDS - Context Includes Order Creator
│  ├─ KDS - Context Includes Table Service Summary
│  ├─ KDS - Context Separates Order Notes
│  ├─ KDS - Context Separates Item Notes
│  └─ KDS - Context Identifies Support Orders
│
├─ KDS - Service Notifications
│  ├─ KDS - Create Ready Order Service Call
│  ├─ KDS - Create Kitchen Incident Service Call
│  ├─ KDS - List Kitchen Service Calls
│  ├─ KDS - Attend Kitchen Service Call
│  ├─ KDS - Confirm Delivered Order
│  └─ Casos negativos de permisos, tipos y recursos inexistentes
│
├─ KDS - Service Notification Context
│  └─ KDS - Service Calls Include Ownership Context
│
├─ Auth - Session Hardening
│  ├─ Refresh - Current Session
│  ├─ Logout - Current Session
│  ├─ Login - Reject Unexpected Field
│  ├─ Refresh - Missing Token
│  ├─ Refresh - Invalid Token
│  └─ Login - Invalid Credentials / Rate Limit Probe
│
├─ Auth - Idle Timeout
│  ├─ Idle Timeout - Login
│  ├─ Idle Timeout - Protected Request
│  └─ Idle Timeout - Protected Request After Inactivity
│
└─ Auth - Audit Events
   ├─ Audit - Trigger Login Success
   ├─ Audit - Trigger Login Failed
   ├─ Audit - Trigger Refresh Success
   ├─ Audit - Trigger Refresh Failed
   └─ Audit - Trigger Logout
```

---

## Variables principales

La colección utiliza variables en formato `snake_case`.

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

idle_timeout_token =
idle_timeout_session_id =

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

user_create_first_name =
user_create_last_name =
user_create_email =
user_create_identifier =
user_create_password =
user_create_mobile =
user_status = true
user_status_edit = false
user_id_edit =

edit_user_first_name =
edit_user_last_name =
edit_user_email =
edit_user_username =
edit_user_mobile =
edit_user_role_id =
edit_user_status = true

user_validation_id =
user_validation_first_name =
user_validation_last_name =
user_validation_email =
user_validation_username =
user_validation_password =
user_validation_mobile =

invalid_user_first_name =
invalid_user_email =
invalid_user_mobile =
reserved_username =
weak_user_password =
malformed_user_id =
```

Las carpetas funcionales usan variables adicionales para usuarios, roles, establecimiento, carta, salón, POS y KDS. Esas variables deben completarse con datos de prueba locales antes de ejecutar cada flujo.

---

## Uso de variables

Endpoint parametrizado:

```txt
{{base_url}}/users
```

Header para rutas protegidas:

```txt
Authorization: Bearer {{admin_token}}
```

Body de login:

```json
{
  "identifier": "{{admin_identifier}}",
  "password": "{{admin_password}}",
  "remember": "{{admin_remember}}"
}
```

Body de edición de usuario:

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

Body de validación de usuario:

```json
{
  "nombres": "{{user_validation_first_name}}",
  "apellidos": "{{user_validation_last_name}}",
  "email": "{{user_validation_email}}",
  "username": "{{user_validation_username}}",
  "password": "{{user_validation_password}}",
  "celular": "{{user_validation_mobile}}",
  "id_rol": "{{role_id}}",
  "estado": true
}
```

Body de actualización de establecimiento:

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

---

## Flujo recomendado de uso

### 1. Verificar disponibilidad

```txt
Health / Health Check
```

### 2. Inicializar autenticación

```txt
Auth / Login - Admin
Auth / Auth - Me
```

El login guarda tokens y datos de sesión en variables reutilizables por la colección.

### 3. Ejecutar módulos administrativos

```txt
Authorization / Profiles
Roles
User Maintenance
User Maintenance - Validation
Establishment
```

### 4. Ejecutar módulos operativos

Orden sugerido cuando se requiere generar datos entre módulos:

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
10. KDS - Kitchen Context
11. KDS - Service Notifications
12. KDS - Service Notification Context
```

### 5. Ejecutar carpetas de autenticación avanzada

```txt
Auth - Session Hardening
Auth - Idle Timeout
Auth - Audit Events
```

Estas carpetas usan variables propias para refresh, logout, sesiones, inactividad y disparo de eventos de autenticación.

---

## Descripción de carpetas

### Health

Verifica que el backend esté disponible.

### Auth

Contiene login por perfil y consulta de sesión autenticada.

### Authorization / Profiles

Agrupa requests de acceso permitido o denegado por perfil operativo.

### Roles

Lista roles disponibles para el establecimiento autenticado.

### User Maintenance

Agrupa requests de consulta, creación, edición y cambio de estado de usuarios.

### User Maintenance - Validation

Agrupa casos manuales de validación de usuarios para nombres, apellidos, correo, username, contraseña, celular peruano, parámetros UUID, campos inesperados y booleanos estrictos.

### Establishment

Agrupa requests de consulta y edición de configuración del establecimiento.

### Carta

Agrupa requests de categorías y productos.

### Salón

Agrupa requests de zonas y mesas.

### POS - Orders

Agrupa requests de mesas, carta disponible para POS y creación de comandas.

### KDS - Kitchen Monitor

Agrupa requests del monitor de cocina y actualización de estados de comandas e ítems.

### KDS - Kitchen Context

Agrupa casos manuales para validar que las comandas de cocina expongan creador de orden, responsable de mesa, resumen de cuenta activa, observaciones generales, notas por ítem y comandas de apoyo.

### KDS - Service Notifications

Agrupa requests de avisos de servicio entre cocina y salón.

### KDS - Service Notification Context

Agrupa casos manuales para validar contexto de usuario creador, usuario que atiende, orden asociada y resumen de mesa en avisos de cocina y servicio.

### Auth - Session Hardening

Agrupa requests de refresh, logout y escenarios negativos básicos de sesión.

### Auth - Idle Timeout

Agrupa requests para usar una sesión dedicada al flujo de inactividad.

Variables usadas por esta carpeta:

```txt
idle_timeout_token
idle_timeout_session_id
```

### Auth - Audit Events

Agrupa requests que disparan eventos de autenticación para revisión posterior fuera de Postman.

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

Antes de exportar la colección, deben quedar vacías las variables sensibles de credenciales, tokens, refresh tokens, sesiones e IDs operativos.

Variables sensibles principales:

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
user_create_password
user_validation_password
weak_user_password

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
idle_timeout_token

admin_session_id
cashier_session_id
waiter_session_id
kds_session_id
user_session_id
auth_session_id
idle_timeout_session_id

order_id
item_id
open_order_id
open_order_item_id
ready_order_id
service_call_id
incident_service_call_id
kds_context_order_id
kds_context_item_id
kds_support_order_id
kds_service_context_id
```

---

## Recomendación antes de exportar

Antes de exportar la colección desde Postman:

1. Verificar que las requests estén agrupadas en carpetas.
2. Eliminar requests vacíos o temporales.
3. Confirmar que las URLs usen `{{base_url}}`.
4. Confirmar que no existan tokens reales en headers, variables o bodies.
5. Confirmar que no existan contraseñas reales en los bodies.
6. Confirmar que los IDs operativos estén parametrizados.
7. Exportar la colección actualizada.
8. Abrir el archivo exportado y buscar posibles secretos antes de commitear.
9. Reemplazar el archivo oficial en el repositorio.

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

Si se documenta un environment de ejemplo, debe contener únicamente variables vacías o valores no sensibles.

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

## Alcance

La colección permite consumir y validar manualmente los principales flujos backend de Umarí OS.

No reemplaza pruebas unitarias, pruebas de integración, pruebas automatizadas ni validaciones de despliegue.
