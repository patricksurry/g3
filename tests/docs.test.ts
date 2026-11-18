import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../scripts/contrib-gallery';
import * as g3 from '../src/g3';

const API_DOC_PATH = path.join(ROOT_DIR, 'doc', 'API.md');

// Internal/utility helpers exported by g3 modules that are not top-level builder APIs
const INTERNAL_EXPORTS = new Set([
    'd3sel',
    'flatten',
    'controller',
    'convertUnits',
    'gaugeController',
    'pointer',
    'pointers',
    'normal',
    'randomTrigger',
]);

describe('Documentation consistency (doc/API.md)', () => {
    const apiMarkdown = fs.readFileSync(API_DOC_PATH, 'utf8');

    it('should only link to existing /src/*.ts files', () => {
        const linkRegex = /\(\/src\/([^)#\s]+)(?:#L\d+(?:-L\d+)?)?\)/g;
        const matches = Array.from(apiMarkdown.matchAll(linkRegex));
        expect(matches.length).toBeGreaterThan(20);

        for (const m of matches) {
            const relFile = m[1];
            expect(relFile.endsWith('.ts')).toBe(true);
            const fullPath = path.join(ROOT_DIR, 'src', relFile);
            expect(fs.existsSync(fullPath), `Missing source file referenced in doc/API.md: /src/${relFile}`).toBe(true);
        }
    });

    it('should document every public g3 builder function with an #g3-<name> anchor', () => {
        const exportedFunctions = Object.entries(g3)
            .filter(([name, val]) => typeof val === 'function' && !INTERNAL_EXPORTS.has(name))
            .map(([name]) => name);

        expect(exportedFunctions.length).toBeGreaterThan(15);

        for (const fnName of exportedFunctions) {
            expect(
                apiMarkdown,
                `Expected doc/API.md to contain anchor id="g3-${fnName}"`
            ).toContain(`id="g3-${fnName}"`);
        }
    });
});
