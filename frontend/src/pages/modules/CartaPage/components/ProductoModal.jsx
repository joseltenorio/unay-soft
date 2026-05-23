import { useState, useEffect } from "react"
import { getEtiquetas } from "../../../../services/cartaService"

export default function ProductoModal({
  data,
  categorias,
  onSave,
  onClose,
}) {
  const [nombre, setNombre] = useState(data?.nombre || "")
  const [descripcion, setDescripcion] = useState(data?.descripcion || "")
  const [precio, setPrecio] = useState(data?.precio_base || "")
  const [categoria, setCategoria] = useState(
    data?.id_categoria || ""
  )
  const [imagen, setImagen] = useState(
    data?.imagen_referencial || ""
  )
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
      {
        nombre,
        descripcion,
        precio_base: Number(precio),
        id_categoria: categoria,
        imagen_referencial: imagen,
        tag_ids: selectedTags,
      },
      data?.id_producto
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {data ? "Editar producto" : "Nuevo producto"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div>
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label>Precio</label>
            <input
              type="number"
              step="0.1"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Categoría</label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              <option value="">
                Seleccione
              </option>

              {categorias.map((cat) => (
                <option
                  key={cat.id_categoria}
                  value={cat.id_categoria}
                >
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Imagen URL</label>

            <input
              type="text"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
          </div>
          <div>
            <label>Etiquetas</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {etiquetas.map((e) => (
                <button
                  key={e.id_etiqueta}
                  type="button"
                  onClick={() => toggleTag(e.id_etiqueta)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid #ccc",
                    background: selectedTags.includes(e.id_etiqueta) ? e.color_etiqueta : "#f5f5f5",
                    color: selectedTags.includes(e.id_etiqueta) ? "white" : "#333",
                    cursor: "pointer",
                  }}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button type="submit">
              Guardar
            </button>

            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}