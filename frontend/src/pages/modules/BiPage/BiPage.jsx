// src/pages/modules/BiPage/Bipage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function BiPage() {
  return (
    <ModulePlaceholder
      eyebrow="Business Intelligence"
      title="Reportes e Indicadores"
      description="Módulo para consultar métricas del negocio, ventas, productos destacados y rendimiento operativo."
      permission="bi.ver"
    />
  )
}