import { type PrinterDriver } from './types.js';
export interface NiimbotOptions {
    /** 1 (light) … 5 (dark). Default 3, the NIIMBOT app's default for the B1. */
    density?: number;
    /** Printer names to reconnect to without the list (Chrome's new Bluetooth permissions). */
    namePattern?: RegExp;
}
export declare function niimbot(options?: NiimbotOptions): PrinterDriver;
