import type { Paper } from '../paper.js';
import type { RenderedPage } from '../render.js';
export type PrintStep = 'connecting' | 'printing';
export interface DriverPrintOptions {
    /** Copies of the whole receipt (default 1). */
    copies?: number;
    onStep?: (step: PrintStep) => void;
}
/** A way to reach a printer. Resolves once the printer has printed (or, for
 *  the print screen, once it has been shown). */
export interface PrinterDriver {
    readonly name: string;
    /** Can it be used here (this browser / the app)? */
    supported(): boolean;
    print(pages: RenderedPage[], paper: Paper, opts?: DriverPrintOptions): Promise<void>;
    /** Forget the connected printer (the next print asks again). */
    disconnect?(): Promise<void>;
}
/** The person closed the "choose a printer" list without picking one. */
export declare class PrintCancelled extends Error {
    constructor(message?: string);
}
/** Inside a Capacitor APK (Android / iOS app), not a browser. */
export declare function inNativeApp(): boolean;
/** Web Bluetooth is there and allowed (Chrome / Edge on a secure address). */
export declare function webBluetoothAvailable(): boolean;
