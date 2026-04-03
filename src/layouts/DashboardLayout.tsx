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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />

      {/* Main content */}
      <main
        id="main-content"
        className={`
          pt-14 min-h-screen transition-all duration-300
          ml-0 ${sidebarCollapsed ? "md:ml-16" : "md:ml-56"}
        `}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
