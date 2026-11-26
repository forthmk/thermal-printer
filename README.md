# @forthmk/thermal-printer

Thermal printing for the **POS** and the **Commissary**: describe a receipt once, print it on any paper size, to any printer, from the browser or the APK.

| | |
|---|---|
| **Paper** | `50x30` (Commissary label), `50x80` (POS label), `58mm` / `80mm` rolls, or your own size |
| **Printers** | Niimbot label printers (B1, B21, D110 …) · ESC/POS receipt printers (Epson, Xprinter …) · the print screen / Save as PDF |
| **Where** | Capacitor APK (Android Bluetooth) · Chrome / Edge (Web Bluetooth) · any browser (print screen) |

## Install

From GitHub (no registry needed):

```bash
pnpm add github:forthmk/thermal-printer
```

For Niimbot printers also add the Bluetooth library (an optional peer):

```bash
pnpm add @mmote/niimbluelib@0.49.1
```

## Use

```ts
import { printReceipt, niimbot, browserPrint, pickPrinter, PrintCancelled } from '@forthmk/thermal-printer';

// Make the printer once (it stays connected) — Niimbot where it works, else the print screen.
const printer = pickPrinter(niimbot(), browserPrint());

await printReceipt(
    {
        blocks: [
            { type: 'row', left: 'PRODUCTION SHEET', right: '11/24/2026', size: 'sm', bold: true },
            { type: 'divider' },
            { type: 'text', text: 'Chicken Inasal', size: 'lg', bold: true },
            { type: 'columns', cells: [{ text: 'TYPE' }, { text: 'QUANTITY' }], size: 'xs' },
            { type: 'columns', cells: [{ text: '■ Chicken' }, { text: '90 Pcs' }], bold: true },
            { type: 'field', label: 'Deliver To', value: 'LNT Borromeo' },
        ],
    },
    { printer, paper: '50x30', onStep: (s) => console.log(s) }, // rendering → connecting → printing
);
```

`printReceipt` resolves when the printer reports the label printed — so an app can save an order only after its receipt is out. If the person closes the "choose a printer" list it throws `PrintCancelled`.

Ready-made layouts to copy: [examples/commissary-label.ts](examples/commissary-label.ts) (50 × 30) and [examples/pos-receipt.ts](examples/pos-receipt.ts) (50 × 80 or a roll).

### Blocks

| Block | Prints |
|---|---|
| `{ type: 'text', text, size?, bold?, align?, wrap?, maxLines? }` | a paragraph (wraps; `maxLines` ends in "…") |
| `{ type: 'row', left, right, size?, bold? }` | `Item ……… ₱99.00` on one line |
| `{ type: 'columns', cells: [{ text, width?, align? }], size? }` | columns on one line |
| `{ type: 'field', label, value }` | small `LABEL` over a bold value |
| `{ type: 'divider', style?: 'solid' \| 'dashed' }` | a line across |
| `{ type: 'space', height? }` | blank space (8 dots = 1 mm) |

Sizes: `xs` 14 · `sm` 16 · `md` 20 · `lg` 26 · `xl` 34 dots tall, or a number.

### Paper

| `paper` | Size | How it prints |
|---|---|---|
| `'50x30'` | 50 × 30 mm labels | a fixed label |
| `'50x80'` | 50 × 80 mm labels | a fixed label; a longer receipt carries on to the next one |
| `'58mm'` | 58 mm roll | continuous — as long as the receipt |
| `'80mm'` | 80 mm roll | continuous (needs an 80 mm printer) |
| `{ widthMm, heightMm }` | your own | `heightMm: null` for a roll |

Drawn at 8 dots per mm, as wide as the print head: 48 mm on 50 / 58 mm paper, 72 mm on 80 mm.

### Printers

```ts
niimbot({ density: 3 })                                    // Niimbot, Bluetooth (BLE)
escpos({ transport: webBluetoothTransport() })             // BLE receipt printer in Chrome
escpos({ transport: { write: (bytes) => plugin.write(bytes) } }) // anything else: a Capacitor
                                                           // Bluetooth-serial / USB / TCP plugin
browserPrint()                                             // the print screen, any device
```

Many cheap receipt printers use **classic** Bluetooth, which browsers can't reach — in the APK, give `escpos` a transport from a Bluetooth-serial plugin.

## In the APK (Capacitor)

Inside the app there's no Chrome flag and no "secure address" rule — Bluetooth is Android's own.

1. In the app: `pnpm add @capacitor-community/bluetooth-le` then `npx cap sync android`.
2. `niimbot()` sees it's in the app and uses the plugin by itself.
3. Android asks for **Nearby devices** the first time — tap Allow.

## In Chrome (no APK)

Web Bluetooth needs Chrome or Edge on a secure address: `localhost`, `https`, or for an `http://192.168.x.x` address turn on `chrome://flags/#unsafely-treat-insecure-origin-as-secure` with that address. iPhone / iPad browsers have no Bluetooth — `pickPrinter` falls back to the print screen there.

## Develop

```bash
pnpm install
pnpm test        # node:test — paper, layout / pages, ESC/POS bytes
pnpm typecheck
pnpm build       # → dist/
```

**`dist/` is committed** — the apps install straight from GitHub, so run `pnpm build` before each commit.
