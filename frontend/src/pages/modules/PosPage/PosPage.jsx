// src/pages/modules/PosPage/PosPage.jsx

import { useState } from "react"

import PosPageTables from "./components/PosPageTables"
import PosPageMenu from "./components/PosPageMenu"


// MESERO ACTUAL
const currentWaiter = "Lucía"


// ========================================
// MESAS
// ========================================

const initialTables = [
  {
    id: 1,
    number: 1,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 2,
    number: 2,
    floor: "Piso 1",
    occupied: true,
    waiter: "Ana",
    time: "12 min",
  },

  {
    id: 3,
    number: 3,
    floor: "Piso 1",
    occupied: true,
    waiter: "Ale",
    time: "25 min",
  },

  {
    id: 4,
    number: 4,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 5,
    number: 5,
    floor: "Piso 1",
    occupied: true,
    waiter: "Lucía",
    time: "8 min",
  },

  {
    id: 6,
    number: 6,
    floor: "Piso 1",
    occupied: false,
    waiter: null,
    time: null,
  },

  {
    id: 7,
    number: 7,
    floor: "Terraza",
    occupied: true,
    waiter: "Lucía",
    time: "16 min",
  },

  {
    id: 8,
    number: 8,
    floor: "Terraza",
    occupied: false,
    waiter: null,
    time: null,
  },
]


// ========================================
// PRODUCTOS
// ========================================

const products = [
  {
    id: 1,
    category: "Fondos",
    name: "Lomo Saltado",
    price: 32,
    emoji: "🥩",
  },

  {
    id: 2,
    category: "Fondos",
    name: "Ají de Gallina",
    price: 28,
    emoji: "🍛",
  },

  {
    id: 3,
    category: "Fondos",
    name: "Arroz Chaufa",
    price: 26,
    emoji: "🍚",
  },

  {
    id: 4,
    category: "Bebidas",
    name: "Chicha Morada",
    price: 8,
    emoji: "🥤",
  },

  {
    id: 5,
    category: "Bebidas",
    name: "Inka Cola",
    price: 7,
    emoji: "🧃",
  },

  {
    id: 6,
    category: "Bebidas",
    name: "Maracuyá Frozen",
    price: 12,
    emoji: "🍹",
  },

  {
    id: 7,
    category: "Postres",
    name: "Cheesecake",
    price: 14,
    emoji: "🍰",
  },

  {
    id: 8,
    category: "Postres",
    name: "Brownie",
    price: 12,
    emoji: "🍫",
  },

  {
    id: 9,
    category: "Postres",
    name: "Tiramisú",
    price: 16,
    emoji: "🍮",
  },
]


// ========================================
// CATEGORIAS
// ========================================

const categories = [
  "Todos",
  "Fondos",
  "Bebidas",
  "Postres",
]


export default function PosPage() {

  // ========================================
  // STATES
  // ========================================

  const [selectedTable, setSelectedTable] =
    useState(null)

  const [selectedCategory, setSelectedCategory] =
    useState("Todos")

  const [searchTerm, setSearchTerm] =
    useState("")

  // MESAS DINAMICAS
  const [tablesState, setTablesState] =
    useState(initialTables)
  // ========================================
  // PEDIDOS POR MESA
  // ========================================

  const [tableOrders, setTableOrders] =
    useState({})

  // ========================================
  // PEDIDOS ENVIADOS A COCINA
  // ========================================

  const [savedOrders, setSavedOrders] =
    useState({})

  // ========================================
  // PEDIDO ACTUAL
  // ========================================

  const orderItems =
    selectedTable
      ? tableOrders[selectedTable.id] || []
      : []
  // NOTAS POR MESA
  const [orderNotes, setOrderNotes] =
    useState({})

  // ========================================
  // CLICK EN MESA
  // ========================================

  function handleTableClick(table) {

    // ========================================
    // VALIDAR MESERO
    // ========================================

    if (
      table.occupied &&
      table.waiter !== currentWaiter
    ) {

      alert(
        `No puedes entrar a la mesa ${table.number} porque la atiende ${table.waiter}`,
      )

      return
    }

    setSelectedTable(table)

    // ========================================
    // CARGAR SOLO SI YA SE ENVIO A COCINA
    // ========================================

    if (savedOrders[table.id]) {

      setTableOrders((prev) => ({

        ...prev,

        [table.id]: savedOrders[table.id],
      }))
    }

    console.log(
      `Entrando a la mesa ${table.number}`,
    )
  }


  // ========================================
  // AGREGAR PRODUCTO
  // ========================================

  function handleAddProduct(product, quantityToAdd) {

    if (!selectedTable) {
      return
    }

    if (quantityToAdd < 1) {
      return
    }

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const existingProduct =
      currentOrder.find(
        (item) => item.id === product.id,
      )

    let updatedItems = []

    // ========================================
    // SI YA EXISTE
    // ========================================

    if (existingProduct) {

      updatedItems =
        currentOrder.map((item) =>

          item.id === product.id
            ? {
                ...item,

                quantity:
                  item.quantity + quantityToAdd,
              }
            : item,
        )

    } else {

      // ========================================
      // NUEVO PRODUCTO
      // ========================================

      updatedItems = [

        ...currentOrder,

        {
          ...product,

          quantity: quantityToAdd,

          // ========================================
          // CUANTO SE ENVIO A COCINA
          // ========================================

          sentQuantity: 0,

          // ========================================
          // SI COCINA YA TERMINO
          // ========================================

          kitchenReady: false,
        },
      ]
    }

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }


  // ========================================
  // AUMENTAR
  // ========================================

  function handleIncreaseQuantity(productId) {

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const updatedItems =
      currentOrder.map((item) =>

        item.id === productId
          ? {
              ...item,

              quantity: item.quantity + 1,
            }
          : item,
      )

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }


  // ========================================
  // DISMINUIR
  // ========================================

  function handleDecreaseQuantity(productId) {

    const currentOrder =
      tableOrders[selectedTable.id] || []

    const updatedItems = currentOrder

      .map((item) => {

        // ========================================
        // PRODUCTO DIFERENTE
        // ========================================

        if (item.id !== productId) {
          return item
        }

        // ========================================
        // CANTIDAD PENDIENTE
        // ========================================

        const pendingQuantity =
          item.quantity - item.sentQuantity

        // ========================================
        // SI HAY PRODUCTOS PENDIENTES
        // ELIMINAR NORMAL
        // ========================================

        if (pendingQuantity > 0) {

          return {

            ...item,

            quantity: item.quantity - 1,
          }
        }

        // ========================================
        // SI TODO YA FUE ENVIADO
        // ========================================

        if (item.sentQuantity > 0) {

          // ========================================
          // SI COCINA YA TERMINÓ
          // ========================================

          if (item.kitchenReady) {

            alert(
              `${item.name} ya fue preparado por cocina`,
            )

            return item
          }

          // ========================================
          // CONFIRMAR CANCELACIÓN
          // ========================================

          const confirmCancel = window.confirm(
            `¿Deseas cancelar 1 ${item.name} enviado a cocina?`,
          )

          if (!confirmCancel) {
            return item
          }

          // ========================================
          // DISMINUIR TODO
          // ========================================

          return {

            ...item,

            quantity: item.quantity - 1,

            sentQuantity:
              item.sentQuantity - 1,
          }
        }

        // ========================================
        // PRODUCTO NORMAL
        // ========================================

        return {

          ...item,

          quantity: item.quantity - 1,
        }
      })

      .filter((item) => item.quantity > 0)

    // ========================================
    // ACTUALIZAR MESA
    // ========================================

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))

    // ========================================
    // ACTUALIZAR PEDIDOS GUARDADOS
    // ========================================

    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))
  }

  // ========================================
  // ENVIAR A COCINA
  // ========================================

  function handleSendToKitchen() {

    // ========================================
    // VALIDAR
    // ========================================

    if (orderItems.length === 0) {

      alert("No hay productos para enviar")

      return
    }

    // ========================================
    // SOLO PRODUCTOS NUEVOS
    // ========================================

    const newItems = orderItems

      .map((item) => {

        const quantityToSend =
          item.quantity - item.sentQuantity

        if (quantityToSend <= 0) {
          return null
        }

        return {

          ...item,

          quantity: quantityToSend,
        }
      })

      .filter(Boolean)


    // ========================================
    // SI YA TODO FUE ENVIADO
    // ========================================

    if (newItems.length === 0) {

      alert(
        "El pedido ya se envió a cocina",
      )

      return
    }

    // MARCAR MESA COMO OCUPADA
    setTablesState((prev) =>

      prev.map((table) =>

        table.id === selectedTable.id
          ? {

              ...table,

              occupied: true,

              waiter: currentWaiter,

              time: "Ahora",
            }
          : table,
      ),
    )

    setSelectedTable((prev) => ({

      ...prev,

      occupied: true,

      waiter: currentWaiter,

      time: "Ahora",
    }))


    // ========================================
    // LOGS
    // ========================================

    console.log(
      `NUEVO PEDIDO MESA ${selectedTable.number}`,
    )

    console.table(

      newItems.map((item) => ({

        producto: item.name,

        cantidad: item.quantity,

        precio: item.price,

        subtotal:
          item.quantity * item.price,

        Nota: orderNotes[selectedTable.id] || "Sin notas",
      })),
    )


    // ========================================
    // ACTUALIZAR SENT QUANTITY
    // ========================================

    const updatedItems =
      orderItems.map((item) => ({

        ...item,

        sentQuantity: item.quantity,
      }))


    // ========================================
    // GUARDAR EN MESA
    // ========================================

    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))


    // ========================================
    // GUARDAR PEDIDO ENVIADO
    // ========================================

    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: updatedItems,
    }))

    alert(
      `Pedido enviado a cocina para mesa ${selectedTable.number}`,
    )

    // LIMPIAR NOTAS
    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: "",
    }))
  }

  // ========================================
  // ENVIAR A CAJA
  // ========================================

  function handleSendToCashier() {

    // VALIDAR SI YA SE ENVIO A COCINA
    const alreadySentToKitchen =
      orderItems.some(
        (item) => item.sentQuantity > 0,
      )

    if (!alreadySentToKitchen) {

      alert(
        "Primero debes enviar el pedido a cocina",
      )

      return
    }

    // CONFIRMAR ENVIO A CAJA
    const confirmSend = window.confirm(
      `¿Estás seguro de enviar la mesa ${selectedTable.number} a caja?`
    )

    if (!confirmSend) {
      return
    }

    // MENSAJE
    alert(
      `Mesa ${selectedTable.number} enviada a caja`,
    )

    // LIMPIAR PEDIDOS
    setTableOrders((prev) => ({

      ...prev,

      [selectedTable.id]: [],
    }))

    // LIMPIAR GUARDADOS
    setSavedOrders((prev) => ({

      ...prev,

      [selectedTable.id]: [],
    }))

    // LIMPIAR NOTAS
    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: "",
    }))

    // LIBERAR MESA
    setTablesState((prev) =>

      prev.map((table) =>

        table.id === selectedTable.id
          ? {

              ...table,

              occupied: false,

              waiter: null,

              time: null,
            }
          : table,
      ),
    )

    // REGRESAR A MESAS
    setSelectedTable(null)
  }

  function handleUpdateOrderNotes(notes) {

    setOrderNotes((prev) => ({

      ...prev,

      [selectedTable.id]: notes,
    }))
  }

  // ========================================
  // FLOORS
  // ========================================

  const floors = [
    ...new Set(
      tablesState.map((table) => table.floor),
    ),
  ]

  const [selectedFloor, setSelectedFloor] =
    useState(floors[0])


  // ========================================
  // FILTRAR MESAS
  // ========================================

  const filteredTables = tablesState.filter(
    (table) =>
      table.floor === selectedFloor,
  )


  // ========================================
  // FILTRAR PRODUCTOS
  // ========================================

  const filteredProducts = products.filter(
    (product) => {

      // ========================================
      // CATEGORIA
      // ========================================

      const matchesCategory =
        selectedCategory === "Todos"
          ? true
          : product.category === selectedCategory

      // ========================================
      // OMITIR TILDES
      // ========================================

      const normalizedProductName =
        product.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()

      const normalizedSearch =
        searchTerm
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()

      const matchesSearch =
        normalizedProductName.includes(
          normalizedSearch,
        )

      return (
        matchesCategory &&
        matchesSearch
      )
    },
  )


  return (

    <div className="pos-page">

      {/* ======================================== */}
      {/* MESAS */}
      {/* ======================================== */}

      {!selectedTable && (

        <PosPageTables
          tables={filteredTables}
          onTableClick={handleTableClick}
          floors={floors}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
        />

      )}


      {/* ======================================== */}
      {/* MENU */}
      {/* ======================================== */}

      {selectedTable && (

        <PosPageMenu
          selectedTable={selectedTable}
          products={filteredProducts}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setSelectedTable={setSelectedTable}
          orderItems={orderItems}
          handleAddProduct={handleAddProduct}
          handleIncreaseQuantity={handleIncreaseQuantity}
          handleDecreaseQuantity={handleDecreaseQuantity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSendToKitchen={handleSendToKitchen}
          handleSendToCashier={handleSendToCashier}
          orderNotes={orderNotes[selectedTable.id] || ""}
          handleUpdateOrderNotes={handleUpdateOrderNotes}     
        />     
      )}
    </div>
  )
}