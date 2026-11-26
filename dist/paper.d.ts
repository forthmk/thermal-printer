export declare const DOTS_PER_MM = 8;
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
export declare const PAPERS: Record<PaperName, PaperSpec>;
/** The print head's width for a paper width: 48 mm up to 58 mm paper, 72 mm on 80 mm. */
export declare function printableDotsFor(widthMm: number): number;
export declare function resolvePaper(paper: PaperName | PaperSpec): Paper;
