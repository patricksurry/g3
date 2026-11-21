import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as d3 from 'd3';
import * as g3 from '../src/g3';
import { contrib } from '../src/contrib/__index__';
import { ROOT_DIR, renderContribGauge } from '../scripts/contrib-gallery';

const COOKBOOK_PATH = path.join(ROOT_DIR, 'doc', 'COOKBOOK.md');

// every ```js block in the cookbook defines a `gauge`; check that each one renders cleanly
const snippets = Array.from(
    fs.readFileSync(COOKBOOK_PATH, 'utf8').matchAll(/^### (.+)$|^```js\n([\s\S]*?)^```$/gm)
).reduce<{ heading: string; blocks: [string, string][] }>(
    (acc, m) => {
        if (m[1]) acc.heading = m[1];
        else acc.blocks.push([acc.heading, m[2]]);
        return acc;
    },
    { heading: '', blocks: [] }
).blocks;

describe('doc/COOKBOOK.md snippets', () => {
    test('has snippets', () => expect(snippets.length).toBeGreaterThan(5));

    for (const [heading, code] of snippets) {
        test(`"${heading}" renders`, () => {
            const make = new Function('g3', 'd3', `${code}\nreturn gauge;`);
            const { svg } = renderContribGauge(() => make({ ...g3, contrib }, d3));
            expect(svg).toContain('<svg');
            expect(svg).not.toContain('NaN');
            expect(svg).not.toContain('undefined');
        });
    }
});
