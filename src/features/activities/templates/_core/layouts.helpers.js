// src/features/module/templates/layouts.helpers.js

/**
 * normalizeLayout:
 * - Convierte layout definido como { base, md } a formato plano para HeroGrid.
 * - HeroGrid espera cols/rows/areas (+ md opcional).
 */

export function normalizeLayout(layoutDef) {
  if (!layoutDef?.base) return null;

  const out = {
    cols: layoutDef.base.cols,
    rows: layoutDef.base.rows,
    areas: layoutDef.base.areas,
    gap: layoutDef.base.gap,
  };

  if (layoutDef.md) out.md = layoutDef.md;
  if (layoutDef.lg) out.lg = layoutDef.lg;

  return out;
}