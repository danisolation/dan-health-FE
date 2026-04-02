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
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        bg-dark-card border-r border-dark-border
        flex flex-col transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-dark-border">
        <span className="text-xl">⌚</span>
        {!collapsed && (
          <span className="text-accent-blue font-semibold text-sm truncate">
            Amazfit Health
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors
              ${
                isActive
                  ? "bg-dark-hover text-accent-blue"
                  : "text-gray-400 hover:bg-dark-hover hover:text-gray-200"
              }
              ${collapsed ? "justify-center" : ""}`
            }
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-dark-border
                   text-gray-500 hover:text-gray-300 transition-colors"
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
      >
        <span className="text-sm">{collapsed ? "»" : "«"}</span>
      </button>
    </aside>
  );
}
