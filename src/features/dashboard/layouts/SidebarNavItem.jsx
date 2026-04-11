// src/features/dashboard/layout/SidebarNavItem.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarNavItem({
  item,
  collapsed = false,
  isDesktop = false,
  onNavigate,
  mode = "desktop", // "desktop" | "mobile-modal"
}) {
  const Icon = item.icon;
  const isMobileModal = mode === "mobile-modal";

  return (
    <NavLink
      to={item.path}
      end={item.path === ""}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        [
          "group relative flex items-center rounded-2xl transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-white/30",

          collapsed
            ? "mx-2 justify-center px-8 py-5"
            : isDesktop
              ? "mx-3 gap-3 px-4 py-3.5"
              : isMobileModal
                ? "mx-2 gap-3 px-4 py-3"
                : "mx-3 gap-3 px-4 py-3",

          isActive
            ? "sidebar-link sidebar-link--active"
            : "sidebar-link sidebar-link--inactive",
        ].join(" ")
      }>
      <span className="shrink-0">
        <Icon size={isDesktop && !collapsed ? 21 : 20} />
      </span>

      {!collapsed && (
        <span
          className={[
            "truncate font-medium",
            isDesktop || isMobileModal ? "text-[15px]" : "text-sm",
          ].join(" ")}>
          {item.name}
        </span>
      )}
    </NavLink>
  );
}
