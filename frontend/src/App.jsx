// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import RestorePassword from "./pages/RestorePassword/RestorePassword"

import AppHome from "./pages/AppHome/AppHome"
import PermissionDemo from "./pages/PermissionDemo/PermissionDemo"
import Unauthorized from "./pages/Unauthorized/Unauthorized"

import PosPage from "./pages/modules/PosPage/PosPage"
import KdsPage from "./pages/modules/KdsPage/KdsPage"
import CashierPage from "./pages/modules/CashierPage/CashierPage"
import InventoryPage from "./pages/modules/InventoryPage/InventoryPage"
import BiPage from "./pages/modules/BiPage/BiPage"
import SecurityPage from "./pages/modules/SecurityPage/SecurityPage"

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
              <AppHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/permissions-demo"
          element={
            <ProtectedRoute>
              <PermissionDemo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/unauthorized"
          element={
            <ProtectedRoute>
              <Unauthorized />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/pos"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="pos.ver">
                <PosPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/kds"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="kds.ver">
                <KdsPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/cashier"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="cashier.ver">
                <CashierPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/inventory"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="inventory.ver">
                <InventoryPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/bi"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="bi.ver">
                <BiPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/security"
          element={
            <ProtectedRoute>
              <PermissionRoute permission="security.ver">
                <SecurityPage />
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App