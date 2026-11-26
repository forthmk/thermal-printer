import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { layout, paginate, wrap, type Measure } from '../src/layout.js';

// Every character is as wide as half the font size.
const measure: Measure = { width: (t, f) => t.length * f.px * 0.5 };
const font = { px: 20, bold: false, family: 'x' };

describe('wrap', () => {
    test('breaks on words within the width', () => {
        assert.deepEqual(wrap(measure, 'aaa bbb ccc', font, 80), ['aaa bbb', 'ccc']);
    });
    test('maxLines ends the last line in …', () => {
        const lines = wrap(measure, 'aaa bbb ccc ddd eee', font, 80, 2);
        assert.equal(lines.length, 2);
        assert.ok(lines[1].endsWith('…'));
        assert.ok(measure.width(lines[1], font) <= 80);
    });
});

describe('paginate', () => {
    test('a roll is one page', () => {
        assert.deepEqual(paginate([30, 30, 30], null), [[0, 1, 2]]);
    });
    test('labels: the line that doesn’t fit starts the next label', () => {
        assert.deepEqual(paginate([100, 100, 100, 50], 224), [[0, 1], [2, 3]]);
    });
    test('a line taller than a label gets one of its own', () => {
        assert.deepEqual(paginate([300, 10], 224), [[0], [1]]);
    });
});

describe('layout', () => {
    test('a row puts the right text in full and cuts the left', () => {
        const [line] = layout({ blocks: [{ type: 'row', left: 'A very long product name', right: '₱100.00', size: 20 }] }, 200, measure);
        assert.equal(line.runs[1].text, '₱100.00');
        assert.ok(line.runs[0].text.endsWith('…'));
    });
    test('field = small label line + bold value', () => {
        const lines = layout({ blocks: [{ type: 'field', label: 'Deliver to', value: 'LNT Borromeo' }] }, 300, measure);
        assert.equal(lines[0].runs[0].text, 'DELIVER TO');
        assert.equal(lines[1].runs[0].font.bold, true);
    });
});
