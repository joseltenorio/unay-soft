// src/pages/modules/PosPage/PosPage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function PosPage() {
  return (
    <ModulePlaceholder
      eyebrow="POS / Salón"
      title="Gestión de Salón"
      description="Módulo para atención de mesas, toma de pedidos, actualización de órdenes y coordinación con cocina."
      permission="pos.ver"
    />
  )
}