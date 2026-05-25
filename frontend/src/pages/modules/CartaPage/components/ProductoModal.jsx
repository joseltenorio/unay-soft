// src/pages/modules/CartaPage/components/ProductoModal.jsx

import { useState, useEffect } from "react"

const tagEmojis = {
  "Más vendido": "⭐",
  "Nuevo": "🔵",
  "Picante": "🌶️",
  "Recomendado": "👍",
}

export default function ProductoModal({ data, categorias, etiquetas, defaultCategoryId, onSave, onClose }) {
  const [nombre, setNombre] = useState(data?.nombre || "")
  const [descripcion, setDescripcion] = useState(data?.descripcion || "")
  const [precio, setPrecio] = useState(data?.precio_base || "")
  const [categoria, setCategoria] = useState(data?.id_categoria ||  defaultCategoryId || "")
  const [imagen, setImagen] = useState(data?.imagen_referencial || "")
  const [selectedTags, setSelectedTags] = useState(
    data?.etiquetas?.map((e) => e.id_etiqueta) || []
  )
  const [disponibilidad, setDisponibilidad] = useState(data?.disponibilidad ?? true)
  const [isUploadingImagen, setIsUploadingImagen] = useState(false)
  const [saving, setSaving] = useState(false)

console.log("imagen_referencial:", data?.imagen_referencial)
  function toggleTag(id) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
     if (saving) return
 setSaving(true)
  try {
    await onSave(
      { nombre, descripcion, precio_base: Number(precio), id_categoria: categoria, imagen_referencial: imagen, tag_ids: selectedTags, disponibilidad },
      data?.id_producto
    )
  } finally {
    setSaving(false)
  }
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
              <input className="pm__input" type="number" step="0.1" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: 12.90" required />
            </div>
          </div>
          
          <div className="pm__field">
            <label className="pm__label">Disponibilidad</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={disponibilidad}
                onChange={(e) => setDisponibilidad(e.target.checked)}
              />
              Producto disponible para pedidos
            </label>
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
        <label className="pm__label">Imagen <span className="pm__optional">(opcional)</span></label>

        {imagen && (
          <div style={{ position: "relative", marginBottom: 8 }}>
            <img
              src={imagen}
              alt="Preview"
              onError={(e) => { e.target.style.display = "none" }}
              style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8 }}
            />
            <button
              type="button"
              onClick={() => setImagen("")}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.6)",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ✕ Quitar imagen
            </button>
          </div>
        )}

        {data?.id_producto ? (
          <>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1.5px solid #cbd5e1",
                background: "#f8fafc",
                color: "#475569",
                fontSize: 14,
                fontWeight: 500,
                cursor: isUploadingImagen ? "not-allowed" : "pointer",
                opacity: isUploadingImagen ? 0.6 : 1,
                marginTop: 6,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {isUploadingImagen ? "Subiendo..." : "Subir imagen (.jpg, .png)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingImagen}
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  setIsUploadingImagen(true)
                  try {
                    const formDataUpload = new FormData()
                    formDataUpload.append("imagen", file)
                    const storage = localStorage.getItem("umari_token") ? localStorage : sessionStorage
                    const token = storage.getItem("umari_token")
                    const res = await fetch(
                      `http://localhost:3000/api/productos/${data.id_producto}/imagen`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formDataUpload,
                      }
                    )
                    const result = await res.json()
                    if (!res.ok) throw new Error(result.message)
                    setImagen(result.producto.imagen_referencial)
                  } catch (err) {
                    alert("Error al subir imagen: " + err.message)
                  } finally {
                    setIsUploadingImagen(false)
                  }
                }}
              />
            </label>
            {isUploadingImagen && (
              <p style={{ fontSize: 13, marginTop: 4, color: "#64748b" }}>Subiendo imagen...</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: "#888" }}>
            Podrás subir la imagen después de crear el producto.
          </p>
        )}
      </div>
          <div className="pm__actions">
            <button type="button" className="pm__btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="pm__btn-save" disabled={saving}>
          {saving ? "Guardando..." : data ? "Guardar producto" : "Crear producto"}
        </button>
        </div>

        </form>
      </div>
    </div>
  )
}