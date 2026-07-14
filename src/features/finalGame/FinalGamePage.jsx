// FinalGamePage.jsx
import { useNavigate } from "react-router-dom";
import PhaserGameWrapper from "./PhaserGameWrapper";

export default function FinalGamePage() {
  const navigate = useNavigate();

  // Cada seccion ya reporta su propio intento al backend (ver attemptTracker) y
  // la pantalla de resultados muestra el contador "regresando a casa". Al
  // terminar (o al abandonar desde el modal de opciones) volvemos al panel.
  const goToApp = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <PhaserGameWrapper onGameFinished={goToApp} onExit={goToApp} />
    </div>
  );
}
