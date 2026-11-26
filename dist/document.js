/* ──────────────────────────────────────────────────────────────────────────
 * The receipt, described once — the same for every paper and printer:
 *
 *   {
 *     blocks: [
 *       { type: 'text', text: 'PRODUCTION SHEET', size: 'sm', bold: true },
 *       { type: 'divider' },
 *       { type: 'text', text: 'Chicken Inasal', size: 'lg', bold: true },
 *       { type: 'columns', cells: [{ text: 'TYPE' }, { text: 'QUANTITY' }], size: 'sm' },
 *       { type: 'row', left: 'Total', right: '₱4,799.50', bold: true },
 *     ],
 *   }
 *
 * Sizes are named so a layout reads the same on 50 mm and 80 mm paper:
 * xs 14 · sm 16 · md 20 · lg 26 · xl 34 dots tall (8 dots = 1 mm), or a number.
 * ────────────────────────────────────────────────────────────────────────── */
export const FONT_DOTS = { xs: 14, sm: 16, md: 20, lg: 26, xl: 34 };
export const fontDots = (size) => (typeof size === 'number' ? size : FONT_DOTS[size ?? 'md']);
//# sourceMappingURL=document.js.map