/* A POS sales receipt — 50 × 80 mm labels, or a 58 / 80 mm roll. */
import type { Block, ReceiptDocument } from '../src/index.js';

export interface PosSale {
    store: string;
    address?: string;
    orNo: string;
    date: string;
    cashier: string;
    items: { name: string; qty: number; price: number }[];
    discount?: number;
    cash: number;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function posReceipt(s: PosSale): ReceiptDocument {
    const subtotal = s.items.reduce((t, i) => t + i.qty * i.price, 0);
    const total = subtotal - (s.discount ?? 0);
    const items: Block[] = s.items.flatMap((i): Block[] => [
        { type: 'text', text: i.name, size: 'sm', bold: true, wrap: false },
        { type: 'row', left: `  ${i.qty} × ${peso(i.price)}`, right: peso(i.qty * i.price), size: 'sm' },
    ]);
    return {
        blocks: [
            { type: 'text', text: s.store, size: 'lg', bold: true, align: 'center' },
            ...(s.address ? [{ type: 'text', text: s.address, size: 'xs', align: 'center' } as Block] : []),
            { type: 'divider', style: 'dashed' },
            { type: 'row', left: `OR No. ${s.orNo}`, right: s.date, size: 'xs' },
            { type: 'text', text: `Cashier: ${s.cashier}`, size: 'xs' },
            { type: 'divider', style: 'dashed' },
            ...items,
            { type: 'divider' },
            { type: 'row', left: 'Subtotal', right: peso(subtotal), size: 'sm' },
            ...(s.discount ? [{ type: 'row', left: 'Discount', right: `-${peso(s.discount)}`, size: 'sm' } as Block] : []),
            { type: 'row', left: 'TOTAL', right: peso(total), size: 'lg', bold: true },
            { type: 'row', left: 'Cash', right: peso(s.cash), size: 'sm' },
            { type: 'row', left: 'Change', right: peso(s.cash - total), size: 'sm', bold: true },
            { type: 'space', height: 12 },
            { type: 'text', text: 'Thank you!', size: 'md', bold: true, align: 'center' },
        ],
    };
}

// printReceipt(posReceipt(sale), { printer: niimbot(), paper: '50x80' });
// printReceipt(posReceipt(sale), { printer: escpos({ transport: webBluetoothTransport() }), paper: '58mm' });
