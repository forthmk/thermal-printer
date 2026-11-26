import { browserPrint } from './drivers/browser.js';
import { resolvePaper } from './paper.js';
import { renderReceipt } from './render.js';
/** Draws the receipt for the paper and prints it. Resolves when the printer is done. */
export async function printReceipt(doc, opts) {
    opts.onStep?.('rendering');
    const paper = resolvePaper(opts.paper);
    const pages = renderReceipt(doc, paper);
    const driverOpts = { copies: opts.copies, onStep: opts.onStep };
    await opts.printer.print(pages, paper, driverOpts);
}
/** The first printer that works here, e.g. pickPrinter(niimbot(), browserPrint()). */
export function pickPrinter(...drivers) {
    return drivers.find((d) => d.supported()) ?? browserPrint();
}
export * from './document.js';
export * from './paper.js';
export * from './bitmap.js';
export { layout, paginate, wrap, fit } from './layout.js';
export { renderReceipt, canvasMeasure } from './render.js';
export { encodeEscPos } from './escpos.js';
export { niimbot } from './drivers/niimbot.js';
export { escpos, webBluetoothTransport } from './drivers/escpos.js';
export { browserPrint } from './drivers/browser.js';
export { PrintCancelled, inNativeApp, webBluetoothAvailable } from './drivers/types.js';
//# sourceMappingURL=index.js.map