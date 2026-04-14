import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import bg from "@/assets/dashboard/bg3.png";
import { useAuth } from "../../auth/components/AuthContext";
import LogoutModal from "../../auth/pages/LogOut";
import SidebarPanel from "./SidebarPanel";
import { getMenuItemsByRole } from "./sidebar.config";
import useIsDesktop from "./useIsDesktop";

export default function SidebarLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const [openLogout, setOpenLogout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDesktop = useIsDesktop(768);

  const themeClass = useMemo(
    () => `theme-${user?.style ?? "green"}`,
    [user?.style],
  );

  const roleName = user?.role?.name;
  const menuItems = useMemo(() => getMenuItemsByRole(roleName), [roleName]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const desktopMainClass = "flex-1 min-w-0 ml-37 p-5 pt-4 pr-3 pb-3 ";
  const mobileMainClass = "min-h-screen w-full min-w-0 p-4 pt-16";

  return (
    <div
      className={`flex min-h-screen w-full ${themeClass} transition-colors duration-300`}
      style={{
        backgroundColor: "var(--app-bg)",
      }}>
      {isDesktop && (
        <SidebarPanel
          menuItems={menuItems}
          mobileExpanded
          isDesktop
          isCollapsed={false}
          onToggleMobile={() => {}}
          onLogout={() => setOpenLogout(true)}
          mode="desktop"
        />
      )}

      {!isDesktop && <MobileMenuButton onClick={() => setMobileOpen(true)} />}

      <main className={isDesktop ? desktopMainClass : mobileMainClass}>
        <Outlet />
      </main>

      {!isDesktop &&
        mobileOpen &&
        createPortal(
          <MobileSidebarModal
            themeClass={themeClass}
            menuItems={menuItems}
            onClose={() => setMobileOpen(false)}
            onLogout={() => {
              setMobileOpen(false);
              setOpenLogout(true);
            }}
          />,
          document.body,
        )}

      <LogoutModal open={openLogout} onClose={() => setOpenLogout(false)} />
    </div>
  );
}

function MobileMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menú"
      className="
        fixed left-4 top-4 z-[60]
        inline-flex h-12 w-12 items-center justify-center
        rounded-2xl border
        shadow-lg backdrop-blur-md
        transition duration-200 hover:scale-[1.03] active:scale-[0.97]
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        borderColor: "rgba(255,255,255,0.14)",
        boxShadow:
          "0 10px 24px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>
      <Menu
        size={22}
        strokeWidth={2.4}
        style={{
          color: "var(--sidebar-foreground)",
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
        }}
      />
    </button>
  );
}

function MobileSidebarModal({ themeClass, menuItems, onClose, onLogout }) {
  return (
    <div className={`fixed inset-0 z-[70] md:hidden ${themeClass}`}>
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(4px)",
        }}
      />

      <aside
        className="
          absolute left-0 top-0 h-full w-[86vw] max-w-[250px]
          overflow-hidden border-r
          animate-[slideInLeft_0.22s_ease-out]
        "
        style={{
          backgroundColor: "var(--sidebar)",
          color: "var(--sidebar-foreground)",
          borderColor: "rgba(255,255,255,0.10)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.30)",
        }}>
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary), rgba(255,255,255,0.35), var(--primary))",
          }}
        />

        <div className="min-h-0 h-[calc(100%-6px)] overflow-y-auto">
          <SidebarPanel
            menuItems={menuItems}
            mobileExpanded
            isDesktop={false}
            isCollapsed={false}
            onToggleMobile={onClose}
            onLogout={onLogout}
            mode="mobile-modal"
          />
        </div>
      </aside>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0.92;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
