// src/components/common/FeatureCard/FeatureCard.jsx

import "./FeatureCard.css"

export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon-wrapper">
        <img src={icon} alt="" className="feature-card__icon" aria-hidden="true" />
      </div>

      <div className="feature-card__content">
        <h3 className="feature-card__title">{title}</h3>
        <p className="feature-card__description">{description}</p>
      </div>
    </article>
  )
}