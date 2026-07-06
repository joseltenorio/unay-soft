// frontend/src/pages/modules/EstablishmentPage/EstablishmentPage.jsx

import { useEffect, useMemo, useState } from "react"

import {
  getEstablishment,
  updateEstablishment,
  getMetodosPago,
  createMetodoPago,
  toggleMetodoPago,
  deleteMetodoPago
} from "../../../services/establishmentService"

{/*import logoUmari from "../../../assets/icons/logo-umari.svg"*/}

import useToast from "../../../components/common/Toast/useToast"

import "./EstablishmentPage.css"

const initialFormState = {
  nombre_comercial: "",
  razon_social: "",
  ruc: "",
  direccion: "",
  telefono: "",
  email: "",
  logo_url: "",
  igv_porcentaje: "18",
  moneda_codigo: "PEN",
  moneda_simbolo: "S/.",
}

function normalizeEstablishment(establishment) {
  return {
    nombre_comercial: establishment?.nombre_comercial || "",
    razon_social: establishment?.razon_social || "",
    ruc: establishment?.ruc || "",
    direccion: establishment?.direccion || "",
    telefono: establishment?.telefono || "",
    email: establishment?.email || "",
    logo_url: establishment?.logo_url || "",
    igv_porcentaje:
      establishment?.igv_porcentaje === undefined ||
      establishment?.igv_porcentaje === null
        ? "18"
        : String(establishment.igv_porcentaje),
    moneda_codigo: establishment?.moneda_codigo || "PEN",
    moneda_simbolo: establishment?.moneda_simbolo || "S/.",
  }
}

export default function EstablishmentPage() {
  const [formData, setFormData] = useState(initialFormState)
  const [originalData, setOriginalData] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [metodosPago, setMetodosPago]       = useState([])
  const [nuevoMetodo, setNuevoMetodo]       = useState("")
  const [isAddingMetodo, setIsAddingMetodo] = useState(false)
  const [metodoError, setMetodoError]       = useState("")

  const { showToast } = useToast()

  const hasChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(originalData),
    [formData, originalData],
  )

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const [establishment, metodos] = await Promise.all([
          getEstablishment(),
          getMetodosPago(),
        ])

        if (!isMounted) return

        setFormData(normalizeEstablishment(establishment))
        setOriginalData(normalizeEstablishment(establishment))
        setMetodosPago(metodos)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message || "No se pudo cargar la configuración.",
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => { isMounted = false }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setSuccessMessage("")
    setErrorMessage("")
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hasChanges || isSaving) {
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      const updatedEstablishment = await updateEstablishment({
        ...formData,
        igv_porcentaje: Number(formData.igv_porcentaje),
      })

      const normalizedData = normalizeEstablishment(updatedEstablishment)

      setFormData(normalizedData)
      setOriginalData(normalizedData)
      setSuccessMessage("")

      showToast({
        type: "success",
        title: "Configuración guardada",
        message: "Los datos del establecimiento se actualizaron correctamente.",
      })

    } catch (error) {
      const message =
        error.message || "No se pudo actualizar la configuración del establecimiento."

      setErrorMessage(message)

      showToast({
        type: "error",
        title: "No se pudo guardar",
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    setFormData(originalData)
    setErrorMessage("")
    setSuccessMessage("")
  }

  return (
    <section className="establishment-page">
      <header className="establishment-page__header">
        <div>
          <p className="establishment-page__eyebrow">Administración</p>
          <h1>Configuración del establecimiento</h1>
          <p>
            Gestiona los datos fiscales, parámetros de venta e identidad visual
            usados por Umarí OS.
          </p>
        </div>

        <div className="establishment-page__status-card">
          <span>Estado</span>
          <strong>{hasChanges ? "Cambios sin guardar" : "Actualizado"}</strong>
        </div>
      </header>

      {isLoading ? (
        <div className="establishment-page__feedback">
          Cargando configuración del establecimiento...
        </div>
      ) : (
        <form className="establishment-page__form" onSubmit={handleSubmit}>
          <section className="establishment-page__grid">
            <article className="establishment-page__panel">
              <div className="establishment-page__panel-header">
                <span>01</span>
                <div>
                  <h3>Datos fiscales</h3>
                  <p>Información legal y de contacto del establecimiento.</p>
                </div>
              </div>

              <div className="establishment-page__fields">
                <label>
                  <span>Nombre comercial</span>
                  <input
                    type="text"
                    name="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={handleChange}
                    placeholder="Umarí OS"
                    required
                  />
                </label>

                <label>
                  <span>Razón social</span>
                  <input
                    type="text"
                    name="razon_social"
                    value={formData.razon_social}
                    onChange={handleChange}
                    placeholder="Umarí Restaurante S.A.C."
                    required
                  />
                </label>

                <label>
                  <span>RUC</span>
                  <input
                    type="text"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    placeholder="20600000001"
                    maxLength="11"
                    required
                  />
                </label>

                <label>
                  <span>Dirección</span>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Av. Principal 123"
                    required
                  />
                </label>

                <label>
                  <span>Teléfono</span>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="987654321"
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@umari.pe"
                  />
                </label>
              </div>
            </article>

            <article className="establishment-page__panel">
              <div className="establishment-page__panel-header">
                <span>02</span>
                <div>
                  <h3>Parámetros de venta</h3>
                  <p>Valores usados por caja, comprobantes y reportes.</p>
                </div>
              </div>

              <div className="establishment-page__fields establishment-page__fields--compact">
                <label>
                  <span>IGV (%)</span>
                  <input
                    type="number"
                    name="igv_porcentaje"
                    value={formData.igv_porcentaje}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  <span>Código de moneda</span>
                  <input
                    type="text"
                    name="moneda_codigo"
                    value={formData.moneda_codigo}
                    onChange={handleChange}
                    placeholder="PEN"
                    maxLength="8"
                    required
                  />
                </label>

                <label>
                  <span>Símbolo de moneda</span>
                  <input
                    type="text"
                    name="moneda_simbolo"
                    value={formData.moneda_simbolo}
                    onChange={handleChange}
                    placeholder="S/."
                    maxLength="8"
                    required
                  />
                </label>
              </div>
            </article>

            <article className="establishment-page__panel establishment-page__panel--accent">
              <div className="establishment-page__panel-header">
                <span>03</span>
                <div>
                  <h3>Identidad visual</h3>
                  <p>Logo que podrá usarse en interfaz y tickets.</p>
                </div>
              </div>

              <div className="establishment-page__fields">
                <label className="establishment-page__field--full">
                  <span>URL del logo</span>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </label>

                <div className="establishment-page__logo-preview">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo del establecimiento" />
                  ) : (
                    <span>Sin logo</span>
                  )}
                </div>
              </div>
            </article>
          </section>

          {(errorMessage || successMessage) && (
            <div
              className={
                errorMessage
                  ? "establishment-page__message establishment-page__message--error"
                  : "establishment-page__message establishment-page__message--success"
              }
            >
              {errorMessage || successMessage}
            </div>
          )}

          <div className="establishment-page__actions">
            <button
              className="establishment-page__button establishment-page__button--secondary"
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              Descartar cambios
            </button>

            <button
              className="establishment-page__button establishment-page__button--primary"
              type="submit"
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}