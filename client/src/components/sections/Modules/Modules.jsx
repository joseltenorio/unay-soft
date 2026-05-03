// src/components/sections/Modules/Modules.jsx

import FeatureCard from "../../common/FeatureCard/FeatureCard"

import iconPos from "../../../assets/icons/icon-pos.svg"
import iconKds from "../../../assets/icons/icon-kds.svg"
import iconInventory from "../../../assets/icons/icon-inventory.svg"
import iconBi from "../../../assets/icons/icon-bi.svg"

import "./Modules.css"

const modules = [
  {
    icon: iconPos,
    title: "Gestión de Salón (POS)",
    description:
      "Toma de comandas móvil sincronizada con cocina y facturación electrónica instantánea.",
  },
  {
    icon: iconKds,
    title: "Monitor de Cocina (KDS)",
    description:
      "Sistema de gestión de tiempos (KDS) para priorización de pedidos y control de despachos.",
  },
  {
    icon: iconInventory,
    title: "Control de Insumos",
    description:
      "Gestión de stock crítico y descuento automático de recetas para un inventario en tiempo real.",
  },
  {
    icon: iconBi,
    title: "Business Intelligence",
    description:
      "Dashboards avanzados para el seguimiento de KPIs, platos estrella y flujo de caja operativo.",
  },
]

export default function Modules() {
  return (
    <section className="modules" id="modulos">
      <div className="modules__container container">
        <div className="modules__heading">
          <h2 className="modules__title">
            Módulos de Gestión de Alto Rendimiento
          </h2>

          <p className="modules__description">
            Una infraestructura integrada que conecta cada área operativa para un
            control absoluto de la información.
          </p>
        </div>

        <div className="modules__grid" aria-label="Módulos principales de Umari">
          {modules.map((module) => (
            <FeatureCard
              key={module.title}
              icon={module.icon}
              title={module.title}
              description={module.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}