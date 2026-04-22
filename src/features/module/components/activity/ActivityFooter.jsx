import { useMemo } from "react";

import navigateBeforeIcon from "@/shared/icons/icon-navigate-before.svg?raw";
import navigateNextIcon from "@/shared/icons/icon-navigate-next.svg?raw";

const FOOTER_BUTTON_BASE_CLASS =
  "inline-flex h-12 min-w-[96px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-white transition";
const FOOTER_BUTTON_ENABLED_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0 active:scale-[0.98]";
const FOOTER_BUTTON_DISABLED_CLASS = "cursor-not-allowed opacity-40";
const FOOTER_ICON_CLASS = "h-5 w-5 shrink-0";
const FOOTER_SLOT_PLACEHOLDER_CLASS = "h-12 min-w-[96px]";
const FOOTER_SHELL_CLASS = "border-t border-white/10";
const FOOTER_SHELL_INNER_CLASS =
  "flex h-full min-h-[var(--activity-footer-height,64px)] items-center px-[var(--activity-shell-gutter)] text-white/80";
const FOOTER_CENTER_CLASS = "flex w-full items-center justify-center";
const FOOTER_NAV_GRID_CLASS =
  "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm";
const FOOTER_TEXT_CLASS = "truncate text-center text-xs sm:text-sm";

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
function hexToRgb(hex) {
  if (typeof hex !== "string") return null;

  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

/**
 * Mezcla el color del modulo con blanco para que el icono contraste
 * sobre el fondo oscuro del footer sin perder relacion con el modulo.
 */
function getFooterIconColor(themeHex) {
  const rgb = hexToRgb(themeHex);
  if (!rgb) return "#f5d76e";

  const mix = 0.35;
  const lift = (channel) =>
    Math.round(channel + (255 - channel) * mix)
      .toString(16)
      .padStart(2, "0");

  return `#${lift(rgb.r)}${lift(rgb.g)}${lift(rgb.b)}`;
}

/**
 * Inserta el SVG inline usando currentColor.
 * Asi el color cae solo sobre el icono y no sobre una caja completa.
 */
function FooterIcon({ svgMarkup, color }) {
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
      className={FOOTER_ICON_CLASS}
      style={{ color }}
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
  iconColor,
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
        <FooterIcon svgMarkup={iconSvg} color={iconColor} />
      ) : null}

      <span>{label}</span>

      {iconPosition === "right" ? (
        <FooterIcon svgMarkup={iconSvg} color={iconColor} />
      ) : null}
    </button>
  );
}

function FooterNavSlot({
  visible = true,
  label,
  iconSvg,
  iconColor,
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
      iconColor={iconColor}
      iconPosition={iconPosition}
    />
  );
}

/**
 * Footer shell:
 * - Usa una altura controlada por el frame principal.
 * - Compacta el contenido para liberar mas espacio al hero.
 */
function FooterShell({ children }) {
  return (
    <footer
      className={FOOTER_SHELL_CLASS}
      style={{
        minHeight: "var(--activity-footer-height, 64px)",
      }}>
      <div className={FOOTER_SHELL_INNER_CLASS}>
        {children}
      </div>
    </footer>
  );
}

export default function ModuleFooter({ model, onUiClick, themeHex }) {
  const iconColor = getFooterIconColor(themeHex);
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
        <div className={FOOTER_NAV_GRID_CLASS}>
          <FooterNavButton
            disabled
            label={model?.left?.label}
            iconSvg={navigateBeforeIcon}
            iconColor={iconColor}
            iconPosition="left"
          />

          <span className={FOOTER_TEXT_CLASS}>
            {model?.centerText}
          </span>

          <FooterNavButton
            disabled
            label={model?.right?.label}
            iconSvg={navigateNextIcon}
            iconColor={iconColor}
            iconPosition="right"
          />
        </div>
      </FooterShell>
    );
  }

  return (
    <FooterShell>
      <div className={FOOTER_NAV_GRID_CLASS}>
        <FooterNavSlot
          visible={model?.left?.visible !== false}
          disabled={!model?.left?.enabled}
          onClick={wrapClick(model?.left?.onClick, model?.left?.enabled)}
          label={model?.left?.label}
          iconSvg={navigateBeforeIcon}
          iconColor={iconColor}
          iconPosition="left"
        />

        <span className={FOOTER_TEXT_CLASS}>
          {model?.centerText ?? "Quipu Yachay"}
        </span>

        <FooterNavButton
          disabled={!model?.right?.enabled}
          onClick={wrapClick(model?.right?.onClick, model?.right?.enabled)}
          label={model?.right?.label}
          iconSvg={navigateNextIcon}
          iconColor={iconColor}
          iconPosition="right"
        />
      </div>
    </FooterShell>
  );
}
