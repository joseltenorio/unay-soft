// frontend/src/components/sections/Pricing/Pricing.jsx

import "./Pricing.css"

const plans = [
  {
    name: "Básico",
    description: "Digitalización esencial para tu local.",
    price: "S/89",
    period: "/mes",
    annual: "o S/890/año",
    features: [
      "Punto de venta POS",
      "Facturación electrónica",
      "Impresión de comandas",
      "Carta Digital QR visual",
      "Hasta 10 usuarios/empleados",
      "Soporte técnico por WhatsApp",
    ],
    cta: "Empezar ahora",
  },
  {
    name: "Experto",
    description: "Optimiza tu operación con asistencia virtual a tus clientes.",
    price: "S/119",
    period: "/mes",
    annual: "o S/1,190/año",
    popular: true,
    features: [
      "Todo el plan Básico",
      "Monitor de Cocina Web KDS",
      "Control de Inventario de platos",
      "Asistente Virtual de Consultas",
      "Reportes de Ventas y Rendimiento",
      "Hasta 25 usuarios/empleados",
      "Soporte prioritario 24/7",
    ],
    cta: "Empezar ahora",
  },
  {
    name: "Empresarial",
    description: "Inteligencia total para cadena de restaurantes.",
    price: "Personalizado",
    features: [
      "Todo el plan Experto",
      "Multi-sucursal ilimitado",
      "Sugerencias inteligentes del asistente",
      "Analíticas de rentabilidad",
      "Asesor dedicado",
      "Capacitación incluida",
    ],
    cta: "Contactar",
  },
]

export default function Pricing() {
  return (
    <section className="pricing-section" id="precios">
      <div className="pricing-section__container container">
        <div className="pricing-section__heading">
          <p className="pricing-section__eyebrow">Planes</p>

          <h2 className="pricing-section__title">
            Planes ideales para cada etapa
          </h2>

          <p className="pricing-section__description">
            Precios claros y transparentes. Cancela cuando quieras.
          </p>
        </div>

        <div className="pricing-section__grid" aria-label="Planes de Umarí">
          {plans.map((plan) => (
            <article
              className={
                plan.popular
                  ? "pricing-plan pricing-plan--popular"
                  : "pricing-plan"
              }
              key={plan.name}
            >
              {plan.popular && (
                <span className="pricing-plan__badge">
                  Máxima rentabilidad
                </span>
              )}

              <div className="pricing-plan__header">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="pricing-plan__price">
                <strong>{plan.price}</strong>

                {plan.period && (
                  <span>{plan.period}</span>
                )}

                {plan.annual && (
                  <small>{plan.annual}</small>
                )}
              </div>

              <ul className="pricing-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                className={
                  plan.popular
                    ? "pricing-plan__button pricing-plan__button--primary"
                    : "pricing-plan__button"
                }
                href="#demo"
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}