import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

/**
 * DashboardLayout — Layout chính cho toàn bộ app.
 * Gồm Sidebar (trái) + Header (trên) + Content area (Outlet).
 */
export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Header */}
      <Header sidebarCollapsed={sidebarCollapsed} />

      {/* Main content */}
      <main
        className={`
          pt-14 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? "ml-16" : "ml-56"}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
