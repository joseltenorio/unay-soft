// frontend/src/components/layout/AppLayout/AppLayout.jsx

import { useState } from "react"
import { Outlet } from "react-router-dom"

import AppSidebar from "../../app/AppSidebar/AppSidebar"

import "./AppLayout.css"

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  function toggleSidebar() {
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
        onToggleCollapse={toggleSidebar}
      />

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  )
}