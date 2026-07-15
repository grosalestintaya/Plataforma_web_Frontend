import React, { useEffect, useRef, useState } from "react";
import introVideo from "@/assets/dashboard/video banner final.mp4";

const FADE_MS = 700;
// Si el video no termina por su cuenta (stall de red, códec, etc.),
// forzamos la salida para no dejar al usuario bloqueado.
const SAFETY_TIMEOUT_MS = 9000;

export default function DashboardIntroVideo({ onFinish }) {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);

  const startFade = () => setFading(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay puede ser rechazado por el navegador aunque esté muted;
    // en ese caso saltamos la intro en vez de mostrar un frame congelado.
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setFading(true));
    }

    const safety = setTimeout(() => setFading(true), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(onFinish, FADE_MS);
    return () => clearTimeout(t);
  }, [fading, onFinish]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity ease-out"
      style={{
        opacity: fading ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: fading ? "none" : "auto",
      }}>
      <video
        ref={videoRef}
        src={introVideo}
        muted
        playsInline
        preload="auto"
        onEnded={startFade}
        onError={startFade}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={startFade}
        className="absolute bottom-6 right-6 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white">
        Saltar
      </button>
    </div>
  );
}
