/* The Commissary's 50 × 30 mm Production Sheet label (Proceed Product Deliver). */
import type { ReceiptDocument } from '../src/index.js';

export interface CommissaryLabel {
    date: string; // mm/dd/yyyy
    product: string;
    type: string; // Pork, Beef, Chicken, Sauce …
    amountLabel: string; // "Quantity" or "Total Weight"
    amount: string; // "90 Pcs", "12.5 kg"
    deliverTo: string;
    reference?: string;
    preparedBy?: string;
}

export const commissaryLabel = (l: CommissaryLabel): ReceiptDocument => ({
    blocks: [
        { type: 'row', left: 'PRODUCTION SHEET', right: l.date, size: 'sm', bold: true },
        { type: 'divider' },
        { type: 'text', text: l.product, size: 'lg', bold: true, maxLines: 2 },
        { type: 'columns', cells: [{ text: 'TYPE' }, { text: l.amountLabel.toUpperCase() }], size: 'xs' },
        { type: 'columns', cells: [{ text: `■ ${l.type}` }, { text: l.amount }], size: 'md', bold: true },
        { type: 'field', label: 'Deliver To', value: l.deliverTo },
        { type: 'divider', thickness: 1 },
        { type: 'row', left: l.reference ?? '', right: l.preparedBy ? `Prepared by ${l.preparedBy}` : 'COMMISSARY', size: 'xs' },
    ],
});

// printReceipt(commissaryLabel({...}), { printer: niimbot(), paper: '50x30' });
