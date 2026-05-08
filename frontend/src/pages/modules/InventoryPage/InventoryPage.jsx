// src/pages/modules/InventoryPage/InventoryPage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function InventoryPage() {
  return (
    <ModulePlaceholder
      eyebrow="Inventario"
      title="Control de Insumos"
      description="Módulo para gestionar stock, registrar movimientos, controlar mermas y anticipar faltantes críticos."
      permission="inventory.ver"
    />
  )
}