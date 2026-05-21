import { useState } from "react"

export default function CategoriaModal({ data, onSave, onClose }) {
  const [nombre, setNombre] = useState(data?.nombre || "")
  const [descripcion, setDescripcion] = useState(data?.descripcion || "")

  async function handleSubmit(e) {
    e.preventDefault()

    await onSave(
      {
        nombre,
        descripcion,
      },
      data?.id_categoria
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {data ? "Editar Categoría" : "Nueva Categoría"}
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