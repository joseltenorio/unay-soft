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

      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}

      <header className="pos-tables-header">

        <div>

          <p className="pos-tables-subtitle">
            POS / Salón
          </p>


          {/* ======================================== */}
          {/* PISOS DINAMICOS */}
          {/* ======================================== */}

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

        </div>

      </header>


      {/* ======================================== */}
      {/* GRID */}
      {/* ======================================== */}

      <div className="pos-tables-grid">

        {tables.map((table) => (

          <button
            key={table.id}

            className={
              table.occupied
                ? "pos-table pos-table--occupied"
                : "pos-table"
            }

            onClick={() => onTableClick(table)}
          >

            {/* ======================================== */}
            {/* CIRCULO */}
            {/* ======================================== */}

            <div className="pos-table-circle">

              {table.number}

            </div>



            {/* ======================================== */}
            {/* INFORMACION */}
            {/* ======================================== */}

            <div className="pos-table-info">

              {table.occupied ? (
                <>

                  <span className="pos-table-waiter">

                    {table.waiter}

                  </span>

                  <small className="pos-table-time">

                    {table.time}

                  </small>

                </>
              ) : (

                <small className="pos-table-free">

                  Disponible

                </small>

              )}

            </div>

          </button>

        ))}

      </div>

    </section>
  )
}