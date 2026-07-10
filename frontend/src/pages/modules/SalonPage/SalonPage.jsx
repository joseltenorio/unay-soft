// frontend/src/pages/modules/SalonPage/SalonPage.jsx

import { useEffect, useState } from "react"
import {
  getZonas,
  getMesas,
  createZona,
  updateZona,
  toggleZonaStatus,
  deleteZona,
  createMesa,
  updateMesa,
  toggleMesaStatus,
  updateMesaDisponibilidad,
  deleteMesa,
} from "../../../services/salonService"
import RequirePermission from "../../../components/auth/RequirePermission"
import useToast from "../../../components/common/Toast/useToast"
import ZonaModal from "./components/ZonaModal"
import MesaModal from "./components/MesaModal"
import ConfirmModal from "./components/ConfirmModal"
import MesaDetailPanel from "./components/MesaDetailPanel"
import "./SalonPage.css"

const IconPlus = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const IconEdit = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconTrash = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)

const IconEye = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const IconDots = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

const IconGrid = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
)

const IconList = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const IconChair = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M2 9h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" />
    <path d="M6 13v6M18 13v6" />
  </svg>
)
const IconTotalMesas = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M2 9h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" />
    <path d="M6 13v6M18 13v6" />
  </svg>
)
const IconDisponible = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconOcupada = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
)
const IconReservada = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconFuera = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const DISP = {
  LIBRE: {
    label: "Disponible",
    color: "#16a34a",
    bg: "#dcfce7",
    dot: "#16a34a",
  },
  OCUPADA: {
    label: "Ocupada",
    color: "#dc2626",
    bg: "#fee2e2",
    dot: "#dc2626",
  },
  RESERVADA: {
    label: "Reservada",
    color: "#d97706",
    bg: "#fef3c7",
    dot: "#d97706",
  },
  MANTENIMIENTO: {
    label: "Fuera de servicio",
    color: "#6b7280",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  },
}

function MesaCard({ mesa, zona, onSelect, selected }) {
  const disp = DISP[mesa.disponibilidad] || DISP.LIBRE
  const esBarra = zona?.nombre?.toLowerCase().includes("barra")
  const label = esBarra ? "Asiento" : "Mesa"
  return (
     <button
      className={`salon-mesa-card ${selected ? "salon-mesa-card--selected" : ""}`}
      style={{ "--disp-bg": disp.bg, "--disp-color": disp.color }}
      onClick={() => onSelect(mesa)}
      title={`${label} ${mesa.numero}${mesa.nombre ? ` · ${mesa.nombre}` : ""}`}
    >
      <span className="salon-mesa-card__code">
        {mesa.nombre || `${esBarra ? "A" : "M"}${mesa.numero}`}
      </span>
      <span className="salon-mesa-card__cap">
        <IconChair /> {mesa.capacidad}
      </span>
    </button>
  )
}

export default function SalonPage() {
  const { showToast } = useToast()

  const [zonas, setZonas] = useState([])
  const [mesas, setMesas] = useState([])
  const [loading, setLoading] = useState(true)

  const [zonaActiva, setZonaActiva] = useState(null)
  const [vista, setVista] = useState("plano")
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)

  const [zonaModal, setZonaModal] = useState({ open: false, data: null })
  const [mesaModal, setMesaModal] = useState({
    open: false,
    data: null,
    defaultZonaId: null,
  })
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    mensaje: "",
    onConfirm: null,
  })

  const [zonaMenuOpen, setZonaMenuOpen] = useState(null)

  useEffect(() => {
    function handleClick(event) {
      if (!event.target.closest(".salon__zona-menu-wrap")) {
        setZonaMenuOpen(null)
      }
    }

    document.addEventListener("mousedown", handleClick)

    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [])

  useEffect(() => {
    setMesaSeleccionada(null)
  }, [zonaActiva])  

  useEffect(() => {
    let cancelled = false

    Promise.all([getZonas(), getMesas()])
      .then(([zs, ms]) => {
        if (cancelled) return

        setZonas(zs)
        setMesas(ms)

        if (zs.length > 0) {
          setZonaActiva(zs[0].id_zona)
        }
      })
      .catch((err) => {
        if (cancelled) return

        showToast({
          type: "error",
          title: "Error al cargar",
          message: err.message,
        })
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [showToast])

  const mesasActivas = mesas.filter((mesa) => mesa.estado)

  const total = mesasActivas.length
  const disponibles = mesasActivas.filter(
    (mesa) => mesa.disponibilidad === "LIBRE",
  ).length
  const ocupadas = mesasActivas.filter(
    (mesa) => mesa.disponibilidad === "OCUPADA",
  ).length
  const reservadas = mesasActivas.filter(
    (mesa) => mesa.disponibilidad === "RESERVADA",
  ).length
  const fuera = mesasActivas.filter(
    (mesa) => mesa.disponibilidad === "MANTENIMIENTO",
  ).length

  const mesasDeZona = zonaActiva
    ? mesas.filter((mesa) => mesa.id_zona === zonaActiva && mesa.estado)
    : mesas.filter((mesa) => mesa.estado)

  const zonaActivaData = zonas.find((zona) => zona.id_zona === zonaActiva)

  const totalZona = mesasDeZona.length
  const libresZona = mesasDeZona.filter(m => m.disponibilidad === "LIBRE").length
  const ocupadasZona = mesasDeZona.filter(m => m.disponibilidad === "OCUPADA").length
  const reservadasZona = mesasDeZona.filter(m => m.disponibilidad === "RESERVADA").length
  const fueraZona = mesasDeZona.filter(m => m.disponibilidad === "MANTENIMIENTO").length
  const pctDisponibleZona = totalZona > 0 ? Math.round((libresZona / totalZona) * 100) : 0
  const esBarraActiva = zonaActivaData?.nombre?.toLowerCase().includes("barra")

  async function handleSaveZona(payload, id) {
    try {
      if (id) {
        const updated = await updateZona(id, payload)

        setZonas((prev) =>
          prev.map((zona) => (zona.id_zona === id ? updated : zona)),
        )

        showToast({
          type: "success",
          title: "Zona actualizada",
          message: "Los cambios se guardaron correctamente.",
        })
      } else {
        const nueva = await createZona(payload)

        setZonas((prev) => [...prev, nueva])

        showToast({
          type: "success",
          title: "Zona creada",
          message: "La zona fue agregada correctamente.",
        })
      }

      setZonaModal({ open: false, data: null })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleToggleZona(zona) {
    try {
      const updated = await toggleZonaStatus(zona.id_zona, !zona.estado)

      setZonas((prev) =>
        prev.map((item) => (item.id_zona === zona.id_zona ? updated : item)),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Zona activada" : "Zona desactivada",
        message: updated.estado
          ? "La zona vuelve a estar activa."
          : "La zona fue desactivada correctamente.",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  function handleDeleteZona(zona) {
    setConfirmModal({
      open: true,
      mensaje: `¿Seguro que deseas eliminar la zona "${zona.nombre}"? Las mesas asociadas quedarán sin zona.`,
      onConfirm: async () => {
        try {
          await deleteZona(zona.id_zona)

          setZonas((prev) =>
            prev.filter((item) => item.id_zona !== zona.id_zona),
          )

          if (zonaActiva === zona.id_zona) {
            setZonaActiva(null)
          }

          showToast({
            type: "success",
            title: "Zona eliminada",
            message: "La zona fue eliminada correctamente.",
          })
        } catch (err) {
          showToast({
            type: "error",
            title: "Error",
            message: err.message,
          })
        } finally {
          setConfirmModal({
            open: false,
            mensaje: "",
            onConfirm: null,
          })
        }
      },
    })
  }

  async function handleSaveMesa(payload, id) {
    try {
      if (id) {
        const updated = await updateMesa(id, payload)

        setMesas((prev) =>
          prev.map((mesa) =>
            mesa.id_mesa === id ? { ...mesa, ...updated } : mesa,
          ),
        )

        if (mesaSeleccionada?.id_mesa === id) {
          setMesaSeleccionada((prev) => ({ ...prev, ...updated }))
        }

        showToast({
          type: "success",
          title: "Mesa actualizada",
          message: "Los cambios se guardaron correctamente.",
        })
      } else {
        const nueva = await createMesa(payload)

        setMesas((prev) => [...prev, nueva])

        showToast({
          type: "success",
          title: "Mesa creada",
          message: "La mesa fue agregada correctamente.",
        })
      }

      setMesaModal({
        open: false,
        data: null,
        defaultZonaId: null,
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleChangeDispo(mesa, disponibilidad) {
    try {
      const updated = await updateMesaDisponibilidad(
        mesa.id_mesa,
        disponibilidad,
      )

      setMesas((prev) =>
        prev.map((item) =>
          item.id_mesa === mesa.id_mesa ? { ...item, ...updated } : item,
        ),
      )

      if (mesaSeleccionada?.id_mesa === mesa.id_mesa) {
        setMesaSeleccionada((prev) => ({ ...prev, ...updated }))
      }

      showToast({
        type: "success",
        title: "Estado actualizado",
        message: `Mesa marcada como ${DISP[disponibilidad].label}.`,
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  async function handleToggleMesaStatus(mesa) {
    try {
      const updated = await toggleMesaStatus(mesa.id_mesa, !mesa.estado)

      setMesas((prev) =>
        prev.map((item) =>
          item.id_mesa === mesa.id_mesa ? { ...item, ...updated } : item,
        ),
      )

      showToast({
        type: "success",
        title: updated.estado ? "Mesa activada" : "Mesa desactivada",
        message: "",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      })
    }
  }

  function handleDeleteMesa(mesa) {
    setConfirmModal({
      open: true,
      mensaje: `¿Seguro que deseas eliminar la mesa "${
        mesa.nombre || mesa.numero
      }"?`,
      onConfirm: async () => {
        try {
          await deleteMesa(mesa.id_mesa)

          setMesas((prev) =>
            prev.filter((item) => item.id_mesa !== mesa.id_mesa),
          )

          if (mesaSeleccionada?.id_mesa === mesa.id_mesa) {
            setMesaSeleccionada(null)
          }

          showToast({
            type: "success",
            title: "Mesa eliminada",
            message: "La mesa fue eliminada correctamente.",
          })
        } catch (err) {
          showToast({
            type: "error",
            title: "Error",
            message: err.message,
          })
        } finally {
          setConfirmModal({
            open: false,
            mensaje: "",
            onConfirm: null,
          })
        }
      },
    })
  }

  return (
    <div className="salon">
      <div className="salon__header">
        <div>
          <span className="salon__breadcrumb">SALÓN</span>
          <h1 className="salon__title">Mesas por Zonas</h1>
          <p className="salon__sub">
            Organiza las zonas y mesas de tu establecimiento.
          </p>
        </div>

        <div className="salon__header-actions">
          <RequirePermission permission="salon.gestionar">
            <button
              className="salon__btn salon__btn--secondary"
              onClick={() => setZonaModal({ open: true, data: null })}
            >
              <IconPlus /> Nueva zona
            </button>
          </RequirePermission>

          <RequirePermission permission="salon.gestionar">
            <button
              className="salon__btn salon__btn--primary"
              onClick={() =>
                setMesaModal({
                  open: true,
                  data: null,
                  defaultZonaId: zonaActiva,
                })
              }
            >
              <IconPlus /> Nueva mesa
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className="salon__stats">
        {[
          { label: "Total mesas", value: total, color: "#0b3ba5", icon: <IconTotalMesas /> },
          { label: "Disponibles", value: disponibles, color: "#16a34a", icon: <IconDisponible /> },
          { label: "Ocupadas", value: ocupadas, color: "#dc2626", icon: <IconOcupada /> },
          { label: "Reservadas", value: reservadas, color: "#d97706", icon: <IconReservada /> },
          { label: "Fuera de servicio", value: fuera, color: "#6b7280", icon: <IconFuera /> },
        ].map((stat) => (
          <div key={stat.label} className="salon__stat">
            <span
              className="salon__stat-icon"
              style={{ color: stat.color, background: `${stat.color}1a` }}
            >
              {stat.icon}
            </span>
            <div className="salon__stat-text">
              <span className="salon__stat-value">
                {stat.value}
              </span>
              <span className="salon__stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="salon__body">
        <aside className="salon__sidebar">
          <div className="salon__sidebar-hdr">
            <span>Zonas del salón</span>
          </div>

          {loading ? (
            [1, 2, 3].map((item) => (
              <div key={item} className="salon__zona-skeleton" />
            ))
          ) : zonas.length === 0 ? (
            <p className="salon__sidebar-empty">No hay zonas aún.</p>
          ) : (
            zonas.map((zona) => (
              <div
                key={zona.id_zona}
                className={`salon__zona-item ${
                  zonaActiva === zona.id_zona ? "salon__zona-item--active" : ""
                } ${!zona.estado ? "salon__zona-item--inactive" : ""}`}
                onClick={() => setZonaActiva(zona.id_zona)}
              >
                <div className="salon__zona-icon">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>

                <div className="salon__zona-info">
                  <span className="salon__zona-name">{zona.nombre}</span>
                  <span className="salon__zona-count">
                    {
                      mesas.filter(
                        (mesa) =>
                          mesa.id_zona === zona.id_zona && mesa.estado,
                      ).length
                    }{" "}
                    {zona.nombre?.toLowerCase().includes("barra") ? "asientos" : "mesas"}
                  </span>
                </div>

                <RequirePermission permission="salon.gestionar">
                  <div
                    className="salon__zona-menu-wrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="salon__zona-dots"
                      onClick={() =>
                        setZonaMenuOpen(
                          zonaMenuOpen === zona.id_zona ? null : zona.id_zona,
                        )
                      }
                    >
                      <IconDots />
                    </button>

                    {zonaMenuOpen === zona.id_zona && (
                      <div className="salon__dropdown">
                        {zona.estado ? (
                          <>
                            <button
                              onClick={() => {
                                setZonaModal({ open: true, data: zona })
                                setZonaMenuOpen(null)
                              }}
                            >
                              <IconEdit /> Editar
                            </button>

                            <button
                              onClick={() => {
                                handleToggleZona(zona)
                                setZonaMenuOpen(null)
                              }}
                            >
                              <IconEyeOff /> Desactivar
                            </button>

                            <button
                              className="salon__dropdown-danger"
                              onClick={() => {
                                handleDeleteZona(zona)
                                setZonaMenuOpen(null)
                              }}
                            >
                              <IconTrash /> Eliminar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              handleToggleZona(zona)
                              setZonaMenuOpen(null)
                            }}
                          >
                            <IconEye /> Activar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </RequirePermission>
              </div>
            ))
          )}
          {!loading && zonaActivaData && totalZona > 0 && (
            <div className="salon__zone-summary">
              <div className="salon__zone-summary-hdr">
                <strong>Resumen</strong>
              </div>

              <div className="salon__zone-summary-badges">
                <span className="salon__zone-badge" style={{ background: DISP.LIBRE.bg, color: DISP.LIBRE.color }}>
                  {libresZona}
                </span>
                <span className="salon__zone-badge" style={{ background: DISP.OCUPADA.bg, color: DISP.OCUPADA.color }}>
                  {ocupadasZona}
                </span>
                <span className="salon__zone-badge" style={{ background: DISP.RESERVADA.bg, color: DISP.RESERVADA.color }}>
                  {reservadasZona}
                </span>
                <span className="salon__zone-badge" style={{ background: DISP.MANTENIMIENTO.bg, color: DISP.MANTENIMIENTO.color }}>
                  {fueraZona}
                </span>
              </div>

              <div className="salon__zone-summary-bar">
                {libresZona > 0 && <span style={{ width: `${(libresZona/totalZona)*100}%`, background: DISP.LIBRE.dot }} />}
                {ocupadasZona > 0 && <span style={{ width: `${(ocupadasZona/totalZona)*100}%`, background: DISP.OCUPADA.dot }} />}
                {reservadasZona > 0 && <span style={{ width: `${(reservadasZona/totalZona)*100}%`, background: DISP.RESERVADA.dot }} />}
                {fueraZona > 0 && <span style={{ width: `${(fueraZona/totalZona)*100}%`, background: DISP.MANTENIMIENTO.dot }} />}
              </div>

              <p className="salon__zone-summary-pct">{pctDisponibleZona}% disponibles</p>
            </div>
          )}
        </aside>

        <div className="salon__content">
          <div className="salon__zone-hdr">
            <div>
              <h2 className="salon__zone-title">
                {zonaActivaData ? zonaActivaData.nombre : "Todas las zonas"}
              </h2>

              {zonaActivaData?.descripcion && (
                <p className="salon__zone-desc">
                  {zonaActivaData.descripcion}
                </p>
              )}
            </div>

            <div className="salon__vista-toggle">
              <button
                className={`salon__vista-btn ${
                  vista === "plano" ? "salon__vista-btn--active" : ""
                }`}
                onClick={() => setVista("plano")}
              >
                <IconGrid /> Plano
              </button>

              <button
                className={`salon__vista-btn ${
                  vista === "lista" ? "salon__vista-btn--active" : ""
                }`}
                onClick={() => setVista("lista")}
              >
                <IconList /> Lista
              </button>
            </div>
          </div>

          {vista === "plano" && (
            <div className="salon__plano">
              {loading ? (
                <div className="salon__plano-grid">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="salon__mesa-skeleton" />
                  ))}
                </div>
              ) : mesasDeZona.length === 0 ? (
                <div className="salon__empty">
                  <p>No hay mesas en esta zona.</p>

                  <RequirePermission permission="salon.gestionar">
                    <button
                      className="salon__btn salon__btn--primary"
                      onClick={() =>
                        setMesaModal({
                          open: true,
                          data: null,
                          defaultZonaId: zonaActiva,
                        })
                      }
                    >
                      <IconPlus /> Agregar mesa
                    </button>
                  </RequirePermission>
                </div>
              ) : (
                <div className="salon__plano-grid">
                  {mesasDeZona.map((mesa) => (
                    <MesaCard
                      key={mesa.id_mesa}
                      mesa={mesa}
                      zona={zonaActivaData}
                      selected={mesaSeleccionada?.id_mesa === mesa.id_mesa}
                      onSelect={setMesaSeleccionada}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {vista === "lista" && (
            <div className="salon__lista">
              {loading ? (
                <p>Cargando…</p>
              ) : mesasDeZona.length === 0 ? (
                <div className="salon__empty">
                  <p>No hay mesas en esta zona.</p>
                </div>
              ) : (
                <table className="salon__table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Capacidad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mesasDeZona.map((mesa) => {
                      const disp = DISP[mesa.disponibilidad] || DISP.LIBRE
                      const esBarra = zonaActivaData?.nombre?.toLowerCase().includes("barra")
                      const label = esBarra ? "A" : "M"
                      return (
                        <tr
                          key={mesa.id_mesa}
                          onClick={() => setMesaSeleccionada(mesa)}
                          className={
                            mesaSeleccionada?.id_mesa === mesa.id_mesa
                              ? "salon__table-row--active"
                              : ""
                          }
                        >
                          <td>
                            <strong>{mesa.nombre || `${label}${mesa.numero}`}</strong>
                          </td>
                          <td>{mesa.capacidad}</td>
                          <td>
                            <span
                              className="salon__table-badge"
                              style={{
                                background: disp.bg,
                                color: disp.color,
                              }}
                            >
                              {disp.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {mesaSeleccionada && (
          <MesaDetailPanel
            mesa={mesaSeleccionada}
            zona={zonas.find(
              (zona) => zona.id_zona === mesaSeleccionada.id_zona,
            )}
            onEdit={() =>
              setMesaModal({
                open: true,
                data: mesaSeleccionada,
                defaultZonaId: null,
              })
            }
            onChangeDispo={(key) => handleChangeDispo(mesaSeleccionada, key)}
            onToggleStatus={() => handleToggleMesaStatus(mesaSeleccionada)}
            onDelete={() => handleDeleteMesa(mesaSeleccionada)}
            onClose={() => setMesaSeleccionada(null)}
          />
        )}
      </div>

      {zonaModal.open && (
        <ZonaModal
          data={zonaModal.data}
          onSave={handleSaveZona}
          onClose={() => setZonaModal({ open: false, data: null })}
        />
      )}

      {mesaModal.open && (
        <MesaModal
          data={mesaModal.data}
          zonas={zonas}
          defaultZonaId={mesaModal.defaultZonaId}
          mesasExistentes={mesas} 
          onSave={handleSaveMesa}
          onClose={() =>
            setMesaModal({
              open: false,
              data: null,
              defaultZonaId: null,
            })
          }
        />
      )}

      {confirmModal.open && (
        <ConfirmModal
          mensaje={confirmModal.mensaje}
          onConfirm={confirmModal.onConfirm}
          onClose={() =>
            setConfirmModal({
              open: false,
              mensaje: "",
              onConfirm: null,
            })
          }
        />
      )}
    </div>
  )
}
