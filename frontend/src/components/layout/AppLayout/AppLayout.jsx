// frontend/src/components/layout/AppLayout/AppLayout.jsx

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import AppSidebar from "../../app/AppSidebar/AppSidebar"

import "./AppLayout.css"

export default function AppLayout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  function handleToggleSidebar() {
    setIsSidebarCollapsed((currentValue) => !currentValue)
  }

  return (
    <div
      className={
        isSidebarCollapsed
          ? "app-layout app-layout--sidebar-collapsed"
          : "app-layout"
      }
    >
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <main className="app-layout__content">
        <section className="app-layout__route-view" key={location.pathname}>
          <Outlet />
        </section>
      </main>
    </div>
  )
}