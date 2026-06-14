import { useState } from "react"

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
   const [saving, setSaving] = useState(false)
 
   async function handleSubmit(e) {
     e.preventDefault()
     if (!form.nombre.trim()) return
     setSaving(true)
     await onSave(
       { ...form, capacidad: form.capacidad ? Number(form.capacidad) : null },
       data?.id_zona
     )
     setSaving(false)
   }
 
   return (
     <div className="salon-modal-overlay" onClick={onClose}>
       <div className="salon-modal" onClick={e => e.stopPropagation()}>
         <div className="salon-modal__header">
           <div>
             <h2 className="salon-modal__title">{data ? "Editar zona" : "Nueva zona"}</h2>
           </div>
           <button className="salon-modal__close" onClick={onClose}><IconX /></button>
         </div>
         <form className="salon-modal__form" onSubmit={handleSubmit}>
           <div className="salon-modal__field">
             <label>Nombre <span className="salon-modal__req">*</span></label>
             <input
               value={form.nombre}
               onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
               placeholder="ej. Terraza, Salón Principal"
               required
             />
           </div>
           <div className="salon-modal__field">
             <label>Descripción <span className="salon-modal__opt">opcional</span></label>
             <input
               value={form.descripcion}
               onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
               placeholder="ej. Zona exterior al aire libre"
             />
           </div>
           <div className="salon-modal__field">
             <label>Capacidad total <span className="salon-modal__opt">opcional</span></label>
             <input
               type="number" min="0"
               value={form.capacidad}
               onChange={e => setForm(p => ({ ...p, capacidad: e.target.value }))}
               placeholder="ej. 20"
             />
           </div>
           <div className="salon-modal__actions">
             <button type="button" className="salon-modal__btn-cancel" onClick={onClose}>Cancelar</button>
             <button type="submit" className="salon-modal__btn-save" disabled={saving}>
               {saving ? "Guardando…" : data ? "Guardar cambios" : "Crear zona"}
             </button>
           </div>
         </form>
       </div>
     </div>
   )
 }
 
 