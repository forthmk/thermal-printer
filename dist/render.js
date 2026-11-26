/* Render — the receipt drawn on canvas pages for the chosen paper, then turned
 * into black-and-white bitmaps (a thermal head can't print grey). */
import { fromCanvas } from './bitmap.js';
import { layout, paginate } from './layout.js';
import { resolvePaper } from './paper.js';
const cssFont = (f) => `${f.bold ? '700 ' : ''}${f.px}px ${f.family}`;
function canvasOf(width, height) {
    if (typeof document === 'undefined')
        throw new Error('Rendering a receipt needs a browser (or the app’s web view).');
    const c = document.createElement('canvas');
    c.width = width;
    c.height = Math.max(1, Math.ceil(height));
    return c;
}
/** Measures text with a canvas. */
export function canvasMeasure() {
    const ctx = canvasOf(1, 1).getContext('2d');
    return {
        width(text, font) {
            ctx.font = cssFont(font);
            return ctx.measureText(text).width;
        },
    };
}
function drawLine(ctx, line, x0, y, width) {
    if (line.rule) {
        const top = y + Math.floor((line.height - line.rule.thickness) / 2);
        if (line.rule.dashed) {
            for (let x = 0; x < width; x += 12)
                ctx.fillRect(x0 + x, top, 7, line.rule.thickness);
        }
        else {
            ctx.fillRect(x0, top, width, line.rule.thickness);
        }
    }
    for (const run of line.runs) {
        ctx.font = cssFont(run.font);
        ctx.textAlign = run.align;
        const x = x0 + run.x + (run.align === 'center' ? run.boxWidth / 2 : run.align === 'right' ? run.boxWidth : 0);
        ctx.fillText(run.text, x, y + (line.height - run.font.px) / 2);
    }
}
/** The receipt as pages for `paper`: one per label, or one long page on a roll. */
export function renderReceipt(doc, paperIn, measure = canvasMeasure()) {
    const paper = typeof paperIn === 'object' && 'widthDots' in paperIn ? paperIn : resolvePaper(paperIn);
    const margin = doc.margin ?? 8;
    const inner = paper.widthDots - margin * 2;
    const lines = layout(doc, inner, measure);
    const usable = paper.heightDots === null ? null : paper.heightDots - margin * 2;
    const pages = paginate(lines.map((l) => l.height), usable);
    return pages.map((indexes) => {
        const used = indexes.reduce((t, i) => t + lines[i].height, 0);
        const canvas = canvasOf(paper.widthDots, paper.heightDots ?? used + margin * 2);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'top';
        let y = margin;
        for (const i of indexes) {
            drawLine(ctx, lines[i], margin, y, inner);
            y += lines[i].height;
        }
        return { canvas, bitmap: fromCanvas(canvas) };
    });
}
//# sourceMappingURL=render.js.map