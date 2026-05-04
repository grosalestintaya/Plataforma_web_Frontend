import React from "react";
import grassPng from "@/assets/mascots/grass/base.png";

export default function MascotTutorDemo({
  gifSrc = "/mascots/guide.gif",
  name = "Guía",
  text = "Selecciona una actividad para empezar.",
  themeHex = "#7130F7",
}) {
  return (
    <>
      <div
        className="h-full w-full  pt-0 "
        style={{
          paddingBottom: -20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "end", // ✅
          width: "100%",
          height: "105%",
          minHeight: 0,
        }}>
        {/* ── Bubble ── */}
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <div
            style={{
              background: "linear-gradient(160deg, #f5e9c8, #e8d088)",
              border: "1.5px solid #a07820",
              borderRadius: 16,
              padding: "10px 16px 12px",
              boxShadow: "0 0 0 1px #c9a227, 0 4px 18px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8b6914",
                marginBottom: 5,
              }}>
              {name}
            </div>

            <p
              style={{
                fontSize: 13,
                fontStyle: "italic",
                color: "#2a1a06",
                lineHeight: 1.5,
                margin: 0,
              }}>
              {text}
            </p>
          </div>

          {/* Tail outer (border) */}
          <div
            style={{
              position: "absolute",
              bottom: -12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "11px solid #a07820",
            }}
          />
          {/* Tail inner (fill) */}
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderTop: "10px solid #e8d088",
            }}
          />
        </div>

        {/* ── Mascot area ── */}
        <div
          style={{
            position: "relative",
            marginTop: 14,
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
          }}>
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              aspectRatio: "1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Mascot gif */}
          <img
            className="pr-1.5"
            src={gifSrc}
            alt={name}
            draggable={false}
            style={{
              position: "relative",
              zIndex: 3,
              maxHeight: "calc(100% - 40px)",
              maxWidth: "120%",
              objectFit: "contain",
              filter:
                "drop-shadow(0 6px 12px rgba(0,0,0,0.5)) contrast(1.05) saturate(1.1)",
              marginBottom: 9,
            }}
          />
          {/* Grass */}
          <img
            className="pl-1.5"
            src={grassPng}
            alt="Base de pasto"
            draggable={false}
            style={{
              position: "absolute",
              bottom: -20,
              zIndex: 2,
              xindex: 2,
              maxWidth: 500,

              width: "140%",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          {/* Golden pedestal */}+{/* Ground shadow */}
          <div
            style={{
              width: "100%",
              maxWidth: 220,
              height: 8,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
              filter: "blur(4px)",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
        </div>
      </div>
    </>
  );
}
