import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
    SNAPSHOT_DIR,
    CONTRIB_DOC_PATH,
    extractContribMetadata,
    renderContribGauge,
    generateContribMarkdown,
    type MetricInfo,
} from '../scripts/contrib-gallery';

const shouldUpdate = Boolean(process.env.UPDATE_CONTRIB);
const entries = extractContribMetadata();

describe('Contributed gauge SVG snapshots & auto-documentation', () => {
    const renderedMetrics = new Map<string, MetricInfo[]>();

    for (const entry of entries) {
        test(`gauge ${entry.uri} has JSDoc documentation and matches its deterministic SVG snapshot`, () => {
            expect(entry.description.length).toBeGreaterThan(10);
            expect(entry.sourceCode).toContain(`export function ${entry.funcName}`);

            const { svg, metrics } = renderContribGauge(entry.factory);
            renderedMetrics.set(entry.uri, metrics);

            // Structural sanity checks on rendered SVG
            expect(svg).toContain('<svg');
            expect(svg).not.toContain('NaN');
            expect(svg).not.toContain('&nbsp;');

            const expectedSvgPath = path.join(SNAPSHOT_DIR, `${entry.slug}.svg`);
            if (shouldUpdate) {
                fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
                fs.writeFileSync(expectedSvgPath, svg, 'utf8');
            }

            expect(
                fs.existsSync(expectedSvgPath),
                `Missing SVG snapshot at ${expectedSvgPath}. Run "npm run docs" to generate it.`
            ).toBe(true);
            const expectedSvg = fs.readFileSync(expectedSvgPath, 'utf8');
            expect(svg).toBe(expectedSvg);
        });
    }

    test('doc/CONTRIB.md is up to date with src/contrib/* metadata and metrics', () => {
        const enriched = entries.map(e => ({
            ...e,
            metrics: renderedMetrics.get(e.uri) ?? renderContribGauge(e.factory).metrics,
        }));
        const markdown = generateContribMarkdown(enriched);

        if (shouldUpdate) {
            fs.writeFileSync(CONTRIB_DOC_PATH, markdown, 'utf8');
        }

        expect(
            fs.existsSync(CONTRIB_DOC_PATH),
            `Missing ${CONTRIB_DOC_PATH}. Run "npm run docs" to generate it.`
        ).toBe(true);
        const existingDoc = fs.readFileSync(CONTRIB_DOC_PATH, 'utf8');
        expect(markdown).toBe(existingDoc);
    });
});
