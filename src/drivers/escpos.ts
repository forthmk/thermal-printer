/* ──────────────────────────────────────────────────────────────────────────
 * ESC/POS receipt printers (58 / 80 mm). The receipt is encoded once
 * (encodeEscPos); how the bytes reach the printer is a "transport":
 *
 *   escpos({ transport: webBluetoothTransport() })   Chrome / Edge, BLE printers
 *   escpos({ transport: { write: bytes => … } })      anything else — e.g. in the
 *                                                     APK, a Capacitor Bluetooth
 *                                                     (classic SPP), USB or TCP
 *                                                     plugin's write()
 *
 * Many cheap receipt printers are "classic" Bluetooth, which browsers can't
 * reach at all — in the APK, pass a transport from a Bluetooth-serial plugin.
 * ────────────────────────────────────────────────────────────────────────── */
import { encodeEscPos, type EscPosOptions } from '../escpos.js';
import type { Paper } from '../paper.js';
import type { RenderedPage } from '../render.js';
import { PrintCancelled, webBluetoothAvailable, type DriverPrintOptions, type PrinterDriver } from './types.js';

export interface Transport {
    /** Connect if needed (may show a device list). */
    open?(): Promise<void>;
    write(bytes: Uint8Array): Promise<void>;
    close?(): Promise<void>;
    /** Usable here? Default: yes. */
    supported?(): boolean;
}

export interface EscPosDriverOptions extends EscPosOptions {
    transport: Transport;
}

export function escpos(options: EscPosDriverOptions): PrinterDriver {
    const { transport, ...encode } = options;
    let busy = false;
    return {
        name: 'escpos',
        supported: () => transport.supported?.() ?? true,
        async print(pages: RenderedPage[], _paper: Paper, opts: DriverPrintOptions = {}) {
            if (busy) throw new Error('The printer is still printing the last receipt.');
            busy = true;
            try {
                opts.onStep?.('connecting');
                await transport.open?.();
                opts.onStep?.('printing');
                const copies = Math.max(1, opts.copies ?? 1);
                const bitmaps = Array.from({ length: copies }, () => pages.map((p) => p.bitmap)).flat();
                await transport.write(encodeEscPos(bitmaps, encode));
            } finally {
                busy = false;
            }
        },
        disconnect: async () => transport.close?.(),
    };
}

/* ── Web Bluetooth (BLE) transport ─────────────────────────────────────────── */

// The write services BLE receipt printers usually expose.
const PRINTER_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    '0000ff00-0000-1000-8000-00805f9b34fb',
];

interface BleCharacteristic {
    properties: { write: boolean; writeWithoutResponse: boolean };
    writeValueWithoutResponse?(v: BufferSource): Promise<void>;
    writeValue(v: BufferSource): Promise<void>;
}

export function webBluetoothTransport(opts: { services?: string[]; chunkSize?: number } = {}): Transport {
    const services = opts.services ?? PRINTER_SERVICES;
    const chunk = opts.chunkSize ?? 180;
    let device: { gatt?: { connected: boolean; connect(): Promise<unknown>; disconnect(): void } } | null = null;
    let ch: BleCharacteristic | null = null;

    return {
        supported: webBluetoothAvailable,
        async open() {
            if (ch && device?.gatt?.connected) return;
            const bt = (navigator as unknown as { bluetooth: { requestDevice(o: unknown): Promise<any> } }).bluetooth;
            try {
                device = await bt.requestDevice({ acceptAllDevices: true, optionalServices: services });
            } catch (e) {
                if ((e as { name?: string })?.name === 'NotFoundError') throw new PrintCancelled();
                throw e;
            }
            const server: any = await device!.gatt!.connect();
            for (const uuid of services) {
                try {
                    const service = await server.getPrimaryService(uuid);
                    for (const c of (await service.getCharacteristics()) as BleCharacteristic[]) {
                        if (c.properties.write || c.properties.writeWithoutResponse) {
                            ch = c;
                            return;
                        }
                    }
                } catch {
                    /* not this service */
                }
            }
            throw new Error('This Bluetooth device doesn’t look like a receipt printer (no print service).');
        },
        async write(bytes) {
            if (!ch) throw new Error('The printer isn’t connected.');
            for (let i = 0; i < bytes.length; i += chunk) {
                const part = bytes.slice(i, i + chunk);
                if (ch.properties.writeWithoutResponse && ch.writeValueWithoutResponse) await ch.writeValueWithoutResponse(part);
                else await ch.writeValue(part);
            }
        },
        async close() {
            device?.gatt?.disconnect();
            device = null;
            ch = null;
        },
    };
}
