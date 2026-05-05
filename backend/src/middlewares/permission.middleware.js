// backend/src/middlewares/permission.middleware.js

const { pool } = require("../config/database")

function authorizePermission(requiredPermissionCode) {
  return async function (req, res, next) {
    try {
      if (!req.user || !req.user.id_usuario) {
        return res.status(401).json({
          message: "Usuario no autenticado.",
        })
      }

      if (!requiredPermissionCode) {
        return res.status(500).json({
          message: "No se definió el permiso requerido para esta ruta.",
        })
      }

      const query = `
        select
          p.codigo as permiso_codigo
        from usuario u
        inner join rol r
          on r.id_rol = u.id_rol
         and r.id_establecimiento = u.id_establecimiento
        inner join rol_permiso rp
          on rp.id_rol = r.id_rol
        inner join permiso p
          on p.id_permiso = rp.id_permiso
        inner join modulo m
          on m.id_modulo = p.id_modulo
        where u.id_usuario = $1
          and u.estado = true
          and r.estado = true
          and p.estado = true
          and m.estado = true
          and p.codigo = $2
        limit 1;
      `

      const { rows } = await pool.query(query, [
        req.user.id_usuario,
        requiredPermissionCode,
      ])

      if (rows.length === 0) {
        return res.status(403).json({
          message: "No tiene permisos para acceder a este recurso.",
          requiredPermission: requiredPermissionCode,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error al validar permisos del usuario.",
        error: error.message,
      })
    }
  }
}

module.exports = {
  authorizePermission,
}