import { useState } from "react";

function Sidebar() {
  const [active, setActive] = useState("inicio");

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: "bi-house-door-fill" },
    { id: "perfil", label: "Perfil", icon: "bi-person-circle" },
    { id: "ranking", label: "Ranking", icon: "bi-trophy-fill" },
    { id: "ajustes", label: "Ajustes", icon: "bi-gear-fill" },
  ];

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-white text-white"
      style={{ width: "260px", height: "100vh" }}
    >
      {/* 🔹 Contenedor interior del sidebar */}
      <div
        className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white shadow"
        style={{
          width: "95%",
          height: "95%",
          borderRadius: "10px",
          border: "1px solid #2E2E2E",
        }}
      >
        {/* 🔹 Logo o título */}
        <div className="d-flex align-items-center justify-content-center mb-4 mt-2">
          <i className="bi bi-controller fs-2 me-2 text-primary"></i>
          <span className="fs-4 fw-bold">Quipus</span>
        </div>

        {/* 🔹 Menú principal */}
        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                onClick={() => setActive(item.id)}
                className={`nav-link text-start w-100 d-flex align-items-center ${
                  active === item.id ? "active bg-primary" : "text-white"
                }`}
                style={{
                  border: "none",
                  background: "none",
                }}
              >
                <i className={`${item.icon} me-2 fs-5`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* 🔹 Separador */}
        <hr className="text-secondary" />

        {/* 🔹 Cerrar sesión al final */}
        <div className="mt-auto mb-2">
          <button
            className="nav-link text-start w-100 d-flex align-items-center text-white"
            style={{ border: "none", background: "none" }}
            onClick={() => alert("Sesión cerrada")}
          >
            <i className="bi bi-box-arrow-right me-2 fs-5 text-danger"></i>
            Cerrar sesión
          </button>
        </div>

        {/* 🔹 Footer */}
        <div className="text-center text-secondary small">© 2025 Quipus</div>
      </div>
    </div>
  );
}

export default Sidebar;
