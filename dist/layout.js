/* ──────────────────────────────────────────────────────────────────────────
 * Layout — a ReceiptDocument into lines of known height, then into pages:
 *
 *   label paper (50×30, 50×80)  lines fill a label; the next line that
 *                               doesn't fit starts the next label
 *   roll paper (58 mm, 80 mm)   one page, as long as all the lines
 *
 * Text is measured through `Measure`, so this file needs no canvas and is
 * tested on its own (see test/layout.test.ts).
 * ────────────────────────────────────────────────────────────────────────── */
import { fontDots } from './document.js';
const LINE = 1.22; // line height ÷ font size
const DEFAULT_FAMILY = 'Arial, Helvetica, sans-serif';
/** Cuts text to `max` dots, ending in "…". */
export function fit(measure, text, font, max) {
    if (measure.width(text, font) <= max)
        return text;
    let t = text;
    while (t.length > 1 && measure.width(`${t}…`, font) > max)
        t = t.slice(0, -1);
    return `${t.trimEnd()}…`;
}
/** Word-wraps text to `max` dots; a single word too long is cut with "…". */
export function wrap(measure, text, font, max, maxLines = Infinity) {
    const out = [];
    for (const para of String(text).split('\n')) {
        const words = para.split(/\s+/).filter(Boolean);
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (measure.width(next, font) <= max || !line) {
                line = next;
            }
            else {
                out.push(line);
                line = word;
            }
        }
        out.push(line);
    }
    const lines = out.map((l) => fit(measure, l, font, max));
    if (lines.length <= maxLines)
        return lines;
    // More text than lines: the last kept line ends in "…".
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1].replace(/…$/, '');
    while (last.length > 1 && measure.width(`${last}…`, font) > max)
        last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
}
/** The document as lines, each `width` dots wide. */
export function layout(doc, width, measure) {
    const family = doc.fontFamily ?? DEFAULT_FAMILY;
    const font = (size, bold = false) => ({ px: fontDots(size), bold, family });
    const lines = [];
    const textLine = (text, f, align) => ({
        height: Math.ceil(f.px * LINE),
        runs: [{ text, font: f, x: 0, align, boxWidth: width }],
    });
    for (const block of doc.blocks) {
        switch (block.type) {
            case 'text': {
                const f = font(block.size, block.bold);
                const texts = block.wrap === false ? [fit(measure, block.text, f, width)] : wrap(measure, block.text, f, width, block.maxLines);
                for (const t of texts)
                    lines.push(textLine(t, f, block.align ?? 'left'));
                break;
            }
            case 'row': {
                const f = font(block.size, block.bold);
                const gap = Math.round(f.px * 0.6);
                const right = fit(measure, block.right, f, width);
                const rightW = measure.width(right, f);
                const left = fit(measure, block.left, f, Math.max(0, width - rightW - gap));
                lines.push({
                    height: Math.ceil(f.px * LINE),
                    runs: [
                        { text: left, font: f, x: 0, align: 'left', boxWidth: width - rightW - gap },
                        { text: right, font: f, x: 0, align: 'right', boxWidth: width },
                    ],
                });
                break;
            }
            case 'columns': {
                const total = block.cells.reduce((t, c) => t + (c.width ?? 1), 0) || 1;
                let x = 0;
                let height = 0;
                const runs = block.cells.map((c, i) => {
                    const f = font(block.size, c.bold ?? block.bold);
                    height = Math.max(height, Math.ceil(f.px * LINE));
                    const w = i === block.cells.length - 1 ? width - x : Math.floor((width * (c.width ?? 1)) / total);
                    const run = { text: fit(measure, c.text, f, w - 4), font: f, x, align: c.align ?? 'left', boxWidth: w };
                    x += w;
                    return run;
                });
                lines.push({ height, runs });
                break;
            }
            case 'field': {
                const label = font('xs');
                const value = font(block.size ?? 'md', true);
                const align = block.align ?? 'left';
                lines.push(textLine(block.label.toUpperCase(), label, align));
                for (const t of wrap(measure, block.value, value, width, 2))
                    lines.push(textLine(t, value, align));
                break;
            }
            case 'divider': {
                const thickness = block.thickness ?? 2;
                lines.push({ height: thickness + 8, runs: [], rule: { thickness, dashed: block.style === 'dashed' } });
                break;
            }
            case 'space':
                lines.push({ height: block.height ?? 8, runs: [] });
                break;
        }
    }
    return lines;
}
/**
 * Splits line heights into pages of `usable` dots (null = one page, a roll).
 * Returns the line indexes on each page. A line taller than a page gets one
 * of its own; blank space at the top of a new label is dropped.
 */
export function paginate(heights, usable) {
    if (usable === null)
        return [heights.map((_, i) => i)];
    const pages = [[]];
    let used = 0;
    heights.forEach((h, i) => {
        const page = pages[pages.length - 1];
        if (page.length > 0 && used + h > usable) {
            pages.push([i]);
            used = h;
        }
        else {
            page.push(i);
            used += h;
        }
    });
    return pages.filter((p) => p.length > 0);
}
//# sourceMappingURL=layout.js.map