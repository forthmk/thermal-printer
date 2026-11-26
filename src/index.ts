/* ──────────────────────────────────────────────────────────────────────────
 * @forthmk/thermal-printer — one way to print receipts and labels from the
 * POS and the Commissary.
 *
 *   import { printReceipt, niimbot } from '@forthmk/thermal-printer';
 *
 *   const printer = niimbot();                       // make once, reuse
 *   await printReceipt(receipt, { printer, paper: '50x30' });   // Commissary
 *   await printReceipt(receipt, { printer, paper: '50x80' });   // POS
 *
 * The receipt is a list of blocks (document.ts); the paper is a size
 * (paper.ts); the printer is a driver (drivers/). Rendering happens in the
 * browser / the app's web view.
 * ────────────────────────────────────────────────────────────────────────── */
import type { ReceiptDocument } from './document.js';
import { browserPrint } from './drivers/browser.js';
import type { DriverPrintOptions, PrinterDriver, PrintStep } from './drivers/types.js';
import { resolvePaper, type PaperName, type PaperSpec } from './paper.js';
import { renderReceipt } from './render.js';

export interface PrintReceiptOptions {
    printer: PrinterDriver;
    paper: PaperName | PaperSpec;
    copies?: number;
    onStep?: (step: PrintStep | 'rendering') => void;
}

/** Draws the receipt for the paper and prints it. Resolves when the printer is done. */
export async function printReceipt(doc: ReceiptDocument, opts: PrintReceiptOptions): Promise<void> {
    opts.onStep?.('rendering');
    const paper = resolvePaper(opts.paper);
    const pages = renderReceipt(doc, paper);
    const driverOpts: DriverPrintOptions = { copies: opts.copies, onStep: opts.onStep };
    await opts.printer.print(pages, paper, driverOpts);
}

/** The first printer that works here, e.g. pickPrinter(niimbot(), browserPrint()). */
export function pickPrinter(...drivers: PrinterDriver[]): PrinterDriver {
    return drivers.find((d) => d.supported()) ?? browserPrint();
}

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
