/* The print screen — any printer the device can print to, or Save as PDF
 * (then the NIIMBOT app → PDF Print). Works everywhere, iPhone included; it
 * can't tell a print from a cancelled print screen, so it resolves once the
 * print screen has been shown — the app should ask "Did it print?". */
import { DOTS_PER_MM, type Paper } from '../paper.js';
import type { RenderedPage } from '../render.js';
import type { DriverPrintOptions, PrinterDriver } from './types.js';

export function browserPrint(): PrinterDriver {
    return {
        name: 'browser',
        supported: () => typeof window !== 'undefined' && typeof document !== 'undefined',
        async print(pages: RenderedPage[], paper: Paper, opts: DriverPrintOptions = {}) {
            opts.onStep?.('printing');
            const copies = Math.max(1, opts.copies ?? 1);
            const all = Array.from({ length: copies }, () => pages).flat();
            const widthMm = paper.widthMm;
            const pageHtml = all
                .map((p) => {
                    const hMm = p.canvas.height / DOTS_PER_MM;
                    const wMm = p.canvas.width / DOTS_PER_MM;
                    return `<div class="pg" style="height:${hMm}mm"><img src="${p.canvas.toDataURL('image/png')}" style="width:${wMm}mm;height:${hMm}mm" alt=""></div>`;
                })
                .join('');
            // A roll is as long as its (single) page.
            const heightMm = paper.heightMm ?? all[0].canvas.height / DOTS_PER_MM;
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><style>
@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
html, body { margin: 0; background: #fff; }
.pg { width: ${widthMm}mm; display: flex; justify-content: center; align-items: flex-start; overflow: hidden; break-after: page; }
.pg:last-child { break-after: auto; }
img { image-rendering: pixelated; }
</style></head><body>${pageHtml}</body></html>`;

            const frame = document.createElement('iframe');
            frame.setAttribute('aria-hidden', 'true');
            frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
            document.body.appendChild(frame);
            const doc = frame.contentDocument!;
            doc.open();
            doc.write(html);
            doc.close();
            await new Promise((r) => setTimeout(r, 150));
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            setTimeout(() => frame.remove(), 1000);
        },
    };
}
