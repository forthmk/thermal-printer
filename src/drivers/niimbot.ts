/* ──────────────────────────────────────────────────────────────────────────
 * Niimbot label printers (B1, B21, D110 …) over Bluetooth, through
 * @mmote/niimbluelib (install it in the app: it's an optional peer).
 *
 *   in the APK (Capacitor)   Android's own Bluetooth — needs the
 *                            @capacitor-community/bluetooth-le plugin in the app
 *   in Chrome / Edge         Web Bluetooth (https, localhost, or the
 *                            "insecure origin" flag for an http IP)
 *
 * The printer picked once stays connected until the page / app closes.
 * Prints all pages in one job and resolves when the printer says it's done.
 * ────────────────────────────────────────────────────────────────────────── */
import type { Paper } from '../paper.js';
import type { RenderedPage } from '../render.js';
import { inNativeApp, PrintCancelled, webBluetoothAvailable, type DriverPrintOptions, type PrinterDriver } from './types.js';

export interface NiimbotOptions {
    /** 1 (light) … 5 (dark). Default 3, the NIIMBOT app's default for the B1. */
    density?: number;
    /** Printer names to reconnect to without the list (Chrome's new Bluetooth permissions). */
    namePattern?: RegExp;
}

type Lib = typeof import('@mmote/niimbluelib');
type Client = InstanceType<Lib['NiimbotBluetoothClient']> | InstanceType<Lib['NiimbotCapacitorBleClient']>;
type WebConnectOptions = NonNullable<Parameters<InstanceType<Lib['NiimbotBluetoothClient']>['connect']>[0]>;

async function loadLib(): Promise<Lib> {
    try {
        return await import('@mmote/niimbluelib');
    } catch {
        throw new Error('Niimbot printing needs @mmote/niimbluelib — add it to the app: pnpm add @mmote/niimbluelib');
    }
}

export function niimbot(options: NiimbotOptions = {}): PrinterDriver {
    let client: Client | null = null;
    let busy = false;
    const namePattern = options.namePattern ?? /^(B1|B18|B21|B3|D1|niimbot)/i;

    async function connect(lib: Lib): Promise<Client> {
        if (client?.isConnected()) return client;
        const next: Client = inNativeApp() ? new lib.NiimbotCapacitorBleClient() : new lib.NiimbotBluetoothClient();
        next.on('disconnect', () => {
            if (client === next) client = null;
        });
        try {
            if (next instanceof lib.NiimbotBluetoothClient) {
                // A printer allowed before reconnects without the list, when Chrome can.
                let authorizedDevice: WebConnectOptions['authorizedDevice'];
                try {
                    const bt = (navigator as unknown as { bluetooth: { getDevices?: () => Promise<{ name?: string }[]> } }).bluetooth;
                    authorizedDevice = ((await bt.getDevices?.()) ?? []).find((d) => namePattern.test(d.name ?? '')) as typeof authorizedDevice;
                } catch {
                    /* no getDevices: the list shows */
                }
                await next.connect(authorizedDevice ? { authorizedDevice } : undefined);
            } else {
                await next.connect();
            }
        } catch (e) {
            const name = (e as { name?: string })?.name;
            const message = String((e as { message?: string })?.message ?? e);
            if (name === 'NotFoundError' || /cancel/i.test(message)) throw new PrintCancelled();
            throw e;
        }
        client = next;
        return next;
    }

    return {
        name: 'niimbot',
        supported: () => inNativeApp() || webBluetoothAvailable(),

        async print(pages: RenderedPage[], paper: Paper, opts: DriverPrintOptions = {}) {
            if (!this.supported()) {
                throw new Error('This browser can’t reach a Bluetooth printer. Use the app, or Chrome on Android or a computer.');
            }
            if (busy) throw new Error('The printer is still printing the last receipt.');
            busy = true;
            try {
                const lib = await loadLib();
                opts.onStep?.('connecting');
                const c = await connect(lib);
                const meta = c.getModelMetadata();
                if (meta && meta.printheadPixels < paper.widthDots) {
                    throw new Error(`This printer (${meta.model}) prints ${meta.printheadPixels / 8} mm wide — too narrow for ${paper.name}.`);
                }
                opts.onStep?.('printing');
                const copies = Math.max(1, opts.copies ?? 1);
                const task = c.protocol.newPrintTask(c.getPrintTaskType() ?? 'B1', {
                    totalPages: pages.length * copies,
                    density: options.density ?? 3,
                    labelType: paper.labels ? lib.LabelType.WithGaps : lib.LabelType.Continuous,
                });
                try {
                    await task.printInit();
                    for (let copy = 0; copy < copies; copy++) {
                        for (const page of pages) {
                            const image = lib.ImageEncoder.encodeCanvas(page.canvas, lib.PageColorType.SingleColor, meta?.printDirection ?? 'top');
                            await task.printPage(image, 1);
                            await task.waitForPageFinished();
                        }
                    }
                    await task.waitForFinished();
                } finally {
                    await task.printEnd().catch(() => undefined);
                }
            } finally {
                busy = false;
            }
        },

        async disconnect() {
            const c = client;
            client = null;
            await c?.disconnect().catch(() => undefined);
        },
    };
}
