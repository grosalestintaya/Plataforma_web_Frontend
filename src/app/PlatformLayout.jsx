import { Outlet, Link } from "react-router-dom";

export default function PlatformLayout() {
  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Inicio</Link>
      </header>
      <Outlet />
    </div>
  );
}
