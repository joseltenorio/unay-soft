// src/pages/modules/CashierPage/CashierPage.jsx

import ModulePlaceholder from "../ModulePlaceholder/ModulePlaceholder"

export default function CashierPage() {
  return (
    <ModulePlaceholder
      eyebrow="Caja y pagos"
      title="Gestión de Caja"
      description="Módulo para registrar pagos, controlar apertura de caja, cierre operativo y conciliación diaria."
      permission="cashier.ver"
    />
  )
}