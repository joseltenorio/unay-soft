// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Home from "./pages/Home/Home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<div>Login pendiente</div>} />
        <Route path="/restore-password" element={<div>Restablecer contraseña pendiente</div>} />
        <Route path="/dashboard" element={<div>Dashboard pendiente</div>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App