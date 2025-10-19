import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
//estilos
import "./index.css"; // <-- importante para que Tailwind funcione
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
