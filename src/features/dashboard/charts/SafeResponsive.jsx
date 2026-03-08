// src/components/charts/SafeResponsive.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

function isValidSize(n) {
  // Recharts necesita > 0 y aquí bloqueamos negativos y NaN.
  return Number.isFinite(n) && n >= 1;
}

export default function SafeResponsive({
  height = 300,
  minHeight = 220,
  className = "",
  style,
  children,
}) {
  const hostRef = useRef(null);
  const rafRef = useRef(0);
  const [size, setSize] = useState({ w: 0, h: 0, ready: false });

  const measure = () => {
    const el = hostRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const w = Math.floor(r.width);
    const h = Math.floor(r.height);

    const ready = isValidSize(w) && isValidSize(h);

    // Solo actualiza si cambió (evita renders extras)
    setSize((prev) => {
      if (prev.w === w && prev.h === h && prev.ready === ready) return prev;
      return { w, h, ready };
    });
  };

  // Medición inicial antes de pintar (reduce el primer render inválido)
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      // Espera al siguiente frame para que el layout esté estable
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        measure();
      });
    });

    ro.observe(el);

    // Por si el contenedor aparece después (tabs/modals),
    // forzamos un par de medidas extra en frames siguientes.
    rafRef.current = requestAnimationFrame(() => measure());
    const raf2 = requestAnimationFrame(() => measure());

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: "100%",
        height,
        minHeight,
        minWidth: 0,
        overflow: "hidden",
        // Esto ayuda cuando estás dentro de flex/grid con shrink
        flex: "1 1 auto",
        ...style,
      }}
    >
      {size.ready ? (
        // Importante: aquí NO uses debounce; el problema era layout, no resize spam
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
