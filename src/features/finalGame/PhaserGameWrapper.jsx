// PhaserGameWrapper.jsx
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "./game/config";
import { EventBus } from "./game/EventBus";
import {
  registerUnloadHandler,
  unregisterUnloadHandler,
} from "./game/services/attemptTracker";

export default function PhaserGameWrapper({ onGameFinished }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
    });

    gameRef.current.scene.start("BootScene");

    // Cierre best-effort del intento activo si el usuario cierra/recarga.
    registerUnloadHandler();

    const handleFinish = (result) => onGameFinished(result);
    EventBus.on("game-finished", handleFinish);

    return () => {
      EventBus.off("game-finished", handleFinish);
      unregisterUnloadHandler();
      gameRef.current.destroy(true);
    };
    // Correr una sola vez al montar: onGameFinished no esta memoizado en el
    // padre y agregarlo recrearia el juego de Phaser en cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Marco: el contenedor exterior llena la pantalla en oro; el canvas de
    // Phaser vive en un area centrada de 95vw x 95vh, dejando el 5% de oro
    // visible como borde alrededor.
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f5b400",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
      <div
        ref={containerRef}
        style={{
          width: "99vw",
          height: "99vh",
          border: "0px solid #22c55e",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
