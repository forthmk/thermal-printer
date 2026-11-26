/* ──────────────────────────────────────────────────────────────────────────
 * ESC/POS — the language of ordinary receipt printers (58 / 80 mm: Epson,
 * Xprinter, most POS printers). Pages go as raster images (GS v 0), so any
 * font, size or language prints exactly as drawn.
 *
 *   ESC @            reset
 *   GS v 0 …         one band of the image (sent in bands so the printer's
 *                    small buffer never overflows)
 *   ESC d n          feed n lines (clear the tear bar)
 *   GS V 66 0        cut (printers without a cutter ignore it)
 * ────────────────────────────────────────────────────────────────────────── */
import type { Bitmap } from './bitmap.js';

export interface EscPosOptions {
    /** Lines to feed after each page (default 4). */
    feedLines?: number;
    /** Cut after each page (default true). */
    cut?: boolean;
    /** Rows per image band (default 128). */
    bandRows?: number;
}

const ESC = 0x1b;
const GS = 0x1d;

export function encodeEscPos(pages: Bitmap[], opts: EscPosOptions = {}): Uint8Array {
    const feed = opts.feedLines ?? 4;
    const band = Math.max(1, Math.min(opts.bandRows ?? 128, 0xffff));
    const out: number[] = [ESC, 0x40];
    for (const page of pages) {
        for (let y0 = 0; y0 < page.height; y0 += band) {
            const rows = Math.min(band, page.height - y0);
            const w = page.bytesPerRow;
            out.push(GS, 0x76, 0x30, 0x00, w & 0xff, (w >> 8) & 0xff, rows & 0xff, (rows >> 8) & 0xff);
            const start = y0 * w;
            for (let i = 0; i < rows * w; i++) out.push(page.data[start + i]);
        }
        if (feed > 0) out.push(ESC, 0x64, Math.min(feed, 255));
        if (opts.cut !== false) out.push(GS, 0x56, 0x42, 0x00);
    }
    return Uint8Array.from(out);
}
