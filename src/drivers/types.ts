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
export class PrintCancelled extends Error {
    constructor(message = 'No printer was chosen.') {
        super(message);
        this.name = 'PrintCancelled';
    }
}

/** Inside a Capacitor APK (Android / iOS app), not a browser. */
export function inNativeApp(): boolean {
    const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!cap?.isNativePlatform?.();
}

/** Web Bluetooth is there and allowed (Chrome / Edge on a secure address). */
export function webBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator && typeof window !== 'undefined' && window.isSecureContext;
}
