/** The person closed the "choose a printer" list without picking one. */
export class PrintCancelled extends Error {
    constructor(message = 'No printer was chosen.') {
        super(message);
        this.name = 'PrintCancelled';
    }
}
/** Inside a Capacitor APK (Android / iOS app), not a browser. */
export function inNativeApp() {
    const cap = globalThis.Capacitor;
    return !!cap?.isNativePlatform?.();
}
/** Web Bluetooth is there and allowed (Chrome / Edge on a secure address). */
export function webBluetoothAvailable() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator && typeof window !== 'undefined' && window.isSecureContext;
}
//# sourceMappingURL=types.js.map