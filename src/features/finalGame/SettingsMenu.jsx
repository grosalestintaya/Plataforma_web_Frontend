// SettingsMenu.jsx
// Boton de engranaje (arriba a la derecha) que abre el modal de opciones para
// ajustar el volumen de efectos (sfx) y musica ambiente. Reutiliza el
// ConfiguracionModal compartido del proyecto para mantener el mismo estilo, y
// cablea sus sliders a los servicios de audio del juego final (Phaser).
import { useState } from "react";
import ConfiguracionModal from "@/features/module/components/sections/ConfiguracionModal";
import { getSfxVolume, setSfxVolume } from "./game/services/audioSettings";
import { getMusicVolume, setMusicVolume } from "./game/services/musicManager";

export default function SettingsMenu({ onExit }) {
  const [open, setOpen] = useState(false);
  const [sfx, setSfx] = useState(Math.round(getSfxVolume() * 100));
  const [music, setMusic] = useState(Math.round(getMusicVolume() * 100));

  const handleSfx = (v) => {
    setSfx(v);
    setSfxVolume(v / 100);
  };
  const handleMusic = (v) => {
    setMusic(v);
    setMusicVolume(v / 100);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Opciones"
        onClick={() => setOpen(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 56,
          height: 56,
          padding: 8,
          border: "none",
          borderRadius: 14,
          background: "rgba(0,0,0,0.35)",
          cursor: "pointer",
          zIndex: 20,
        }}>
        <img
          src="/gear.webp"
          alt="Opciones"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </button>

      <ConfiguracionModal
        open={open}
        onRequestClose={() => setOpen(false)}
        onRequestAbandon={onExit}
        description="Saldrás del juego y volverás al panel."
        abandonLabel="Abandonar actividad"
        sfx={sfx}
        music={music}
        onChangeSfx={handleSfx}
        onChangeMusic={handleMusic}
      />
    </>
  );
}
