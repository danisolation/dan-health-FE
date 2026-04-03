import { NavLink } from "react-router-dom";
import type { NavItem } from "@/types/health";

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: "📊", path: "/" },
  { label: "Nhịp tim", icon: "❤️", path: "/heart-rate" },
  { label: "Giấc ngủ", icon: "😴", path: "/sleep" },
  { label: "Vận động", icon: "🚶", path: "/activity" },
  { label: "Stress", icon: "😰", path: "/stress" },
  { label: "SpO2", icon: "🫁", path: "/spo2" },
  { label: "Readiness", icon: "💪", path: "/readiness" },
  { label: "Workouts", icon: "🏃", path: "/workouts" },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-dark-card border-r border-dark-border
          flex flex-col transition-all duration-300
          ${collapsed ? "md:w-16" : "md:w-56"} w-56
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-dark-border">
          <span className="text-xl" role="img" aria-hidden="true">⌚</span>
          {(!collapsed || mobileOpen) && (
            <span className="text-accent-blue font-semibold text-sm truncate md:block">
              Amazfit Health
            </span>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto md:hidden text-gray-400 hover:text-gray-200 p-1"
            aria-label="Đóng menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors
                focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:outline-none
                ${
                  isActive
                    ? "bg-dark-hover text-accent-blue"
                    : "text-gray-400 hover:bg-dark-hover hover:text-gray-200"
                }
                ${collapsed && !mobileOpen ? "md:justify-center" : ""}`
              }
            >
              <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
              {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex items-center justify-center h-12 border-t border-dark-border
                     text-gray-500 hover:text-gray-300 transition-colors"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        >
          <span className="text-sm">{collapsed ? "»" : "«"}</span>
        </button>
      </aside>
    </>
  );
}
