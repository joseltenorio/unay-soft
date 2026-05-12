# Postman Collection

Esta carpeta contiene la colección de Postman utilizada para probar los endpoints principales del backend de Umarí OS.

La colección está organizada por módulos para facilitar la validación de autenticación, autorización por perfiles, roles y mantenimiento de usuarios.

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
└─ User Maintenance
   ├─ Users - Protected
   ├─ Create User
   ├─ Edit User
   ├─ Edit Status User
   └─ Create User No Permission
```

---

## Variables recomendadas

Se recomienda configurar variables en Postman para evitar repetir valores manualmente.

Variables sugeridas:

```txt
base_url = http://localhost:3000/api
admin_token = JWT_DEL_ADMIN
cajero_token = JWT_DEL_CAJERO
mesero_token = JWT_DEL_MESERO
user_token = JWT_DE_USUARIO_SIN_PERMISO
user_id = ID_DE_USUARIO_PARA_PRUEBAS
role_id = ID_DE_ROL_PARA_PRUEBAS
```

Ejemplo de uso en una petición:

```txt
{{base_url}}/users
```

Ejemplo de header para rutas protegidas:

```txt
Authorization: Bearer {{admin_token}}
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
admin_token
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

---

## Consideraciones de seguridad

No se deben subir al repositorio:

```txt
Tokens reales
Contraseñas reales
Credenciales personales
Datos sensibles de conexión
```

La colección debe trabajar con datos de prueba y variables locales de Postman.

---

## Recomendación antes de exportar

Antes de exportar la colección desde Postman:

1. Verificar que las peticiones estén agrupadas en carpetas.
2. Eliminar requests vacíos o temporales.
3. Confirmar que no existan tokens reales guardados en los headers.
4. Confirmar que no existan contraseñas personales en los bodies.
5. Exportar la colección actualizada.
6. Reemplazar el archivo:

```txt
docs/postman/umari-os-api.postman_collection.json
```
