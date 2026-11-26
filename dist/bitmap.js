/* A printed page as pure black and white: 1 bit per dot, rows packed 8 dots
 * to a byte (left dot = highest bit), 1 = black. Every driver prints this. */
export function emptyBitmap(width, height) {
    const bytesPerRow = Math.ceil(width / 8);
    return { width, height, bytesPerRow, data: new Uint8Array(bytesPerRow * height) };
}
export function isBlack(b, x, y) {
    return (b.data[y * b.bytesPerRow + (x >> 3)] & (0x80 >> (x & 7))) !== 0;
}
export function setBlack(b, x, y) {
    b.data[y * b.bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
}
/** RGBA pixels → black and white (anything darker than `threshold` is black). */
export function fromRgba(rgba, width, height, threshold = 150) {
    const b = emptyBitmap(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const alpha = rgba[i + 3] / 255;
            // Transparent counts as white paper.
            const lum = (rgba[i] * 0.3 + rgba[i + 1] * 0.59 + rgba[i + 2] * 0.11) * alpha + 255 * (1 - alpha);
            if (lum < threshold)
                setBlack(b, x, y);
        }
    }
    return b;
}
export function fromCanvas(canvas, threshold) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('This browser cannot draw a receipt (no canvas).');
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return fromRgba(img.data, canvas.width, canvas.height, threshold);
}
/** Back to a canvas (the Niimbot library and the print screen want one). */
export function toCanvas(b) {
    const canvas = document.createElement('canvas');
    canvas.width = b.width;
    canvas.height = b.height;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(b.width, b.height);
    for (let y = 0; y < b.height; y++) {
        for (let x = 0; x < b.width; x++) {
            const v = isBlack(b, x, y) ? 0 : 255;
            const i = (y * b.width + x) * 4;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
}
//# sourceMappingURL=bitmap.js.map