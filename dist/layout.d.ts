import { type Align, type ReceiptDocument } from './document.js';
export interface Measure {
    /** Width of `text` in dots in this font. */
    width(text: string, font: Font): number;
}
export interface Font {
    px: number;
    bold: boolean;
    family: string;
}
/** One piece of text placed on a line. */
export interface Run {
    text: string;
    font: Font;
    /** Left edge, in dots from the line's start. */
    x: number;
    align: Align;
    /** Width of the box it is aligned in. */
    boxWidth: number;
}
export interface Line {
    height: number;
    runs: Run[];
    /** A horizontal rule across the line. */
    rule?: {
        thickness: number;
        dashed: boolean;
    };
}
/** Cuts text to `max` dots, ending in "…". */
export declare function fit(measure: Measure, text: string, font: Font, max: number): string;
/** Word-wraps text to `max` dots; a single word too long is cut with "…". */
export declare function wrap(measure: Measure, text: string, font: Font, max: number, maxLines?: number): string[];
/** The document as lines, each `width` dots wide. */
export declare function layout(doc: ReceiptDocument, width: number, measure: Measure): Line[];
/**
 * Splits line heights into pages of `usable` dots (null = one page, a roll).
 * Returns the line indexes on each page. A line taller than a page gets one
 * of its own; blank space at the top of a new label is dropped.
 */
export declare function paginate(heights: number[], usable: number | null): number[][];
