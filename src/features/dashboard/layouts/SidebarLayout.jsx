import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/components/AuthContext";
import LogoutModal from "../../auth/pages/LogOut";
import SidebarPanel from "./SidebarPanel";
import { getMenuItemsByRole } from "./sidebar.config";
import useIsDesktop from "./useIsDesktop";

export default function SidebarLayout() {
  const { user } = useAuth();

  const [openLogout, setOpenLogout] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const isDesktop = useIsDesktop(768);

  const themeClass = useMemo(
    () => `theme-${user?.style ?? "green"}`,
    [user?.style],
  );

  const roleName = user?.role?.name;
  const menuItems = useMemo(() => getMenuItemsByRole(roleName), [roleName]);

  const isCollapsed = isDesktop ? false : !mobileExpanded;

  const mainClass = isDesktop
    ? "flex-1 ml-37 p-5 pt-1 pr-3"
    : mobileExpanded
      ? "min-h-screen ml-48 p-4"
      : "min-h-screen ml-16 p-4";

  return (
    <div
      className={`flex min-h-screen ${themeClass} transition-colors duration-300`}
      style={{ backgroundColor: "var(--app-bg)" }}
    >
      <SidebarPanel
        menuItems={menuItems}
        mobileExpanded={mobileExpanded}
        isDesktop={isDesktop}
        isCollapsed={isCollapsed}
        onToggleMobile={() => setMobileExpanded((prev) => !prev)}
        onLogout={() => setOpenLogout(true)}
      />

      <main className={mainClass}>
        <Outlet />
      </main>

      <LogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
      />
    </div>
  );
}