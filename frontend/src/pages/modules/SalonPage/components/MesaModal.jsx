import { useState } from "react"

const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
export default function MesaModal({ data, zonas, defaultZonaId, onSave, onClose }) {
  const [form, setForm] = useState({
    numero: data?.numero || "",
    nombre: data?.nombre || "",
    capacidad: data?.capacidad || 4,
    id_zona: data?.id_zona || defaultZonaId || "",
    disponibilidad: data?.disponibilidad || "LIBRE",
    estado: data?.estado ?? true,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.numero) return
    setSaving(true)
    await onSave(
      { ...form, numero: Number(form.numero), capacidad: Number(form.capacidad), id_zona: form.id_zona || null },
      data?.id_mesa
    )
    setSaving(false)
  }

  return (
    <div className="salon-modal-overlay" onClick={onClose}>
      <div className="salon-modal" onClick={e => e.stopPropagation()}>
        <div className="salon-modal__header">
          <div>
            <h2 className="salon-modal__title">{data ? "Editar mesa" : "Nueva mesa"}</h2>
          </div>
          <button className="salon-modal__close" onClick={onClose}><IconX /></button>
        </div>
        <form className="salon-modal__form" onSubmit={handleSubmit}>
          <div className="salon-modal__row">
            <div className="salon-modal__field">
              <label>Número <span className="salon-modal__req">*</span></label>
              <input
                type="number" min="1"
                value={form.numero}
                onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
                placeholder="ej. 1"
                required
              />
            </div>
            <div className="salon-modal__field">
              <label>Capacidad <span className="salon-modal__req">*</span></label>
              <input
                type="number" min="1"
                value={form.capacidad}
                onChange={e => setForm(p => ({ ...p, capacidad: e.target.value }))}
              />
            </div>
          </div>
          <div className="salon-modal__field">
            <label>Nombre / Código <span className="salon-modal__opt">opcional</span></label>
            <input
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="ej. P01, Mesa VIP"
            />
          </div>
          <div className="salon-modal__field">
            <label>Zona <span className="salon-modal__opt">opcional</span></label>
            <select value={form.id_zona} onChange={e => setForm(p => ({ ...p, id_zona: e.target.value }))}>
              <option value="">Sin zona</option>
              {zonas.filter(z => z.estado).map(z => (
                <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
              ))}
            </select>
          </div>
          <div className="salon-modal__actions">
            <button type="button" className="salon-modal__btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="salon-modal__btn-save" disabled={saving}>
              {saving ? "Guardando…" : data ? "Guardar cambios" : "Crear mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

