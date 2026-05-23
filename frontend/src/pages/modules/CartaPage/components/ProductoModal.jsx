import { useState, useEffect } from "react"
import { getEtiquetas } from "../../../../services/cartaService"

const tagEmojis = {
  "Más vendido": "⭐",
  "Nuevo": "🔵",
  "Picante": "🌶️",
  "Recomendado": "👍",
}

export default function ProductoModal({ data, categorias, defaultCategoryId, onSave, onClose }) {
  const [nombre, setNombre] = useState(data?.nombre || "")
  const [descripcion, setDescripcion] = useState(data?.descripcion || "")
  const [precio, setPrecio] = useState(data?.precio_base || "")
  const [categoria, setCategoria] = useState(data?.id_categoria ||  defaultCategoryId || "")
  const [imagen, setImagen] = useState(data?.imagen_referencial || "")
  const [etiquetas, setEtiquetas] = useState([])
  const [selectedTags, setSelectedTags] = useState(
    data?.etiquetas?.map((e) => e.id_etiqueta) || []
  )

  useEffect(() => {
    getEtiquetas().then(setEtiquetas).catch(() => {})
  }, [])

  function toggleTag(id) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSave(
      { nombre, descripcion, precio_base: Number(precio), id_categoria: categoria, imagen_referencial: imagen, tag_ids: selectedTags },
      data?.id_producto
    )
  }

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm">

        {/* Header */}
        <div className="pm__header">
          <div className="pm__header-left">
            <div className="pm__icon-wrap">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              {/*<p className="pm__eyebrow">{data ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</p>*/}
              <h2 className="pm__title">{data ? "Editar producto" : "Crear nuevo producto"}</h2>
              <p className="pm__subtitle">{data ? "Modifica la información del producto." : "Completa los siguientes campos para agregar un nuevo producto."}</p>
            </div>
          </div>
          <button className="pm__close" type="button" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form className="pm__form" onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="pm__field">
            <label className="pm__label">Nombre del producto <span className="pm__required">*</span></label>
            <div className="pm__input-wrap">
              <svg className="pm__input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <input className="pm__input" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Café molido 250g" required />
            </div>
          </div>

          {/* Descripción */}
          <div className="pm__field">
            <label className="pm__label">Descripción <span className="pm__optional">(opcional)</span></label>
            <div className="pm__input-wrap pm__input-wrap--textarea">
              <svg className="pm__input-icon pm__input-icon--top" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <textarea className="pm__textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Café 100% arábica, tueste medio, ideal para todo tipo de preparación." rows={3} />
            </div>
          </div>

          {/* Precio */}
          <div className="pm__field">
            <label className="pm__label">Precio <span className="pm__required">*</span></label>
            <div className="pm__input-wrap">
              <svg className="pm__input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6M12 18h.01"/></svg>
              <input className="pm__input" type="number" step="0.01" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: 12.90" required />
            </div>
          </div>

          {!defaultCategoryId && (
  <div className="pm__field">
    <label className="pm__label">Categoría <span className="pm__required">*</span></label>
    <div className="pm__input-wrap pm__input-wrap--select">
      <svg className="pm__input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      <select className="pm__select" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
        <option value="">Seleccione una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
        ))}
      </select>
    </div>
  </div>
)}

          <div className="pm__field">
            <label className="pm__label">Imagen URL <span className="pm__optional">(opcional)</span></label>
            <div className="pm__input-wrap">
              <svg className="pm__input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <input className="pm__input" type="text" value={imagen} onChange={(e) => setImagen(e.target.value)} placeholder="Ej: https://ejemplo.com/imagen.jpg" />
            </div>
           </div>

          <div className="pm__field">
            <label className="pm__label">Etiquetas <span className="pm__optional">(opcional)</span></label>
            <div className="pm__tags">
              {etiquetas.map((e) => (
                <button
                  key={e.id_etiqueta}
                  type="button"
                  className={`pm__tag ${selectedTags.includes(e.id_etiqueta) ? "pm__tag--selected" : ""}`}
                  style={selectedTags.includes(e.id_etiqueta) ? { borderColor: e.color_etiqueta, background: e.color_etiqueta + "18", color: e.color_etiqueta } : {}}
                  onClick={() => toggleTag(e.id_etiqueta)}
                >
                  {tagEmojis[e.nombre] || "🏷️"} {e.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="pm__actions">
            <button type="button" className="pm__btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="pm__btn-save">
              {data ? "Guardar producto" : "Crear producto"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}