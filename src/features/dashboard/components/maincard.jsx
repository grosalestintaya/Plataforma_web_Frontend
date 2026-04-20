import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinalModuleUnlockPanel from "./FinalModuleUnlockPanel";

import ImperialRopeDefs from "./rope/ImperialRopeDefs";
import MainRope from "./rope/MainRope";
import SubRope from "./rope/SubRope";
import DecorativeSubRope from "./rope/DecorativeSubRope";

import {
  ANCHOR_POINTS,
  BRANCH_COLORS,
  DECORATIVE_ANCHOR_POINTS,
  DECORATIVE_SUBROPE_CURVE_VARIANTS,
  MAIN_ROPE_PATH,
  SUBROPE_CURVE_VARIANTS,
  getRopeDefsIds,
} from "./rope/rope.variants";

import { normalizeStatus } from "./rope/rope.utils";

function buildModuleRoute(sortOrder) {
  return `/modules/m${String(sortOrder).padStart(2, "0")}`;
}

export default function ModulesRope({
  modules = [],
  moduleImages = {},
  className = "",
}) {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const defsIds = useMemo(() => getRopeDefsIds("modules-rope"), []);

  const visibleModules = useMemo(() => {
    return [...modules]
      .sort((a, b) => Number(a?.sortOrder) - Number(b?.sortOrder))
      .slice(0, 5);
  }, [modules]);

  const currentUnlockedSortOrder = useMemo(() => {
    const unlockedModules = visibleModules.filter(
      (module) => normalizeStatus(module?.status) === "unlocked",
    );

    if (!unlockedModules.length) return null;

    return unlockedModules.reduce((max, module) => {
      return Number(module?.sortOrder) > Number(max?.sortOrder) ? module : max;
    }).sortOrder;
  }, [visibleModules]);

  const decorativePalette = useMemo(
    () => ({
      main: "#A56A3B",
      dark: "#744520",
      light: "#E6BF95",
    }),
    [],
  );

  return (
    <section
      className={["w-full min-w-0 pb-1", className].filter(Boolean).join(" ")}>
      <div
        className="
          grid w-full min-w-0 grid-cols-1 items-start gap-4
          xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,420px)] xl:gap-6
        ">
        <div className="min-w-0">
          <div className="w-full overflow-x-auto overflow-y-visible pb-1">
            <svg
              viewBox="50 0 720 470"
              preserveAspectRatio="xMidYMin meet"
              className="mx-auto block h-auto w-full min-w-[760px] max-w-[800px] overflow-visible"
              role="img"
              aria-label="Mapa de subcuerdas de módulos">
              <ImperialRopeDefs path={MAIN_ROPE_PATH} ids={defsIds} />

              <style>
                {`
                  .subrope-button {
                    transform-box: view-box;
                    transition:
                      transform 220ms cubic-bezier(.22,1,.36,1),
                      filter 220ms ease,
                      opacity 220ms ease;
                    will-change: transform, filter;
                  }

                  .subrope-button--sway {
                    animation: subropeSway 4.8s ease-in-out infinite;
                  }

                  .subrope-button--sway-0 { animation-delay: 0s; }
                  .subrope-button--sway-1 { animation-delay: .6s; }
                  .subrope-button--sway-2 { animation-delay: 1.1s; }
                  .subrope-button--sway-3 { animation-delay: 1.7s; }
                  .subrope-button--sway-4 { animation-delay: 2.2s; }

                  .subrope-button:hover,
                  .subrope-button:focus-visible {
                    transform: translateY(-4px) scale(1.045);
                    filter: brightness(1.08) saturate(1.08);
                    animation-play-state: paused;
                  }

                  .subrope-button:focus {
                    outline: none;
                  }

                  @keyframes subropeSway {
                    0%   { transform: rotate(0deg) translateY(0); }
                    25%  { transform: rotate(0.55deg) translateY(-0.5px); }
                    50%  { transform: rotate(0deg) translateY(0); }
                    75%  { transform: rotate(-0.55deg) translateY(0.5px); }
                    100% { transform: rotate(0deg) translateY(0); }
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .subrope-button,
                    .subrope-button--sway {
                      animation: none !important;
                      transition: none !important;
                    }
                  }
                `}
              </style>

              {DECORATIVE_ANCHOR_POINTS.map((point, index) => {
                const curveVariant =
                  DECORATIVE_SUBROPE_CURVE_VARIANTS[
                    index % DECORATIVE_SUBROPE_CURVE_VARIANTS.length
                  ];

                return (
                  <DecorativeSubRope
                    key={`decorative-subrope-${index}`}
                    point={point}
                    index={index}
                    curveVariant={DECORATIVE_SUBROPE_CURVE_VARIANTS[index]}
                    defsIds={defsIds}
                    palette={decorativePalette}
                    opacity={0.99}
                  />
                );
              })}

              {visibleModules.map((module, index) => {
                const status = normalizeStatus(module?.status);
                const state = status === "locked" ? "locked" : "unlocked";
                const palette = BRANCH_COLORS[index % BRANCH_COLORS.length];
                const curveVariant =
                  SUBROPE_CURVE_VARIANTS[index % SUBROPE_CURVE_VARIANTS.length];

                const isHovered = hoveredIndex === index;
                const anyHovered = hoveredIndex !== null;
                const isCurrentTarget =
                  Number(module?.sortOrder) ===
                  Number(currentUnlockedSortOrder);

                const showLabel =
                  state === "unlocked" &&
                  (isHovered || (isCurrentTarget && !anyHovered));

                return (
                  <SubRope
                    key={module?.moduleId || index}
                    module={module}
                    index={index}
                    point={ANCHOR_POINTS[index]}
                    curveVariant={curveVariant}
                    palette={palette}
                    defsIds={defsIds}
                    state={state}
                    active={isHovered || (isCurrentTarget && !anyHovered)}
                    showLabel={showLabel}
                    animate={state === "unlocked"}
                    onHover={setHoveredIndex}
                    onLeave={() => setHoveredIndex(null)}
                    onActivate={(selectedModule) =>
                      navigate(buildModuleRoute(selectedModule?.sortOrder))
                    }
                  />
                );
              })}

              <MainRope
                path={MAIN_ROPE_PATH}
                ids={defsIds}
                accent="#B092FF"
                showEndKnots
                showPendants
                stampStep={10.9}
              />
            </svg>
          </div>
        </div>

        <div className="min-w-0 pr-10 xl:pt-3">
          <div className="mx-auto max-w-[430px]">
            <FinalModuleUnlockPanel modules={modules || []} />
          </div>
        </div>
      </div>
    </section>
  );
}
