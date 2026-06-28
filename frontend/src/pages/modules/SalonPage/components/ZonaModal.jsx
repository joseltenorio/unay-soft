import { useState } from "react"
import {
  validateZonaForm,
  normalizeZonaName,
  hasValidationErrors
} from "../../../../utils/salonValidation"

const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function ZonaModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre: data?.nombre || "",
    descripcion: data?.descripcion || "",
    capacidad: data?.capacidad || "",
    estado: data?.estado ?? true,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleBlurOrChange = (updatedForm) => {
    const validationErrors = validateZonaForm(updatedForm)
    setErrors(validationErrors)
    return hasValidationErrors(validationErrors)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formNormalizado = {
      ...form,
      nombre: normalizeZonaName(form.nombre)
    }
    const formErrors = validateZonaForm(formNormalizado)
    if (hasValidationErrors(formErrors)) {
      setErrors(formErrors)
      return
    }
    setSaving(true)
    await onSave(
      { ...formNormalizado, capacidad: formNormalizado.capacidad ? Number(formNormalizado.capacidad) : null },
      data?.id_zona
    )
    setSaving(false)
  }

  return (
    <div className="salon-modal-overlay" onClick={onClose}>
      <div className="salon-modal" onClick={e => e.stopPropagation()}>
        <div className="salon-modal__header">
          <h2 className="salon-modal__title">{data ? "Editar zona" : "Nueva zona"}</h2>
          <button className="salon-modal__close" onClick={onClose}><IconX /></button>
        </div>
        <form className="salon-modal__form" onSubmit={handleSubmit}>

          {/* NOMBRE */}
          <div className="salon-modal__field">
            <label>Nombre <span className="salon-modal__req">*</span></label>
            <input
              value={form.nombre}
              onChange={e => {
                const newForm = { ...form, nombre: e.target.value }
                setForm(newForm)
                if (errors.nombre) handleBlurOrChange(newForm)
              }}
              onBlur={() => handleBlurOrChange(form)}
              placeholder="ej. Terraza, Salón Principal"
              required
              style={errors.nombre ? { borderColor: "#e63946" } : {}}
            />
            {errors.nombre && (
              <p style={{ color: "#e63946", fontSize: "12px", marginTop: "4px", lineHeight: "1.4" }}>
                {errors.nombre}
              </p>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="salon-modal__field">
            <label>Descripción <span className="salon-modal__opt">opcional</span></label>
            <input
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="ej. Zona exterior al aire libre"
            />
          </div>

          {/* CAPACIDAD */}
          <div className="salon-modal__field">
            <label>Capacidad total <span className="salon-modal__opt">opcional</span></label>
            <input
              type="number"
              value={form.capacidad}
              onChange={e => {
                const newForm = { ...form, capacidad: e.target.value }
                setForm(newForm)
                if (errors.capacidad) handleBlurOrChange(newForm)
              }}
              onBlur={() => handleBlurOrChange(form)}
              placeholder="ej. 20"
              style={errors.capacidad ? { borderColor: "#e63946" } : {}}
            />
            {errors.capacidad && (
              <p style={{ color: "#e63946", fontSize: "12px", marginTop: "4px" }}>
                {errors.capacidad}
              </p>
            )}
          </div>

          <div className="salon-modal__actions">
            <button type="button" className="salon-modal__btn-cancel" onClick={onClose}>Cancelar</button>
            <button
              type="submit"
              className="salon-modal__btn-save"
              disabled={saving || hasValidationErrors(errors)}
            >
              {saving ? "Guardando…" : data ? "Guardar cambios" : "Crear zona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}