// SettingsMenu.jsx
// Boton de engranaje (arriba a la derecha) que abre el modal "Opciones" con dos
// sliders: Efectos (volumen de sfx) y Musica (volumen ambiente). Los sliders
// ajustan en vivo los servicios de audio del juego (Phaser).
import { useState } from "react";
import { getSfxVolume, setSfxVolume } from "./game/services/audioSettings";
import { getMusicVolume, setMusicVolume } from "./game/services/musicManager";

const GOLD = "#f5c518";
const INK = "#16233a";

function SliderRow({ icon, label, value, onChange }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}>
          {icon}
        </div>
        <span style={{ color: INK, fontWeight: 800, fontSize: 20, flex: 1 }}>
          {label}
        </span>
        <span style={{ color: INK, fontWeight: 800, fontSize: 20 }}>{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 10, accentColor: INK, cursor: "pointer" }}
      />
    </div>
  );
}

export default function SettingsMenu() {
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

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 90vw)",
              background: GOLD,
              borderRadius: 24,
              padding: "28px 34px 34px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28,
              }}>
              <h2 style={{ color: INK, fontWeight: 900, fontSize: 40, margin: 0 }}>
                Opciones
              </h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                style={{
                  width: 46,
                  height: 46,
                  border: "none",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.55)",
                  color: INK,
                  fontSize: 24,
                  fontWeight: 900,
                  cursor: "pointer",
                }}>
                ✕
              </button>
            </div>

            <SliderRow icon="🔊" label="Efectos" value={sfx} onChange={handleSfx} />
            <SliderRow icon="🎵" label="Musica" value={music} onChange={handleMusic} />
          </div>
        </div>
      )}
    </>
  );
}
