// frontend/src/layout/AppLayout/AppLayout.jsx

import { Outlet } from "react-router-dom"

import AppSidebar from "../../components/app/AppSidebar/AppSidebar"

import "./AppLayout.css"

export default function AppLayout() {
  return (
    <div className="app-layout">
      <AppSidebar />

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  )
}