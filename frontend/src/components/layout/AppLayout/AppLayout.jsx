// frontend/src/components/layout/AppLayout/AppLayout.jsx

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import AppSidebar from "../../app/AppSidebar/AppSidebar"

import "./AppLayout.css"

export default function AppLayout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const isKdsRoute = location.pathname.startsWith("/app/kds")
  const isSecurityRoute = location.pathname.startsWith("/app/security")

  function handleToggleSidebar() {
    setIsSidebarCollapsed((currentValue) => !currentValue)
  }

  const layoutClassName = [
    "app-layout",
    isSidebarCollapsed && !isKdsRoute ? "app-layout--sidebar-collapsed" : "",
    isKdsRoute ? "app-layout--kds" : "",
    isSecurityRoute ? "app-layout--security" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={layoutClassName}>
      {!isKdsRoute && (
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      )}

      <main className="app-layout__content">
        <section className="app-layout__route-view" key={location.pathname}>
          <Outlet />
        </section>
      </main>
    </div>
  )
}