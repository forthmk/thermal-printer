import type { Bitmap } from './bitmap.js';
export interface EscPosOptions {
    /** Lines to feed after each page (default 4). */
    feedLines?: number;
    /** Cut after each page (default true). */
    cut?: boolean;
    /** Rows per image band (default 128). */
    bandRows?: number;
}
export declare function encodeEscPos(pages: Bitmap[], opts?: EscPosOptions): Uint8Array;
