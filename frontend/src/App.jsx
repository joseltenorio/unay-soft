// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import RestorePassword from "./pages/RestorePassword/RestorePassword"
import Dashboard from "./pages/Dashboard/Dashboard"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/restore-password" element={<RestorePassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App