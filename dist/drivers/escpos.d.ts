import { type EscPosOptions } from '../escpos.js';
import { type PrinterDriver } from './types.js';
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
export declare function escpos(options: EscPosDriverOptions): PrinterDriver;
export declare function webBluetoothTransport(opts?: {
    services?: string[];
    chunkSize?: number;
}): Transport;
