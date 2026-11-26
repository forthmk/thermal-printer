import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePaper } from '../src/paper.js';

describe('paper', () => {
    test('50x30: a 48 mm print head on a 30 mm label', () => {
        assert.deepEqual(resolvePaper('50x30'), { name: '50x30', widthMm: 50, heightMm: 30, labels: true, widthDots: 384, heightDots: 240 });
    });
    test('50x80: the same width, 80 mm long', () => {
        const p = resolvePaper('50x80');
        assert.equal(p.widthDots, 384);
        assert.equal(p.heightDots, 640);
    });
    test('58 and 80 mm rolls are continuous', () => {
        assert.equal(resolvePaper('58mm').heightDots, null);
        assert.equal(resolvePaper('58mm').labels, false);
        assert.equal(resolvePaper('80mm').widthDots, 576);
    });
    test('a custom size, and a bad one', () => {
        assert.equal(resolvePaper({ widthMm: 40, heightMm: 70 }).widthDots, 320);
        assert.throws(() => resolvePaper({ widthMm: 0, heightMm: 30 }));
        assert.throws(() => resolvePaper('A4' as never));
    });
});
