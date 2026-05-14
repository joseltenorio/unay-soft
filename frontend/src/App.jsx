// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import RestorePassword from "./pages/RestorePassword/RestorePassword"

import AppHome from "./pages/AppHome/AppHome"
import Unauthorized from "./pages/Unauthorized/Unauthorized"

import PosPage from "./pages/modules/PosPage/PosPage"
import KdsPage from "./pages/modules/KdsPage/KdsPage"
import CashierPage from "./pages/modules/CashierPage/CashierPage"
import InventoryPage from "./pages/modules/InventoryPage/InventoryPage"
import BiPage from "./pages/modules/BiPage/BiPage"
import SecurityPage from "./pages/modules/SecurityPage/SecurityPage"

import AppLayout from "./components/layout/AppLayout/AppLayout"

import ProtectedRoute from "./routes/ProtectedRoute"
import PermissionRoute from "./routes/PermissionRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/restore-password" element={<RestorePassword />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppHome />} />

          <Route path="unauthorized" element={<Unauthorized />} />

          <Route
            path="pos"
            element={
              <PermissionRoute permission="pos.ver">
                <PosPage />
              </PermissionRoute>
            }
          />

          <Route
            path="kds"
            element={
              <PermissionRoute permission="kds.ver">
                <KdsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="cashier"
            element={
              <PermissionRoute permission="cashier.ver">
                <CashierPage />
              </PermissionRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <PermissionRoute permission="inventory.ver">
                <InventoryPage />
              </PermissionRoute>
            }
          />

          <Route
            path="bi"
            element={
              <PermissionRoute permission="bi.ver">
                <BiPage />
              </PermissionRoute>
            }
          />

          <Route
            path="security"
            element={
              <PermissionRoute permission="security.ver">
                <SecurityPage />
              </PermissionRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App