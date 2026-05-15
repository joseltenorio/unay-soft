# Postman Collection

Esta carpeta contiene la colección de Postman utilizada para probar los endpoints principales del backend de Umarí OS.

La colección está organizada por módulos para facilitar la validación de autenticación, autorización por perfiles, roles, mantenimiento de usuarios y configuración del establecimiento.

---

## Archivo principal

```txt
umari-os-api.postman_collection.json
```

---

## Requisitos previos

Antes de ejecutar la colección, asegúrate de tener el backend levantado localmente.

Desde la carpeta del backend:

```txt
cd backend
npm run dev
```

El backend debe estar disponible en:

```txt
http://localhost:3000
```

También debes tener configurado el archivo de variables de entorno:

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
│  ├─ Login - Cajero
│  ├─ Login - User
│  └─ Login - Mesero
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
└─ Establishment
   ├─ Get Establishment
   ├─ Update Establishment
```

---

## Variables recomendadas

Se recomienda configurar variables en Postman para evitar repetir valores manualmente y para que la colección exportada no contenga credenciales, tokens o IDs reales.

Variables sugeridas:

```txt
BASE_URL = http://localhost:3000/api

AUTH_TOKEN = JWT_DEL_USUARIO_AUTENTICADO
ADMIN_TOKEN = JWT_DEL_ADMIN
CAJERO_TOKEN = JWT_DEL_CAJERO
MESERO_TOKEN = JWT_DEL_MESERO
USER_TOKEN = JWT_DE_USUARIO_SIN_PERMISO

ADMIN_IDENTIFIER = IDENTIFICADOR_DEL_ADMIN
ADMIN_PASSWORD = PASSWORD_DEL_ADMIN

CAJERO_IDENTIFIER = IDENTIFICADOR_DEL_CAJERO
CAJERO_PASSWORD = PASSWORD_DEL_CAJERO

MESERO_IDENTIFIER = IDENTIFICADOR_DEL_MESERO
MESERO_PASSWORD = PASSWORD_DEL_MESERO

USER_IDENTIFIER = IDENTIFICADOR_DEL_USUARIO_SIN_PERMISO
USER_PASSWORD = PASSWORD_DEL_USUARIO_SIN_PERMISO

CREATE_USER_NOMBRES = NOMBRES_DEL_USUARIO
CREATE_USER_APELLIDOS = APELLIDOS_DEL_USUARIO
CREATE_USER_EMAIL = EMAIL_DEL_USUARIO
CREATE_USER_USERNAME = USERNAME_DEL_USUARIO
CREATE_USER_CELULAR = CELULAR_DEL_USUARIO
CREATE_USER_PASSWORD = PASSWORD_DEL_USUARIO
CREATE_USER_ROLE_ID = ID_DEL_ROL

EDIT_USER_ID = ID_DEL_USUARIO_A_EDITAR
EDIT_USER_NOMBRES = NOMBRES_ACTUALIZADOS
EDIT_USER_APELLIDOS = APELLIDOS_ACTUALIZADOS
EDIT_USER_EMAIL = EMAIL_ACTUALIZADO
EDIT_USER_USERNAME = USERNAME_ACTUALIZADO
EDIT_USER_CELULAR = CELULAR_ACTUALIZADO
EDIT_USER_ROLE_ID = ID_DEL_ROL
EDIT_USER_ESTADO = true

STATUS_USER_ID = ID_DEL_USUARIO
STATUS_USER_ESTADO = true

ESTABLISHMENT_NOMBRE_COMERCIAL = NOMBRE_COMERCIAL
ESTABLISHMENT_RAZON_SOCIAL = RAZON_SOCIAL
ESTABLISHMENT_RUC = RUC_DEL_ESTABLECIMIENTO
ESTABLISHMENT_DIRECCION = DIRECCION_DEL_ESTABLECIMIENTO
ESTABLISHMENT_TELEFONO = TELEFONO_DEL_ESTABLECIMIENTO
ESTABLISHMENT_EMAIL = EMAIL_DEL_ESTABLECIMIENTO
ESTABLISHMENT_LOGO_URL = URL_DEL_LOGO
ESTABLISHMENT_IGV_PORCENTAJE = 18
ESTABLISHMENT_MONEDA_CODIGO = PEN
ESTABLISHMENT_MONEDA_SIMBOLO = S/.
```

Ejemplo de uso en una petición:

```txt
{{BASE_URL}}/users
```

Ejemplo de header para rutas protegidas:

```txt
Authorization: Bearer {{AUTH_TOKEN}}
```

Ejemplo de body parametrizado para login:

```json
{
  "identifier": "{{ADMIN_IDENTIFIER}}",
  "password": "{{ADMIN_PASSWORD}}"
}
```

Ejemplo de body parametrizado para editar usuario:

```json
{
  "nombres": "{{EDIT_USER_NOMBRES}}",
  "apellidos": "{{EDIT_USER_APELLIDOS}}",
  "email": "{{EDIT_USER_EMAIL}}",
  "username": "{{EDIT_USER_USERNAME}}",
  "celular": "{{EDIT_USER_CELULAR}}",
  "id_rol": "{{EDIT_USER_ROLE_ID}}",
  "estado": {{EDIT_USER_ESTADO}}
}
```

Ejemplo de body parametrizado para actualizar establecimiento:

```json
{
  "nombre_comercial": "{{ESTABLISHMENT_NOMBRE_COMERCIAL}}",
  "razon_social": "{{ESTABLISHMENT_RAZON_SOCIAL}}",
  "ruc": "{{ESTABLISHMENT_RUC}}",
  "direccion": "{{ESTABLISHMENT_DIRECCION}}",
  "telefono": "{{ESTABLISHMENT_TELEFONO}}",
  "email": "{{ESTABLISHMENT_EMAIL}}",
  "logo_url": "{{ESTABLISHMENT_LOGO_URL}}",
  "igv_porcentaje": {{ESTABLISHMENT_IGV_PORCENTAJE}},
  "moneda_codigo": "{{ESTABLISHMENT_MONEDA_CODIGO}}",
  "moneda_simbolo": "{{ESTABLISHMENT_MONEDA_SIMBOLO}}"
}
```

Los valores booleanos y numéricos deben colocarse sin comillas.

Ejemplos:

```txt
"estado": {{EDIT_USER_ESTADO}}
"igv_porcentaje": {{ESTABLISHMENT_IGV_PORCENTAJE}}
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

Esta prueba permite confirmar que el backend está activo.

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

El token debe guardarse en la variable:

```txt
AUTH_TOKEN
```

También puede guardarse en:

```txt
ADMIN_TOKEN
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

Esta prueba valida que el token enviado pertenece a un usuario autenticado y permite revisar la información del usuario, sus permisos y módulos disponibles.

---

### 4. Validar permisos de administrador

Ejecutar:

```txt
Authorization / Profiles / Permission - Admin Check
```

Esta prueba permite confirmar que el usuario administrador tiene acceso a rutas protegidas por permisos.

---

### 5. Probar acceso por perfiles

Ejecutar las pruebas de la carpeta:

```txt
Authorization / Profiles
```

Casos incluidos:

```txt
Cajero - Caja Permitido
Cajero - POS Denegado
Mesero - Caja Denegado
Mesero - POS Permitido
```

Estas pruebas permiten validar que cada perfil solo accede a los módulos autorizados.

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

Esta prueba permite listar los roles disponibles para el mantenimiento de usuarios.

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

Estas pruebas permiten validar el mantenimiento de usuarios del sistema.

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

Estas pruebas permiten validar la consulta y actualización de la configuración global del establecimiento.

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

## Descripción de carpetas

### Health

Contiene la prueba básica para verificar que el backend está activo.

### Auth

Contiene las pruebas de inicio de sesión y validación de sesión autenticada.

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

---

## Consideraciones de seguridad

No se deben subir al repositorio:

```txt
Tokens reales
Contraseñas reales
Credenciales personales
Datos sensibles de conexión
Datos privados del establecimiento
```

La colección debe trabajar con datos de prueba y variables locales de Postman.

---

## Recomendación antes de exportar

Antes de exportar la colección desde Postman:

1. Verificar que las peticiones estén agrupadas en carpetas.
2. Eliminar requests vacíos o temporales.
3. Confirmar que no existan tokens reales guardados en los headers.
4. Confirmar que no existan contraseñas reales en los bodies.
5. Confirmar que las URLs usen `{{BASE_URL}}`.
6. Confirmar que los IDs de usuarios, roles y establecimiento estén parametrizados.
7. Exportar la colección actualizada.
8. Reemplazar el archivo:

```txt
docs/postman/umari-os-api.postman_collection.json
```
