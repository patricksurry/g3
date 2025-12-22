import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { contrib } from '../src/contrib/__index__.js';
import { flatten } from '../src/common.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gaugeDefs = flatten(contrib).filter(([, f]) => typeof f === 'function');
const gaugeURIs = gaugeDefs.map(([ks]) => ks.join('.'));

// HTML template to render a single gauge
const htmlTemplate = (gaugeURI, distPath) => `
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="file://${distPath}"></script>
    <script>
        g3.panel().width(480).height(480).x(240).y(240).scale(2).append(
            g3.contrib.${gaugeURI}()
        )('body')
    </script>
  </body>
</html>
`;

const SCRIPT_PATH = path.resolve(__dirname, '../scripts/render-png.js');
const DIST_PATH = path.resolve(__dirname, '../dist/g3-contrib.min.js');
const EXPECTED_DIR = path.resolve(__dirname, 'contrib');

describe('Contributed gauge visual regression tests', () => {

    gaugeURIs.forEach(gaugeURI => {
        const gaugePath = gaugeURI.replace(/\./g, '-');
//        if (gaugePath != 'radionav-ADF-generic') return;
        const expectedPngPath = path.join(EXPECTED_DIR, `${gaugePath}.png`);
        const testOrCreate = (compare) => {
            const f = () => {
                const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `g3-test-${gaugePath}-`));
                const tempHtmlPath = path.join(tmpDir, 'gauge.html');
                const command = `node ${SCRIPT_PATH} ${tempHtmlPath} ${expectedPngPath}` + (compare ? ' --compare': '');

                fs.writeFileSync(tempHtmlPath, htmlTemplate(gaugeURI, DIST_PATH));

                try {
                    execSync(command);  // stdio defaults to 'pipe' which captures output
                } catch (error) {
                    error.message += `\n\nStderr:\n${error.stderr}`;
                    throw error;
                }

                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
            return f;
        };

        if (fs.existsSync(expectedPngPath)) {
            test(`gauge ${gaugeURI} should match its reference PNG`, testOrCreate(true), 10*1000); // 10s timeout
        } else {
            const f = testOrCreate(false);
            test.skip(`${gaugeURI} - no reference in ${path.relative(__dirname, expectedPngPath)}`, f);
            f();
        }
    });
});
