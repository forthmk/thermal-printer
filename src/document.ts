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

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type Align = 'left' | 'center' | 'right';

export interface TextBlock {
    type: 'text';
    text: string;
    size?: TextSize;
    bold?: boolean;
    align?: Align;
    /** Wrap onto more lines (default) or cut to one line with "…". */
    wrap?: boolean;
    /** At most this many lines; the last ends in "…". */
    maxLines?: number;
}

/** Left and right on one line: "Chicken Inasal ………… ₱81.85". */
export interface RowBlock {
    type: 'row';
    left: string;
    right: string;
    size?: TextSize;
    bold?: boolean;
}

/** Columns on one line; `width` is a share of the line (default: equal). */
export interface ColumnsBlock {
    type: 'columns';
    cells: { text: string; width?: number; align?: Align; bold?: boolean }[];
    size?: TextSize;
    bold?: boolean;
}

/** A small label above its value: "DELIVER TO" / "LNT Borromeo". */
export interface FieldBlock {
    type: 'field';
    label: string;
    value: string;
    size?: TextSize;
    align?: Align;
}

export interface DividerBlock {
    type: 'divider';
    style?: 'solid' | 'dashed';
    /** Line thickness in dots (default 2). */
    thickness?: number;
}

export interface SpaceBlock {
    type: 'space';
    /** Height in dots (default 8 = 1 mm). */
    height?: number;
}

export type Block = TextBlock | RowBlock | ColumnsBlock | FieldBlock | DividerBlock | SpaceBlock;

export interface ReceiptDocument {
    blocks: Block[];
    /** Space around the edges, in dots (default 8 = 1 mm). */
    margin?: number;
    /** CSS font family (default Arial / Helvetica). */
    fontFamily?: string;
}

export const FONT_DOTS: Record<Exclude<TextSize, number>, number> = { xs: 14, sm: 16, md: 20, lg: 26, xl: 34 };

export const fontDots = (size: TextSize | undefined): number => (typeof size === 'number' ? size : FONT_DOTS[size ?? 'md']);
