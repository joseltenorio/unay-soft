import { useState } from "react"

export default function CategoriaModal({ data, onSave, onClose }) {
  const [nombre, setNombre] = useState(data?.nombre || "")
  const [descripcion, setDescripcion] = useState(data?.descripcion || "")

  async function handleSubmit(e) {
    e.preventDefault()
    await onSave({ nombre, descripcion }, data?.id_categoria)
  }

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm">
        <div className="pm__header">
          <div className="pm__header-left">
            <div className="pm__icon-wrap">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <h2 className="pm__title">{data ? "Editar categoría" : "Crear nueva categoría"}</h2>
              <p className="pm__subtitle">{data ? "Modifica la información de la categoría." : "Completa los campos para agregar una nueva categoría."}</p>
            </div>
          </div>
          <button className="pm__close" type="button" onClick={onClose}>✕</button>
        </div>

        <form className="pm__form" onSubmit={handleSubmit}>
          <div className="pm__field">
            <label className="pm__label">Nombre de la categoría <span className="pm__required">*</span></label>
            <div className="pm__input-wrap">
              <svg className="pm__input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <input
                className="pm__input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Entradas"
                required
              />
            </div>
          </div>

          <div className="pm__field">
            <label className="pm__label">Descripción <span className="pm__optional">(opcional)</span></label>
            <div className="pm__input-wrap pm__input-wrap--textarea">
              <svg className="pm__input-icon pm__input-icon--top" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <textarea
                className="pm__textarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Platos ligeros y piqueos para compartir."
                rows={3}
              />
            </div>
          </div>

          <div className="pm__actions">
            <button type="button" className="pm__btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="pm__btn-save">
              {data ? "Guardar categoria" : "Crear categoría"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}