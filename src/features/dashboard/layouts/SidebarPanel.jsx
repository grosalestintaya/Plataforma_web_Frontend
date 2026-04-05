import React from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";

export default function SidebarPanel({
  menuItems,
  mobileExpanded,
  isDesktop,
  isCollapsed,
  onToggleMobile,
  onLogout,
}) {
  return (
    <aside
      className={[
        "fixed left-0 z-40 flex flex-col justify-between shadow-lg transition-all duration-300 ease-out",

        // Desktop: parecido al original
        isDesktop
          ? "top-1 bottom-2 h-[98vh] w-40 rounded-tr-2xl rounded-br-2xl"
          : mobileExpanded
            ? "top-0 h-screen w-50 rounded-tr-3xl rounded-br-3xl"
            : "top-0 h-screen w-18 rounded-tr-3xl rounded-br-3xl",
      ].join(" ")}
      style={{
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
      }}
    >
      <div>
        {/* Header */}
        <div
          className={[
            "flex items-center justify-between",
            isDesktop ? "px-3 py-1" : "px-3 py-3",
          ].join(" ")}
        >
          <div
            className={[
              "flex min-w-0 items-center",
              isCollapsed ? "justify-center w-full" : isDesktop ? "flex-col w-full" : "gap-3",
            ].join(" ")}
          >
            <div
              className={[
                "shrink-0",
                isDesktop ? "" : "rounded-xl p-1.5",
              ].join(" ")}
            >
              <img
                src="/logo.png"
                alt="Logo"
                className={[
                  "object-contain transition-all duration-300 ",
                  isCollapsed
                    ? "h-9 w-9"
                    : isDesktop
                      ? "w-35 h-35 mb-2"
                      : "h-10 w-30",
                ].join(" ")}
                draggable={false}
              />
            </div>

            {!isCollapsed && !isDesktop && (
                <div className="">
            
                </div>
            )}
          </div>

          {!isDesktop && (
            <button
              type="button"
              onClick={onToggleMobile}
              className="ml-2 rounded-xl p-2 transition-colors hover:bg-white/10 active:scale-95"
              aria-label={mobileExpanded ? "Colapsar menú" : "Expandir menú"}
            >
              {mobileExpanded ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className={isDesktop ? "flex flex-col" : "mt-3 flex flex-col gap-1"}>
          {menuItems.map((item) => (
            <SidebarNavItem
              key={item.path || item.name}
              item={item}
              collapsed={isCollapsed}
              isDesktop={isDesktop}
              onNavigate={() => {
                if (!isDesktop && mobileExpanded) {
                  onToggleMobile();
                }
              }}
            />
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className={isDesktop ? "mb-4" : "pb-4"}>
        <button
          type="button"
          onClick={onLogout}
          title={isCollapsed ? "Salir" : undefined}
          className={[
            "sidebar-logout transition-colors duration-200 flex items-center rounded-xl",
            isCollapsed
              ? "mx-auto h-12 w-12 justify-center"
              : isDesktop
                ? "w-[calc(100%-1.5rem)] mx-3 gap-3 py-2 px-4"
                : "mx-3 w-[calc(100%-1.5rem)] gap-3 px-4 py-3",
          ].join(" ")}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}