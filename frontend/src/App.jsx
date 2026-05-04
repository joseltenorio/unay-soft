// src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import RestorePassword from "./pages/RestorePassword/RestorePassword"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/restore-password" element={<RestorePassword />} />

        <Route path="/dashboard" element={<div>Dashboard pendiente</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App