// src/pages/modules/SecurityPage/SecurityPage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function SecurityPage() {
  return (
    <ModulePlaceholder
      eyebrow="Seguridad"
      title="Usuarios, Roles y Permisos"
      description="Módulo para administrar usuarios internos, roles operativos y permisos de acceso al sistema."
      permission="security.ver"
    />
  )
}