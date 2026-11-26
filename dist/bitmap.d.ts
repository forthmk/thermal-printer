export interface Bitmap {
    width: number;
    height: number;
    bytesPerRow: number;
    data: Uint8Array;
}
export declare function emptyBitmap(width: number, height: number): Bitmap;
export declare function isBlack(b: Bitmap, x: number, y: number): boolean;
export declare function setBlack(b: Bitmap, x: number, y: number): void;
/** RGBA pixels → black and white (anything darker than `threshold` is black). */
export declare function fromRgba(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number, threshold?: number): Bitmap;
export declare function fromCanvas(canvas: HTMLCanvasElement, threshold?: number): Bitmap;
/** Back to a canvas (the Niimbot library and the print screen want one). */
export declare function toCanvas(b: Bitmap): HTMLCanvasElement;
