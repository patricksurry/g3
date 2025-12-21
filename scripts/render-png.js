import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { parseArgs } from 'node:util';

import sharp from 'sharp';

async function flood_alpha(img) {
    const { data, info } = await sharp(img)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const color = (p) => (p[0] << 16) | (p[1]) << 8 | p[2];

    const target = color(data),
        directions = [ -info.width*4, -1*4, 1*4, info.width*4 ];
    let stack = [0];

    while (stack.length > 0) {
        let i = stack.pop();
        directions.map(d => {
            let j = i + d;
            if (j >= 0 && j < data.length && data[j+3] && color(data.subarray(j)) == target) {
                data[j+3] = 0;
                stack.push(j);
            }
        });
    }

    return sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    }).trim().png();
}

/**
 * Renders the first SVG element of an HTML file to a PNG image.
 * @param {string} htmlPath - The path to the input HTML file.
 * @param {string} pngPath - The path to the output PNG file.
 * @param {object} options - Options for rendering.
 */
async function renderSvgToPng(htmlPath, pngPath, options = {}) {
  // gaussian blur shadow still adds some uncontrolled randomness?
  const { compare, force, threshold = 0.0001 } = options;

  if (!htmlPath || !pngPath) {
    console.error('Usage: node render-png.js <input.html> <output.png> [--compare] [--force]');
    process.exit(2);
  }

  const absoluteHtmlPath = path.resolve(htmlPath);

  if (!fs.existsSync(absoluteHtmlPath)) {
    console.error(`Error: Input file not found at ${absoluteHtmlPath}`);
    process.exit(3);
  }

  if (compare) {
    if (!fs.existsSync(pngPath)) {
      console.error(`Error: Comparison file not found at ${pngPath}`);
      process.exit(4);
    }
  } else if (fs.existsSync(pngPath) && !force) {
    console.error(`Error: Output file exists at ${pngPath}. Use --force to overwrite.`);
    process.exit(5);
  }

  console.log(`Rendering ${absoluteHtmlPath}...`);
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const page = await browser.newPage();

    // Replace math.random with a predictable version
    await page.evaluateOnNewDocument(() => {
      function mulberry32(seed) {
        return function() {
          let t = seed += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
      }

      Math.random = mulberry32(12345);
    });

    await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: 'networkidle0' });

    const svgElement = await page.waitForSelector('svg');

    // Take screenshot to a buffer first
    const buffer = await svgElement.screenshot();

    let img = await flood_alpha(buffer);

    if (compare) {
      const { data: actualData, info: actualInfo } = await img.raw().toBuffer({ resolveWithObject: true });
      const { data: expectData, info: expectInfo } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });

      if (expectData.length !== actualData.length) {
        console.error(`Image size mismatch: got ${actualInfo.width} x ${actualInfo.height} x ${actualInfo.channels}, expected ${expectInfo.width} x ${expectInfo.height} x ${expectInfo.channels}`);
        process.exitCode = 1;
      } else {
        let diff = 0;
        for (let i = 0; i < actualData.length; i+=4) {
          diff += [0,1,2,3].map((j) => Math.abs(actualData[i+j] - expectData[i+j])).reduce((a, b) => a + b);
        }
        const err = (100 * diff/128/4/actualData.length).toPrecision(2);
        if (err > 100*threshold) {
          console.error(`Image data mismatch: error ${err}% exceeds threshold.`);
          process.exitCode = 1;
        } else {
          console.log(`Images match with error ${err}%.`)
        }
      }
    } else {
      await img.toFile(pngPath);
      console.log(`Wrote PNG to ${pngPath}`);
    }
  } catch (error) {
    console.error('An error occurred during rendering:', error);
    process.exitCode = 5;
  } finally {
    await browser.close();
  }
}

const { values, positionals } = parseArgs({
  options: {
    compare: { type: 'boolean' },
    force: { type: 'boolean' },
  },
  allowPositionals: true,
});

const [htmlPath, pngPath] = positionals;
renderSvgToPng(htmlPath, pngPath, values);