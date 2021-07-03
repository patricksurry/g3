import { injectGlobal } from '@emotion/css';

/*
import './gauge.css';
import 'dseg/css/dseg.css';
*/

export * from "./panel.js";
export * from "./gauge.js";
export * from "./indicate.js";
export * from "./axis.js";
export * from './common.js';

injectGlobal`
/* Declare 7 and 14 segment LCD fonts, many other variants at https://www.keshikan.net/fonts-e.html */

@font-face {
  font-family: 'DSEG7-Classic';
  src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2') format('woff2'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff') format('woff'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}
@font-face {
  font-family: 'DSEG14-Classic';
  src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff2') format('woff2'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff') format('woff'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}

/* default center panel on black background */
body {
    margin:  0;
    background-color:  black;
}
.g3-panel {
    background-color:  black;
    display: block;
    margin: 0 auto;
    stroke: none;
    fill: none;
}
.g3-panel * {
    vector-effect: non-scaling-stroke;
}
.g3-panel text {
    font-family: Gill Sans,Gill Sans MT,Calibri,sans-serif;
    text-anchor:  middle;
    dominant-baseline:  central;
    font-stretch: condensed;
    fill: #aaa;
}
.g3-axis-ticks-dot, .g3-axis-ticks-wedge, .g3-axis-sector, .g3-fg-fill {
    fill:  #ddd;
}
.g3-axis-line, .g3-axis-ticks, .g3-fg-stroke  {
    stroke: #ddd;
}
.g3-axis-ticks .g3-axis-ticks-dot, .g3-axis-ticks .g3-axis-ticks-wedge {
    stroke: none;
}
.g3-gauge-face, .g3-bg-fill {
    fill: #181818;
}
.g3-bg-stroke {
    stroke:  #181818;
}

/* semantic styles */
.g3-no-fill {
    fill: none;
}
.g3-no-stroke {
    stroke: none;
}
.g3-highlight-fill {
    fill: orange;
}
.g3-highlight-stroke {
    stroke: orange;
    stroke-width: 2;
}
.g3-danger-stroke {
    stroke: red;
    stroke-width: 2;
}
.g3-danger-fill {
    fill: red
}
.g3-warning-fill {
    fill: #987808;
}
.g3-normal-fill {
    fill: green;
}
.g3-cold-fill, .g3-sky-fill {
    fill: #0580BA;
}
.g3-ground-fill {
    fill: #6B5634;
}
/* pointer default styles */

.g3-indicate-pointer {
    fill: #222;
    filter: url(#dropShadow2);
}
.g3-pointer-needle {
    fill: red;
}
.g3-pointer-blade {
    fill: #e8e8e8;
    stroke: #aaa;
}
.g3-gauge-screw {
    fill: #333;
    filter: url(#dropShadow2);
}
.g3-gauge-screw rect {
    fill: #222;
}
.g3-highlight {
    fill: url(#highlightGradient);
    fill-opacity: 0.25;
}
` // end of CSS injectGlobal


