/* ──────────────────────────────────────────────────────────────────────────
 * Paper — the size each app prints on, chosen per call:
 *
 *   '50x30'  Commissary label        fixed labels with gaps (Niimbot T50*30)
 *   '50x80'  POS receipt label        fixed labels with gaps; a long receipt
 *                                     carries on to the next label
 *   '58mm'   receipt roll             continuous: as long as the receipt
 *   '80mm'   wide receipt roll        continuous
 *
 * or your own: { widthMm, heightMm } (heightMm: null = continuous roll).
 *
 * Thermal printers print 8 dots per mm (203 dpi). The print head is a little
 * narrower than the paper: 48 mm (384 dots) on 50 / 58 mm paper, 72 mm
 * (576 dots) on 80 mm — so that is the width a receipt is drawn at.
 * ────────────────────────────────────────────────────────────────────────── */

export const DOTS_PER_MM = 8;

export type PaperName = '50x30' | '50x80' | '58mm' | '80mm';

export interface PaperSpec {
    /** Paper width in mm. */
    widthMm: number;
    /** Label length in mm; null = continuous roll (as long as the receipt). */
    heightMm: number | null;
    /** Printable width in dots; worked out from the width when left out. */
    printableDots?: number;
}

export interface Paper {
    name: string;
    widthMm: number;
    heightMm: number | null;
    /** Fixed labels with gaps (true) or a continuous roll (false). */
    labels: boolean;
    /** Width drawn at, in dots (a multiple of 8). */
    widthDots: number;
    /** Label length in dots; null on a roll. */
    heightDots: number | null;
}

export const PAPERS: Record<PaperName, PaperSpec> = {
    '50x30': { widthMm: 50, heightMm: 30 },
    '50x80': { widthMm: 50, heightMm: 80 },
    '58mm': { widthMm: 58, heightMm: null },
    '80mm': { widthMm: 80, heightMm: null },
};

/** The print head's width for a paper width: 48 mm up to 58 mm paper, 72 mm on 80 mm. */
export function printableDotsFor(widthMm: number): number {
    if (widthMm >= 76) return 576;
    if (widthMm >= 48) return 384;
    return Math.floor((widthMm * DOTS_PER_MM) / 8) * 8;
}

export function resolvePaper(paper: PaperName | PaperSpec): Paper {
    const spec = typeof paper === 'string' ? PAPERS[paper] : paper;
    if (!spec) throw new Error(`Unknown paper "${String(paper)}". Use ${Object.keys(PAPERS).join(', ')} or { widthMm, heightMm }.`);
    if (!(spec.widthMm > 0)) throw new Error('Paper width must be more than 0 mm.');
    if (spec.heightMm !== null && !(spec.heightMm > 0)) throw new Error('Label length must be more than 0 mm (or null for a roll).');
    const widthDots = spec.printableDots ?? printableDotsFor(spec.widthMm);
    return {
        name: typeof paper === 'string' ? paper : `${spec.widthMm}x${spec.heightMm ?? 'roll'}`,
        widthMm: spec.widthMm,
        heightMm: spec.heightMm,
        labels: spec.heightMm !== null,
        widthDots: Math.floor(widthDots / 8) * 8,
        heightDots: spec.heightMm === null ? null : Math.round(spec.heightMm * DOTS_PER_MM),
    };
}
