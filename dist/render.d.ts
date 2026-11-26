import { type Bitmap } from './bitmap.js';
import type { ReceiptDocument } from './document.js';
import { type Measure } from './layout.js';
import { type Paper, type PaperName, type PaperSpec } from './paper.js';
/** Measures text with a canvas. */
export declare function canvasMeasure(): Measure;
export interface RenderedPage {
    bitmap: Bitmap;
    canvas: HTMLCanvasElement;
}
/** The receipt as pages for `paper`: one per label, or one long page on a roll. */
export declare function renderReceipt(doc: ReceiptDocument, paperIn: PaperName | PaperSpec | Paper, measure?: Measure): RenderedPage[];
