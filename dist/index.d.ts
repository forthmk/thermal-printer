import type { ReceiptDocument } from './document.js';
import type { PrinterDriver, PrintStep } from './drivers/types.js';
import { type PaperName, type PaperSpec } from './paper.js';
export interface PrintReceiptOptions {
    printer: PrinterDriver;
    paper: PaperName | PaperSpec;
    copies?: number;
    onStep?: (step: PrintStep | 'rendering') => void;
}
/** Draws the receipt for the paper and prints it. Resolves when the printer is done. */
export declare function printReceipt(doc: ReceiptDocument, opts: PrintReceiptOptions): Promise<void>;
/** The first printer that works here, e.g. pickPrinter(niimbot(), browserPrint()). */
export declare function pickPrinter(...drivers: PrinterDriver[]): PrinterDriver;
export * from './document.js';
export * from './paper.js';
export * from './bitmap.js';
export { layout, paginate, wrap, fit, type Measure, type Font, type Line, type Run } from './layout.js';
export { renderReceipt, canvasMeasure, type RenderedPage } from './render.js';
export { encodeEscPos, type EscPosOptions } from './escpos.js';
export { niimbot, type NiimbotOptions } from './drivers/niimbot.js';
export { escpos, webBluetoothTransport, type Transport, type EscPosDriverOptions } from './drivers/escpos.js';
export { browserPrint } from './drivers/browser.js';
export { PrintCancelled, inNativeApp, webBluetoothAvailable, type PrinterDriver, type PrintStep, type DriverPrintOptions } from './drivers/types.js';
