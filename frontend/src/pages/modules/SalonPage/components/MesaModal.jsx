import { useState } from "react"
import {
  validateMesaForm,
  normalizeMesaName,
  hasValidationErrors
} from "../../../../utils/salonValidation"

const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function MesaModal({ data, zonas, defaultZonaId, mesasExistentes = [], onSave, onClose }) {
  const [form, setForm] = useState({
    numero: data?.numero || (
      mesasExistentes.length > 0
        ? Math.max(...mesasExistentes.map(m => Number(m.numero || 0))) + 1
        : 1
    ),
    nombre: data?.nombre || "",
    capacidad: data?.capacidad || 4,
    id_zona: data?.id_zona || defaultZonaId || "",
    disponibilidad: data?.disponibilidad || "LIBRE",
    estado: data?.estado ?? true,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleBlurOrChange = (updatedForm) => {
    const validationErrors = validateMesaForm(updatedForm)
    setErrors(validationErrors)
    return hasValidationErrors(validationErrors)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formNormalizado = {
      ...form,
      nombre: normalizeMesaName(form.nombre),
      numero: Number(form.numero),
      capacidad: Number(form.capacidad),
    }
    const formErrors = validateMesaForm(formNormalizado)
    if (hasValidationErrors(formErrors)) {
      setErrors(formErrors)
      return
    }
    setSaving(true)
    await onSave(
      { ...formNormalizado, id_zona: formNormalizado.id_zona || null },
      data?.id_mesa
    )
    setSaving(false)
  }

  return (
    <div className="salon-modal-overlay" onClick={onClose}>
      <div className="salon-modal" onClick={e => e.stopPropagation()}>
        <div className="salon-modal__header">
          <h2 className="salon-modal__title">{data ? "Editar mesa" : "Nueva mesa"}</h2>
          <button className="salon-modal__close" onClick={onClose}><IconX /></button>
        </div>
        <form className="salon-modal__form" onSubmit={handleSubmit}>

          <div className="salon-modal__row">
            {/* NÚMERO */}
            <div className="salon-modal__field">
              <label>Número <span className="salon-modal__req">*</span></label>
              <input
                type="number" min="1"
                value={form.numero}
                onChange={e => {
                  const newForm = { ...form, numero: e.target.value }
                  setForm(newForm)
                  if (errors.numero) handleBlurOrChange(newForm)
                }}
                onBlur={() => handleBlurOrChange(form)}
                placeholder="ej. 1"
                required
                style={errors.numero ? { borderColor: "#e63946" } : {}}
              />
              {errors.numero && (
                <p style={{ color: "#e63946", fontSize: "12px", marginTop: "4px" }}>
                  {errors.numero}
                </p>
              )}
            </div>

            {/* CAPACIDAD */}
            <div className="salon-modal__field">
              <label>Capacidad <span className="salon-modal__req">*</span></label>
              <input
                type="number" min="1"
                value={form.capacidad}
                onChange={e => {
                  const newForm = { ...form, capacidad: e.target.value }
                  setForm(newForm)
                  if (errors.capacidad) handleBlurOrChange(newForm)
                }}
                onBlur={() => handleBlurOrChange(form)}
                style={errors.capacidad ? { borderColor: "#e63946" } : {}}
              />
              {errors.capacidad && (
                <p style={{ color: "#e63946", fontSize: "12px", marginTop: "4px" }}>
                  {errors.capacidad}
                </p>
              )}
            </div>
          </div>

          {/* NOMBRE OPCIONAL */}
          <div className="salon-modal__field">
            <label>Nombre / Código <span className="salon-modal__opt">opcional</span></label>
            <input
              value={form.nombre}
              onChange={e => {
                const newForm = { ...form, nombre: e.target.value }
                setForm(newForm)
                if (errors.nombre) handleBlurOrChange(newForm)
              }}
              onBlur={() => handleBlurOrChange(form)}
              placeholder="ej. P01, Mesa VIP"
              style={errors.nombre ? { borderColor: "#e63946" } : {}}
            />
            {errors.nombre && (
              <p style={{ color: "#e63946", fontSize: "12px", marginTop: "4px", lineHeight: "1.4" }}>
                {errors.nombre}
              </p>
            )}
          </div>

          {/* ZONA */}
          <div className="salon-modal__field">
            <label>Zona <span className="salon-modal__opt">opcional</span></label>
            <select
              value={form.id_zona}
              onChange={e => setForm(p => ({ ...p, id_zona: e.target.value }))}
            >
              <option value="">Sin zona</option>
              {zonas.filter(z => z.estado).map(z => (
                <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
              ))}
            </select>
          </div>

          <div className="salon-modal__actions">
            <button type="button" className="salon-modal__btn-cancel" onClick={onClose}>Cancelar</button>
            <button
              type="submit"
              className="salon-modal__btn-save"
              disabled={saving || hasValidationErrors(errors)}
            >
              {saving ? "Guardando…" : data ? "Guardar cambios" : "Crear mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}