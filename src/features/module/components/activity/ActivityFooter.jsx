import { useMemo } from "react";

import navigateBeforeIcon from "@/shared/icons/icon-navigate-before.svg?raw";
import navigateNextIcon from "@/shared/icons/icon-navigate-next.svg?raw";

const FOOTER_BUTTON_BASE_CLASS =
  "inline-flex h-10 max-w-[38vw] min-w-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-white transition sm:h-12 sm:max-w-none sm:min-w-[96px] sm:gap-2 sm:px-3 sm:text-sm";
const FOOTER_BUTTON_ENABLED_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0 active:scale-[0.98]";
const FOOTER_BUTTON_DISABLED_CLASS = "cursor-not-allowed opacity-40";
const FOOTER_ICON_CLASS = "h-5 w-5 shrink-0";
const FOOTER_SLOT_PLACEHOLDER_CLASS =
  "block h-10 w-[clamp(2.75rem,24vw,6rem)] sm:h-12 sm:min-w-[96px] sm:w-auto";
const FOOTER_SHELL_CLASS = "border-t border-white/10";
const FOOTER_SHELL_INNER_CLASS =
  "flex min-h-[var(--activity-footer-height,64px)] w-full items-center px-[var(--activity-shell-gutter)] py-2 text-white/80 sm:py-0";
const FOOTER_CENTER_CLASS = "flex w-full min-w-0 items-center justify-center";
const FOOTER_NAV_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-sm sm:gap-3";
const FOOTER_TEXT_CLASS =
  "block w-full min-w-0 whitespace-normal break-words text-center text-[11px] leading-tight sm:truncate sm:text-sm";
const FOOTER_LEFT_SLOT_CLASS = "flex min-w-0 justify-start";
const FOOTER_RIGHT_SLOT_CLASS = "flex min-w-0 justify-end";

/**
 * Reutiliza el estilo de acciones del footer.
 * Mantiene botones compactos para no robar altura al hero.
 */
function getFooterButtonClass(disabled) {
  return [
    FOOTER_BUTTON_BASE_CLASS,
    disabled ? FOOTER_BUTTON_DISABLED_CLASS : FOOTER_BUTTON_ENABLED_CLASS,
  ].join(" ");
}

/**
 * Convierte un color HEX en RGB para poder mezclarlo.
 * Si el modulo no trae un color valido, el footer cae a un dorado legible.
 */
function getFooterIconColorClass(themeHex) {
  switch (String(themeHex || "").trim().toLowerCase()) {
    case "#00c853":
      return "text-[#59db8f]";
    case "#f54927":
      return "text-[#f98973]";
    case "#ffa500":
      return "text-[#ffc559]";
    case "#00ffff":
      return "text-[#59ffff]";
    case "#7130f7":
      return "text-[#a378fa]";
    default:
      return "text-[#f5d76e]";
  }
}

/**
 * Inserta el SVG inline usando currentColor.
 * Asi el color cae solo sobre el icono y no sobre una caja completa.
 */
function FooterIcon({ svgMarkup, colorClass }) {
  const normalizedSvg = useMemo(
    () =>
      svgMarkup.replace(
        "<svg ",
        '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ',
      ),
    [svgMarkup],
  );

  return (
    <span
      aria-hidden="true"
      className={`${FOOTER_ICON_CLASS} ${colorClass}`}
      dangerouslySetInnerHTML={{ __html: normalizedSvg }}
    />
  );
}

/**
 * Boton de navegacion del footer.
 * El icono cambia segun la direccion y toma color desde el modulo activo.
 */
function FooterNavButton({
  label,
  iconSvg,
  iconColorClass,
  iconPosition = "left",
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={getFooterButtonClass(disabled)}
    >
      {iconPosition === "left" ? (
        <FooterIcon svgMarkup={iconSvg} colorClass={iconColorClass} />
      ) : null}

      <span className="min-w-0 truncate">{label}</span>

      {iconPosition === "right" ? (
        <FooterIcon svgMarkup={iconSvg} colorClass={iconColorClass} />
      ) : null}
    </button>
  );
}

function FooterNavSlot({
  visible = true,
  label,
  iconSvg,
  iconColorClass,
  iconPosition = "left",
  disabled,
  onClick,
}) {
  if (!visible) {
    return <div className={FOOTER_SLOT_PLACEHOLDER_CLASS} aria-hidden="true" />;
  }

  return (
    <FooterNavButton
      disabled={disabled}
      onClick={onClick}
      label={label}
      iconSvg={iconSvg}
      iconColorClass={iconColorClass}
      iconPosition={iconPosition}
    />
  );
}

function FooterNavRow({ left, centerText, right }) {
  return (
    <div className={FOOTER_NAV_GRID_CLASS}>
      <div className={FOOTER_LEFT_SLOT_CLASS}>{left}</div>

      <span className={FOOTER_TEXT_CLASS}>
        {centerText ?? "Quipu Yachay"}
      </span>

      <div className={FOOTER_RIGHT_SLOT_CLASS}>{right}</div>
    </div>
  );
}

/**
 * Footer shell:
 * - Usa una altura controlada por el frame principal.
 * - Compacta el contenido para liberar mas espacio al hero.
 */
function FooterShell({ children }) {
  return (
    <footer className={FOOTER_SHELL_CLASS}>
      <div className={FOOTER_SHELL_INNER_CLASS}>
        {children}
      </div>
    </footer>
  );
}

export default function ModuleFooter({ model, onUiClick, themeHex }) {
  const iconColorClass = getFooterIconColorClass(themeHex);
  const wrapClick =
    (handler, enabled = true) =>
    () => {
      if (!enabled) return;
      onUiClick?.();
      handler?.();
    };

  if (model?.type === "cta") {
    return (
      <FooterShell>
        <div className={FOOTER_CENTER_CLASS}>
          <button
            type="button"
            disabled={!model?.center?.enabled}
            onClick={wrapClick(model?.center?.onClick, model?.center?.enabled)}
            className={getFooterButtonClass(!model?.center?.enabled)}>
            {model?.center?.label}
          </button>
        </div>
      </FooterShell>
    );
  }

  if (model?.type === "status") {
    return (
      <FooterShell>
        <div className={FOOTER_CENTER_CLASS}>
          <span className={FOOTER_TEXT_CLASS}>
            {model?.centerText ?? "Quipu Yachay"}
          </span>
        </div>
      </FooterShell>
    );
  }

  if (model?.type === "locked") {
    return (
      <FooterShell>
        <FooterNavRow
          centerText={model?.centerText}
          left={
            <FooterNavButton
              disabled
              label={model?.left?.label}
              iconSvg={navigateBeforeIcon}
              iconColorClass={iconColorClass}
              iconPosition="left"
            />
          }
          right={
            <FooterNavButton
              disabled
              label={model?.right?.label}
              iconSvg={navigateNextIcon}
              iconColorClass={iconColorClass}
              iconPosition="right"
            />
          }
        />
      </FooterShell>
    );
  }

  return (
    <FooterShell>
      <FooterNavRow
        centerText={model?.centerText}
        left={
          <FooterNavSlot
            visible={model?.left?.visible !== false}
            disabled={!model?.left?.enabled}
            onClick={wrapClick(model?.left?.onClick, model?.left?.enabled)}
            label={model?.left?.label}
            iconSvg={navigateBeforeIcon}
            iconColorClass={iconColorClass}
            iconPosition="left"
          />
        }
        right={
          <FooterNavButton
            disabled={!model?.right?.enabled}
            onClick={wrapClick(model?.right?.onClick, model?.right?.enabled)}
            label={model?.right?.label}
            iconSvg={navigateNextIcon}
            iconColorClass={iconColorClass}
            iconPosition="right"
          />
        }
      />
    </FooterShell>
  );
}
