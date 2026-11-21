import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as d3 from 'd3';
import * as g3 from '../src/g3';
import { contrib } from '../src/contrib/__index__';
import { ROOT_DIR, renderContribGauge } from '../scripts/contrib-gallery';

const COOKBOOK_PATH = path.join(ROOT_DIR, 'doc', 'COOKBOOK.md');
const SNAPSHOT_DIR = path.join(ROOT_DIR, 'tests', 'cookbook');
const shouldUpdate = Boolean(process.env.UPDATE_CONTRIB);

const markdown = fs.readFileSync(COOKBOOK_PATH, 'utf8');
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// every ```js block in the cookbook defines a `gauge`, named after the recipe heading above it
const snippets = Array.from(markdown.matchAll(/^### (.+)$|^```js\n([\s\S]*?)^```$/gm)).reduce<{
    heading: string;
    blocks: { heading: string; slug: string; code: string }[];
}>(
    (acc, m) => {
        if (m[1]) acc.heading = m[1];
        else acc.blocks.push({ heading: acc.heading, slug: slugify(acc.heading), code: m[2] });
        return acc;
    },
    { heading: '', blocks: [] }
).blocks;

describe('doc/COOKBOOK.md snippets', () => {
    test('has snippets, one per recipe', () => {
        expect(snippets.length).toBeGreaterThan(5);
        expect(new Set(snippets.map(s => s.slug)).size).toBe(snippets.length);
    });

    for (const { heading, slug, code } of snippets) {
        test(`"${heading}" renders and matches its snapshot`, () => {
            const make = new Function('g3', 'd3', `${code}\nreturn gauge;`);
            const { svg } = renderContribGauge(() => make({ ...g3, contrib }, d3));
            expect(svg).toContain('<svg');
            expect(svg).not.toContain('NaN');
            expect(svg).not.toContain('undefined');

            const snapshotPath = path.join(SNAPSHOT_DIR, `${slug}.svg`);
            if (shouldUpdate) {
                fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
                fs.writeFileSync(snapshotPath, svg, 'utf8');
            }
            expect(
                fs.existsSync(snapshotPath),
                `Missing snapshot ${snapshotPath}. Run "npm run docs" to generate it.`
            ).toBe(true);
            expect(svg).toBe(fs.readFileSync(snapshotPath, 'utf8'));
            expect(markdown, `doc/COOKBOOK.md should show /tests/cookbook/${slug}.svg`).toContain(
                `/tests/cookbook/${slug}.svg`
            );
        });
    }
});
