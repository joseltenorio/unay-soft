// src/pages/modules/PosPage/components/PosPageTables.jsx

import "./PosPageTables.css"

export default function PosPageTables({
  tables,
  onTableClick,
  floors,
  selectedFloor,
  setSelectedFloor,
}) {
  return (
    <section className="pos-tables">
      <header className="pos-tables-header">
        <div className="pos-floor-tabs">
          {floors.map((floor) => (
            <button
              key={floor}
              type="button"
              className={
                selectedFloor === floor
                  ? "pos-floor-button pos-floor-button--active"
                  : "pos-floor-button"
              }
              onClick={() => setSelectedFloor(floor)}
            >
              {floor}
            </button>
          ))}
        </div>
      </header>

      <div className="pos-tables-grid">
        {tables.map((table) => {
          const tableService = table.table_service || {}
          const responsibleName =
            tableService.responsible_user_name || table.waiter
          const activeTotal = Number(table.active_total || 0).toFixed(2)

          return (
            <button
              key={table.id}
              type="button"
              className={
                table.occupied
                  ? "pos-table pos-table--occupied"
                  : "pos-table"
              }
              onClick={() => onTableClick(table)}
            >
              <div className="pos-table-circle">
                {table.number}
              </div>

              <div className="pos-table-info">
                {table.occupied ? (
                  <>
                    <span className="pos-table-waiter">
                      {responsibleName
                        ? `Atiende: ${responsibleName}`
                        : "Cuenta abierta"}
                    </span>

                    <small className="pos-table-time">
                      {table.time}
                    </small>

                    <small className="pos-table-total">
                      S/ {activeTotal}
                    </small>
                  </>
                ) : (
                  <small className="pos-table-free">
                    Disponible
                  </small>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}