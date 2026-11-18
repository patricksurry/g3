import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';
import * as d3 from 'd3';

import * as g3 from '../src/g3-contrib';
import { contrib } from '../src/contrib/__index__';
import { flatten } from '../src/common';
import { appendId } from '../src/mixin';
import type { GaugeComponent } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..');
export const CONTRIB_SRC_DIR = path.join(ROOT_DIR, 'src', 'contrib');
export const SNAPSHOT_DIR = path.join(ROOT_DIR, 'tests', 'contrib');
export const CONTRIB_DOC_PATH = path.join(ROOT_DIR, 'doc', 'CONTRIB.md');

export interface MetricInfo {
    metric: string;
    unit?: string;
}

export interface ParamDoc {
    name: string;
    type?: string;
    description: string;
}

export interface ContribEntryMeta {
    uri: string;
    slug: string;
    category: string;
    factory: (...args: any[]) => GaugeComponent;
    file: string;
    funcName: string;
    startLine: number;
    endLine: number;
    description: string;
    params: ParamDoc[];
    sourceCode: string;
}

function mulberry32(seed: number): () => number {
    return function() {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Walk a GaugeComponent tree to discover all configured metrics and units.
 */
export function reflectGaugeMetrics(root: GaugeComponent): MetricInfo[] {
    const seen = new Map<string, string | undefined>();

    function walk(node: any, inheritedInstance?: string) {
        if (!node || typeof node !== 'function') return;
        const inst = typeof node.instance === 'function' ? node.instance() ?? inheritedInstance : inheritedInstance;
        if (typeof node.metric === 'function') {
            const rawMetric = node.metric();
            const unit = typeof node.unit === 'function' ? node.unit() : undefined;
            if (rawMetric) {
                let qualified = rawMetric;
                if (inst === '..') {
                    qualified = rawMetric;
                } else if (inst) {
                    qualified = `${rawMetric}.${inst}`;
                }
                if (!seen.has(qualified) || (!seen.get(qualified) && unit)) {
                    seen.set(qualified, unit);
                }
            }
        }
        if (typeof node.append === 'function') {
            const kids = node.append();
            if (Array.isArray(kids)) {
                kids.forEach(k => walk(k, inst));
            }
        }
    }

    walk(root);
    return Array.from(seen.entries()).map(([metric, unit]) => ({ metric, unit }));
}

/**
 * Deterministically render a contributed gauge factory into a standalone SVG string
 * and reflect its configured metrics.
 */
export function renderContribGauge(factory: () => GaugeComponent): { svg: string; metrics: MetricInfo[] } {
    const origRandom = Math.random;
    const OrigDate = globalThis.Date;
    const origSetInterval = globalThis.setInterval;
    const origNextId = appendId.nextId;

    const MOCK_DATE_STRING = '2025-12-28T12:34:56-05:00';
    const MOCK_TIMESTAMP = new OrigDate(MOCK_DATE_STRING).getTime();

    class MockDate extends OrigDate {
        constructor(...args: any[]) {
            if (args.length === 0) {
                super(MOCK_TIMESTAMP);
            } else {
                // @ts-expect-error spread args into Date constructor
                super(...args);
            }
        }
        static now() {
            return MOCK_TIMESTAMP;
        }
    }

    Math.random = mulberry32(12345);
    globalThis.Date = MockDate as DateConstructor;
    appendId.nextId = 0;

    let tickFn: (() => void) | undefined;
    // @ts-expect-error override setInterval for single deterministic tick
    globalThis.setInterval = (fn: () => void) => {
        tickFn = fn;
        return 0;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);

    const origLog = console.log;
    console.log = () => {};

    try {
        const gauge = factory();
        const metrics = reflectGaugeMetrics(gauge);

        const p = g3.panel()
            .width(216)
            .height(216)
            .x(108)
            .y(108)
            .smooth(false)
            .append(gauge);

        p(d3.select(container));
        if (tickFn) tickFn();

        const svgEl = container.querySelector('svg')!;
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgEl.setAttribute('viewBox', '0 0 216 216');

        // Inline local image assets (e.g., speedmaster_logo.png) if present on disk
        svgEl.querySelectorAll('image').forEach(img => {
            const href = img.getAttribute('href') || img.getAttribute('xlink:href');
            if (href && !href.startsWith('data:') && !href.startsWith('http')) {
                const assetPath = path.join(ROOT_DIR, 'src', href);
                if (fs.existsSync(assetPath)) {
                    const b64 = fs.readFileSync(assetPath).toString('base64');
                    img.setAttribute('href', `data:image/png;base64,${b64}`);
                }
            }
        });

        // Collect all CSS classes used in this SVG so we only include relevant Emotion rules + global rules
        const usedClasses = new Set<string>();
        svgEl.querySelectorAll('[class]').forEach(el => {
            const cls = el.getAttribute('class') || '';
            cls.split(/\s+/).filter(Boolean).forEach(c => usedClasses.add(c));
        });

        const cssChunks: string[] = [];
        const allRules = Array.from(document.head.querySelectorAll('style'))
            .flatMap(s => (s.sheet ? Array.from(s.sheet.cssRules).map(r => r.cssText) : [s.textContent || '']))
            .filter(Boolean);

        for (const ruleText of allRules) {
            if (ruleText.startsWith('@font-face') || ruleText.startsWith('body ')) continue;
            const match = ruleText.match(/^\.css-([a-z0-9]+)\b/);
            if (match) {
                if (usedClasses.has(`css-${match[1]}`)) {
                    cssChunks.push(ruleText);
                }
            } else {
                cssChunks.push(ruleText);
            }
        }
        // Ensure standalone SVG inherits default font-family and has a transparent background
        cssChunks.push('svg { font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif; background: none; }');
        cssChunks.push('.g3-panel { background-color: transparent; fill: none; }');

        const defsEl = svgEl.querySelector('defs') || svgEl.insertBefore(
            document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
            svgEl.firstChild
        );
        const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = cssChunks.join('\n');
        defsEl.insertBefore(styleEl, defsEl.firstChild);

        return {
            svg: svgEl.outerHTML.replace(/&nbsp;/g, '&#160;').replace(/>(?=<)/g, '>\n') + '\n',
            metrics,
        };
    } finally {
        console.log = origLog;
        document.body.removeChild(container);
        Math.random = origRandom;
        globalThis.Date = OrigDate;
        globalThis.setInterval = origSetInterval;
        appendId.nextId = origNextId;
    }
}

/**
 * Parse src/contrib/__index__.ts and all referenced src/contrib/*.ts files
 * to extract JSDoc comments, parameter types, line numbers, and source code.
 */
export function extractContribMetadata(): ContribEntryMeta[] {
    const indexFile = path.join(CONTRIB_SRC_DIR, '__index__.ts');
    const indexSource = fs.readFileSync(indexFile, 'utf8');
    const indexAst = ts.createSourceFile(indexFile, indexSource, ts.ScriptTarget.Latest, true);

    // Map namespace import alias -> relative file path (e.g., 'dhc2nav' -> 'dhc2-nav.ts')
    const importMap = new Map<string, string>();
    indexAst.forEachChild(node => {
        if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
            const alias = node.importClause.namedBindings.name.text;
            const modSpec = (node.moduleSpecifier as ts.StringLiteral).text;
            importMap.set(alias, path.join(CONTRIB_SRC_DIR, `${modSpec.replace(/^\.\//, '')}.ts`));
        }
    });

    // Map URI (e.g. 'nav.airspeed.DHC2') -> { filePath, funcName }
    const uriToTarget = new Map<string, { filePath: string; funcName: string }>();

    function walkContribObject(obj: ts.ObjectLiteralExpression, prefix: string[]) {
        for (const prop of obj.properties) {
            if (!ts.isPropertyAssignment(prop) || !prop.name) continue;
            const key = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : '';
            const nextPrefix = [...prefix, key];
            if (ts.isObjectLiteralExpression(prop.initializer)) {
                walkContribObject(prop.initializer, nextPrefix);
            } else if (ts.isPropertyAccessExpression(prop.initializer)) {
                const ns = prop.initializer.expression.getText(indexAst);
                const fn = prop.initializer.name.text;
                const filePath = importMap.get(ns);
                if (filePath) {
                    uriToTarget.set(nextPrefix.join('.'), { filePath, funcName: fn });
                }
            }
        }
    }

    indexAst.forEachChild(node => {
        if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) && decl.name.text === 'contrib' && decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
                    walkContribObject(decl.initializer, []);
                }
            }
        }
    });

    // Cache parsed ASTs for each contrib module
    const moduleAstCache = new Map<string, { source: string; ast: ts.SourceFile }>();
    function getModuleAst(filePath: string) {
        if (!moduleAstCache.has(filePath)) {
            const source = fs.readFileSync(filePath, 'utf8');
            const ast = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
            moduleAstCache.set(filePath, { source, ast });
        }
        return moduleAstCache.get(filePath)!;
    }

    const gaugeDefs = flatten(contrib).filter(([, f]) => typeof f === 'function') as Array<[string[], (...args: any[]) => GaugeComponent]>;

    return gaugeDefs.map(([ks, factory]) => {
        const uri = ks.join('.');
        const slug = ks.join('-');
        const category = ks[0];
        const target = uriToTarget.get(uri);
        if (!target) {
            throw new Error(`Could not resolve AST target for contrib URI: ${uri}`);
        }

        const { source, ast } = getModuleAst(target.filePath);
        let startLine = 1;
        let endLine = 1;
        let description = '';
        let sourceCode = '';
        const params: ParamDoc[] = [];

        ast.forEachChild(node => {
            if (ts.isFunctionDeclaration(node) && node.name?.text === target.funcName) {
                const startPos = node.getStart(ast, false);
                const endPos = node.getEnd();
                startLine = ast.getLineAndCharacterOfPosition(startPos).line + 1;
                endLine = ast.getLineAndCharacterOfPosition(endPos).line + 1;
                sourceCode = source.slice(startPos, endPos);

                // Extract param types from signature
                const paramTypes = new Map<string, string>();
                for (const p of node.parameters) {
                    const pName = p.name.getText(ast);
                    const pType = p.type ? p.type.getText(ast) : 'any';
                    paramTypes.set(pName, pType);
                }

                // Extract JSDoc comment and @param tags
                const jsDocs = (node as any).jsDoc as ts.JSDoc[] | undefined;
                if (jsDocs && jsDocs.length > 0) {
                    const doc = jsDocs[jsDocs.length - 1];
                    description = typeof doc.comment === 'string'
                        ? doc.comment.replace(/\s+/g, ' ').trim()
                        : '';
                    if (doc.tags) {
                        for (const tag of doc.tags) {
                            if (ts.isJSDocParameterTag(tag)) {
                                const pName = tag.name.getText(ast);
                                const rawComment = typeof tag.comment === 'string' ? tag.comment : '';
                                const cleaned = rawComment.replace(/^\s*-\s*/, '').replace(/\s+/g, ' ').trim();
                                params.push({
                                    name: pName,
                                    type: paramTypes.get(pName),
                                    description: cleaned,
                                });
                            }
                        }
                    }
                }
            }
        });

        return {
            uri,
            slug,
            category,
            factory,
            file: path.relative(ROOT_DIR, target.filePath).replace(/\\/g, '/'),
            funcName: target.funcName,
            startLine,
            endLine,
            description,
            params,
            sourceCode,
        };
    });
}

const CATEGORY_TITLES: Record<string, string> = {
    nav: 'Flight Navigation (`g3.contrib.nav`)',
    radionav: 'Radio Navigation (`g3.contrib.radionav`)',
    engine: 'Engine Instruments (`g3.contrib.engine`)',
    electrical: 'Electrical Instruments (`g3.contrib.electrical`)',
    clocks: 'Clocks & Watches (`g3.contrib.clocks`)',
    switches: 'Switches & Controls (`g3.contrib.switches`)',
    debug: 'Debug & Layout Utilities (`g3.contrib.debug`)',
};

/**
 * Generate the full Markdown content for doc/CONTRIB.md.
 */
export function generateContribMarkdown(
    entries: Array<ContribEntryMeta & { metrics: MetricInfo[] }>
): string {
    const lines: string[] = [];

    lines.push('<!-- AUTO-GENERATED FILE: Do not edit directly. Run `npm run docs` to regenerate. -->');
    lines.push('');
    lines.push('# Contributed Gauge Gallery (`g3.contrib`)');
    lines.push('');
    lines.push('The `g3-contrib` bundle includes a collection of pre-configured gauges organized under `g3.contrib.*`.');
    lines.push('Each entry below is auto-generated from the TypeScript source in [`src/contrib/`](../src/contrib),');
    lines.push('combining JSDoc descriptions, runtime-reflected metric/unit bindings, a deterministic SVG render, and the factory source code.');
    lines.push('');
    lines.push('### Quick Overview');
    lines.push('');

    // Render a 5-column visual thumbnail grid
    const cols = 5;
    lines.push('| ' + Array(cols).fill(' ').join(' | ') + ' |');
    lines.push('| ' + Array(cols).fill(':---:').join(' | ') + ' |');
    for (let i = 0; i < entries.length; i += cols) {
        const row = entries.slice(i, i + cols).map(e => {
            return `<a href="#${e.slug}"><img src="../tests/contrib/${e.slug}.svg" width="110" alt="${e.uri}"><br><sub><code>${e.uri}</code></sub></a>`;
        });
        while (row.length < cols) row.push(' ');
        lines.push('| ' + row.join(' | ') + ' |');
    }
    lines.push('');

    // Group entries by top-level category
    const byCategory = new Map<string, Array<ContribEntryMeta & { metrics: MetricInfo[] }>>();
    for (const entry of entries) {
        if (!byCategory.has(entry.category)) {
            byCategory.set(entry.category, []);
        }
        byCategory.get(entry.category)!.push(entry);
    }

    for (const [cat, catEntries] of byCategory.entries()) {
        lines.push(`## ${CATEGORY_TITLES[cat] || cat}`);
        lines.push('');

        for (const e of catEntries) {
            const paramSig = e.params.length
                ? e.params.map(p => `[*${p.name}*: ${p.type || 'any'}]`).join(', ')
                : '';

            lines.push(`<a id="${e.slug}" href="#${e.slug}">#</a>`);
            lines.push(`g3.contrib.**${e.uri}**(${paramSig}) · [source](../${e.file}#L${e.startLine}-L${e.endLine})`);
            lines.push('');
            lines.push(`<img align="right" width="160" src="../tests/contrib/${e.slug}.svg" alt="g3.contrib.${e.uri}">`);
            lines.push('');
            if (e.description) {
                lines.push(e.description);
                lines.push('');
            }

            if (e.params.length > 0) {
                lines.push('**Parameters:**');
                for (const p of e.params) {
                    lines.push(`- \`${p.name}\` (*${p.type || 'any'}*): ${p.description}`);
                }
                lines.push('');
            }

            if (e.metrics.length > 0) {
                const formattedMetrics = e.metrics
                    .map(m => (m.unit ? `\`${m.metric}\` (\`${m.unit}\`)` : `\`${m.metric}\``))
                    .join(', ');
                lines.push(`**Metrics:** ${formattedMetrics}`);
            } else {
                lines.push('**Metrics:** *None (static gauge)*');
            }
            lines.push('');

            const lineCount = e.sourceCode.split('\n').length;
            lines.push('<details>');
            lines.push(`<summary>Factory implementation (<code>${e.file}</code>, ${lineCount} lines)</summary>`);
            lines.push('');
            lines.push('```ts');
            lines.push(e.sourceCode);
            lines.push('```');
            lines.push('</details>');
            lines.push('');
            lines.push('<br clear="both" />');
            lines.push('');
            lines.push('---');
            lines.push('');
        }
    }

    return lines.join('\n');
}
