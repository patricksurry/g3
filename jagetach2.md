Test
---

This should be an embedded gauge:

<div>
    <style data-emotion="css" data-s="">
        @font-face {
            font-family: 'DSEG7-Classic';
            src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2') format('woff2'), url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff') format('woff'), url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
        }
    </style>
    <style data-emotion="css" data-s="">
        @font-face {
            font-family: 'DSEG14-Classic';
            src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff2') format('woff2'), url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff') format('woff'), url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
        }
    </style>
    <style data-emotion="css" data-s="">
        body {
            margin: 0;
            background-color: black;
            font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
            color: #ccc;
        }
    </style>
    <style data-emotion="css" data-s="">
        .will-change-transform {
            will-change: transform;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-panel {
            background-color: black;
            display: block;
            margin: 0 auto;
            stroke: none;
            fill: none;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-panel * {
            vector-effect: non-scaling-stroke;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-panel text {
            text-anchor: middle;
            dominant-baseline: central;
            font-stretch: condensed;
            fill: #aaa;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-axis-ticks-dot,
        .g3-axis-ticks-wedge,
        .g3-axis-sector,
        .g3-fg-fill {
            fill: #ddd;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-axis-line,
        .g3-axis-ticks,
        .g3-fg-stroke {
            stroke: #ddd;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-axis-ticks .g3-axis-ticks-dot,
        .g3-axis-ticks .g3-axis-ticks-wedge {
            stroke: none;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-grid-line line {
            stroke: #666;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-grid-hairline {
            stroke: #333;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-grid-label text {
            font-size: 8px;
            text-anchor: middle;
            dominant-baseline: central;
            fill: #999;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-grid-label rect {
            stroke: none;
            fill: black;
            opacity: 0.5;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-gauge-face,
        .g3-bg-fill {
            fill: #181818;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-bg-stroke {
            stroke: #181818;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-no-fill {
            fill: none;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-no-stroke {
            stroke: none;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-highlight-fill {
            fill: orange;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-highlight-stroke {
            stroke: orange;
            stroke-width: 2;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-danger-stroke {
            stroke: red;
            stroke-width: 2;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-danger-fill {
            fill: red;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-warning-fill {
            fill: #987808;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-normal-fill {
            fill: green;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-cold-fill,
        .g3-sky-fill {
            fill: #0580BA;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-ground-fill {
            fill: #6B5634;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-indicate-pointer {
            fill: #222;
            -webkit-filter: url(#dropShadow2);
            filter: url(#dropShadow2);
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-pointer-needle {
            fill: red;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-pointer-blade {
            fill: #e8e8e8;
            stroke: #e8e8e8;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-pointer-luminous {
            fill: #e0e8d0;
            stroke: #d0d8c0;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-indicate-sector {
            fill: green;
            stroke: none;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-indicate-sector.g3-indicate-sector-negative {
            fill: red;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-gauge-screw {
            fill: #333;
            -webkit-filter: url(#dropShadow2);
            filter: url(#dropShadow2);
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-gauge-screw rect {
            fill: #222;
        }
    </style>
    <style data-emotion="css" data-s="">
        .g3-highlight {
            fill: url(#highlightGradient);
            fill-opacity: 0.25;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-1dos0lw text {
            fill: #ddd;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-1xnrczn text {
            fill: black;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-14drdse text.g3-gauge-label,
        .css-14drdse .g3-axis-labels text {
            font-stretch: normal;
            font-weight: 600;
            fill: #ccc;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-14drdse .g3-gauge-face {
            fill: #282828;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-7czqn7 text.g3-indicate-text {
            fill: #20282C;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-1ycgz69 .g3-pointer-hub,
        .css-1ycgz69 .g3-pointer-blade {
            fill: #ddd;
            stroke: #ddd;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-1ycgz69 text {
            fill: #ccc;
        }
    </style>
    <style data-emotion="css" data-s="">
        .css-1ycgz69 .g3-highlight {
            fill-opacity: 0.5;
        }
    </style>
<svg width="640" height="640">
        <g class="g3-panel" transform="translate(0, 0) rotate(0) scale(1, 1)">
            <defs>
                <radialGradient id="highlightGradient" cx="50%" cy="50%" fx="25%" fy="40%" r="50%">
                    <stop stop-color="white" offset="0%"></stop>
                    <stop stop-color="black" offset="100%"></stop>
                </radialGradient>
                <filter id="dropShadow1" filterUnits="userSpaceOnUse" x="-640" width="1280" y="-640" height="1280">
                    <feDropShadow stdDeviation="1" dx="0" dy="0"></feDropShadow>
                </filter>
                <filter id="dropShadow2" filterUnits="userSpaceOnUse" x="-640" width="1280" y="-640" height="1280">
                    <feDropShadow stdDeviation="2" dx="0" dy="0"></feDropShadow>
                </filter>
                <filter id="dropShadow3" filterUnits="userSpaceOnUse" x="-640" width="1280" y="-640" height="1280">
                    <feDropShadow stdDeviation="3" dx="0" dy="0"></feDropShadow>
                </filter>
                <filter id="gaussianBlur1">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1"></feGaussianBlur>
                </filter>
                <filter id="gaussianBlur2">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2"></feGaussianBlur>
                </filter>
                <filter id="gaussianBlur3">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3"></feGaussianBlur>
                </filter>
            </defs>
            <g transform="translate(320, 320) rotate(0) scale(2, 2)">
                <g class="g3-gauge css-14drdse">
                    <g>
                        <circle r="100" class="g3-gauge-face"></circle>
                        <circle r="50" class="g3-gauge-face" style="filter: url(#dropShadow2)"></circle>
                        <path d="M49.662,-5.805A50,50,0,0,1,40.958,28.679L12.287,8.604A15,15,0,0,0,14.899,-1.741Z"
                            class="g3-axis-sector" style="fill: #800"></path><text x="0" y="-45" dx="0" dy="0"
                            font-size="7" class="g3-gauge-label">SMITHS</text><text x="0" y="40" dx="0" dy="0"
                            font-size="7" class="g3-gauge-label">8 CYL</text>
                        <g transform="translate(0, 0) rotate(180) scale(1, 1)">
                            <g class="g3-axis-labels">
                                <g>
                                    <path id="axis-label-path-1-0" d="M 0,48 A 48,48,0,1,0,0,-48 A 48,48,0,1,0,0,48"
                                        style="visibility: hidden" transform="rotate(0)"></path><text font-size="3.5">
                                        <textPath startOffset="50%" href="#axis-label-path-1-0">POSITIVE EARTH
                                        </textPath>
                                    </text>
                                </g>
                            </g>
                        </g><text x="0" y="65" dx="0" dy="0" font-size="12" class="g3-gauge-label">RPM</text><text x="0"
                            y="75" dx="0" dy="0" font-size="8" class="g3-gauge-label">X 100</text>
                        <g class="g3-gauge-screw" transform="translate(-20, 0) rotate(0) scale(1, 1)">
                            <circle r="3" class="g3-gauge-screw-head"></circle>
                            <circle r="3" class="g3-highlight"></circle>
                            <rect transform="scale(3) rotate(332.2558503499406)" x="-1" width="2" y="-0.2" height="0.4">
                            </rect>
                            <rect transform="scale(3) rotate(242.25585034994063)" x="-1" width="2" y="-0.2"
                                height="0.4"></rect>
                        </g>
                        <g class="g3-gauge-screw" transform="translate(20, 0) rotate(0) scale(1, 1)">
                            <circle r="3" class="g3-gauge-screw-head"></circle>
                            <circle r="3" class="g3-highlight"></circle>
                            <rect transform="scale(3) rotate(233.26546068052687)" x="-1" width="2" y="-0.2"
                                height="0.4"></rect>
                            <rect transform="scale(3) rotate(143.26546068052687)" x="-1" width="2" y="-0.2"
                                height="0.4"></rect>
                        </g>
                        <g transform="translate(0, 0) rotate(0) scale(0.95, 0.95)">
                            <path
                                d="M-81.915,57.358A100,100,0,1,1,81.915,57.358L77.819,54.49A95,95,0,1,0,-77.819,54.49Z"
                                class="g3-axis-sector" style="fill: none; stroke: white"></path>
                            <g class="g3-axis-ticks g3-axis-ticks-tick" style="stroke-width: 5">
                                <g transform="rotate(-125) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(-104.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(-83.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(-62.5) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(-41.66666666666668) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(-20.83333333333332) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(0) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(20.833333333333343) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(41.66666666666666) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(62.5) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(83.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(104.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                                <g transform="rotate(125) translate(0, -100)">
                                    <path d="M0,0L0,10"></path>
                                </g>
                            </g>
                            <g class="g3-axis-ticks g3-axis-ticks-tick">
                                <g transform="rotate(-125) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-120.83333333333333) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-116.66666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-112.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-108.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-104.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-100) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-95.83333333333333) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-91.66666666666667) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-87.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-83.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-79.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-75) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-70.83333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-66.66666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-62.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-58.333333333333336) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-54.166666666666664) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-50) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-45.83333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-41.66666666666668) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-37.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-33.33333333333333) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-29.16666666666667) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-25) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-20.83333333333332) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-16.666666666666657) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-12.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-8.333333333333336) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(-4.166666666666664) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(0) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(4.166666666666686) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(8.333333333333336) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(12.500000000000007) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(16.666666666666657) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(20.833333333333343) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(25) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(29.16666666666668) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(33.33333333333332) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(37.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(41.66666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(45.83333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(49.99999999999999) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(54.166666666666664) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(58.333333333333314) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(62.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(66.66666666666669) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(70.83333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(75) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(79.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(83.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(87.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(91.66666666666669) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(95.83333333333331) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(100) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(104.16666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(108.33333333333334) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(112.5) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(116.66666666666666) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(120.83333333333331) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                                <g transform="rotate(125) translate(0, -100)">
                                    <path d="M0,0L0,5"></path>
                                </g>
                            </g>
                            <g class="g3-axis-labels">
                                <g><text font-size="15" transform="rotate(-125) translate(0, -80) rotate(125)">0</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(-104.16666666666666) translate(0, -80) rotate(104.16666666666666)">5</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(-83.33333333333334) translate(0, -80) rotate(83.33333333333334)">10</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(-62.5) translate(0, -80) rotate(62.5)">15</text></g>
                                <g><text font-size="15"
                                        transform="rotate(-41.66666666666668) translate(0, -80) rotate(41.66666666666668)">20</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(-20.83333333333332) translate(0, -80) rotate(20.83333333333332)">25</text>
                                </g>
                                <g><text font-size="15" transform="rotate(0) translate(0, -80) rotate(0)">30</text></g>
                                <g><text font-size="15"
                                        transform="rotate(20.833333333333343) translate(0, -80) rotate(-20.833333333333343)">35</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(41.66666666666666) translate(0, -80) rotate(-41.66666666666666)">40</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(62.5) translate(0, -80) rotate(-62.5)">45</text></g>
                                <g><text font-size="15"
                                        transform="rotate(83.33333333333334) translate(0, -80) rotate(-83.33333333333334)">50</text>
                                </g>
                                <g><text font-size="15"
                                        transform="rotate(104.16666666666666) translate(0, -80) rotate(-104.16666666666666)">55</text>
                                </g>
                                <g><text font-size="15" transform="rotate(125) translate(0, -80) rotate(-125)">60</text>
                                </g>
                            </g>
                            <g class="g3-indicate-pointer">
                                <path d="M 3,0 l -1.5,-90 l -1.5,-5 l -1.5,5 l -1.5,90 z" style="fill: #ddd"></path>
                                <path d="M 3,0 l -0.75,-45 l -4.5,0 l -0.75,45 z" style="fill: #333"></path>
                                <path d="M -1,0 l 0,-90 l 2,0 z"
                                    style="fill: white; filter: url(#gaussianBlur1); opacity: 0.5"></path>
                                <circle r="15" style="fill: #ccd"></circle>
                                <circle r="15" class="g3-highlight"></circle>
                                <circle r="5" style="fill: #333"></circle>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg></body>

</div>


and here's some more text