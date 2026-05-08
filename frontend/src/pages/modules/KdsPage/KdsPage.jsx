// src/pages/modules/KdsPage/KdsPage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function KdsPage() {
  return (
    <ModulePlaceholder
      eyebrow="KDS / Cocina"
      title="Monitor de Cocina"
      description="Módulo para visualizar pedidos pendientes, controlar preparación y marcar órdenes listas para despacho."
      permission="kds.ver"
    />
  )
}