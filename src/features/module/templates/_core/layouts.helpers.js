// src/features/module/templates/layouts.helpers.js
import { TEORIA_CONFIG } from "../teoria/teoria.config";

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

// import { LAYOUTS } from "./layouts.registry";

// export function getLayoutDef(
//   templateKey,
//   variantKey,
//   fallbackVariant = "simple",
// ) {
//   const family = LAYOUTS[templateKey];
//   if (!family) return null;
//   return family[variantKey] ?? family[fallbackVariant] ?? null;
// }

// export function normalizeLayout(layoutDef) {
//   if (!layoutDef?.base) return null;

//   const out = {
//     cols: layoutDef.base.cols,
//     rows: layoutDef.base.rows,
//     areas: layoutDef.base.areas,
//     gap: layoutDef.base.gap,
//   };

//   if (layoutDef.md) out.md = layoutDef.md;
//   if (layoutDef.lg) out.lg = layoutDef.lg;

//   return out;
// }
