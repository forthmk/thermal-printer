import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBitmap, setBlack, fromRgba, isBlack } from '../src/bitmap.js';
import { encodeEscPos } from '../src/escpos.js';

describe('bitmap', () => {
    test('dark pixels are black, light and transparent ones white', () => {
        const rgba = new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0]);
        const b = fromRgba(rgba, 3, 1);
        assert.deepEqual([isBlack(b, 0, 0), isBlack(b, 1, 0), isBlack(b, 2, 0)], [true, false, false]);
    });
});

describe('encodeEscPos', () => {
    test('reset, one raster band, feed and cut', () => {
        const b = emptyBitmap(16, 2);
        setBlack(b, 0, 0);
        const out = Array.from(encodeEscPos([b]));
        assert.deepEqual(out.slice(0, 2), [0x1b, 0x40]);
        assert.deepEqual(out.slice(2, 10), [0x1d, 0x76, 0x30, 0x00, 2, 0, 2, 0]);
        assert.deepEqual(out.slice(10, 14), [0x80, 0, 0, 0]);
        assert.deepEqual(out.slice(14), [0x1b, 0x64, 4, 0x1d, 0x56, 0x42, 0x00]);
    });
    test('tall pages go in bands; no cut when asked', () => {
        const out = Array.from(encodeEscPos([emptyBitmap(8, 300)], { bandRows: 128, cut: false, feedLines: 0 }));
        const bands = out.filter((v, i) => v === 0x1d && out[i + 1] === 0x76).length;
        assert.equal(bands, 3);
        assert.ok(!out.includes(0x56));
    });
});
