import * as d3 from "d3";

import { css } from '@emotion/css'


/*
TODO
- add fuel selected tank indicator light (or tri-wheel underneath?)

- allow no needle without href '', and return obj instead of updater

- flip y axis (+r, angle=0 at top)

- moves defs to setup (add if don't exist?)

- arc text (orient)

- class tag on labeled mark
*/

const speedMasterTachymetre =  [].concat(
    d3.range(60,95,5),
    d3.range(100,200,10),
    d3.range(200,300,25),
    d3.range(300,400,50),
    d3.range(400,600,100),
);

var gauges = [
    {
        metric: "clock",
        unit: "second",
        axis: {
            scale: d3.scaleLinear().domain([0, 60]).range([0, 360]),
            tickMarks: {
                major: {step: 5},
                minor: {step: 1},
            },
            tickLabels: {
                primary: {start: 5, step: 5, fmt: v => v/5}
            },
        },
        indicators: [
            { href: '#indicator-blade', scale: d3.scaleLinear().domain([0,60*60*12]).range([0, 360]) },
            { href: '#indicator-sword', scale: d3.scaleLinear().domain([0,60*60]).range([0, 360]) },
            { href: '#indicator-needle' },
        ],
    },
    {
        // speedmaster-watch
        metric: "tachymetre",
        unit: "unitPerSecond",
        axis: {
            r: 85,
            scale: d3.scalePow().exponent(-1).domain([60, 500]).range([360, 43.2]),
            tickMarks: {
                minor: { values: d3.range(60,100), dr: -3 },
                major: { values: d3.range(60,140,5), dr: -5 },
                special: {values: speedMasterTachymetre, style: 'dot', dr: 1.5 },
            },
            tickLabels: {
                special: speedMasterTachymetre.map(v => {return {value: v, label: v, dr: -7}})
            },
        },
        decorations: [
            { kind: "use", href: "#speedmaster"}
        ],
        indicator: { href: ''},
        childGauges: [
            {
                metric: 'chronSecond',
                unit: 'second',
                r: 80,
                axis: {
                    scale: d3.scaleLinear().domain([0,60]).range([0,360]),
                    tickMarks: {
                        minor: { step: 0.2, dr: 3 },
                        major: { step: 1 }
                    }
                },
                indicator: { href: '#indicator-needle' },
                childGauges: [
                    {
                        metric: 'clockSecond',
                        unit: 'second',
                        r: 30,
                        cx: -45,
                        axis: {
                            scale: d3.scaleLinear().domain([0,60]).range([0,360]),
                            tickMarks: {
                                minor: {values: [5,10,20,25,35,40,50,55], dr: 10},
                            },
                            tickLabels: {
                                primary: {start: 15, step: 15, dr: 20}
                            }
                        },
                        style: css(`
.gauge-tickmark-major { stroke-width: 1}
path.gauge-axis { stroke: #222; stroke-width: 1; visibility: visible !important}
`)
                    },
                    {
                        metric: 'chronMinute',
                        unit: 'minute',
                        r: 30,
                        cx: 45,
                        axis: {
                            scale: d3.scaleLinear().domain([0,30]).range([0,360]),
                            tickMarks: {
                                major: {start: 5, step: 5, dr: 15},
                                minor: {start: 1, dr: 10},
                            },
                            tickLabels: {
                                primary: {start: 10, step: 10, dr: 40}
                            }
                        },
                        style: css(`
.gauge-tickmark-major { stroke-width: 1}
path.gauge-axis { stroke: #222; stroke-width: 1; visibility: visible !important}
`)
                    },
                    {
                        metric: 'chronHour',
                        unit: 'hour',
                        r: 30,
                        cy: 45,
                        axis: {
                            scale: d3.scaleLinear().domain([0,12]).range([0,360]),
                            tickMarks: {
                                minor: {values: [1,2,4,5,7,8,10,11], dr: 15},
                            },
                            tickLabels: {
                                primary: {start: 3, step: 3, dr: 10}
                            }
                        },
                        style: css(`
.gauge-tickmark-major { stroke-width: 1}
path.gauge-axis { stroke: #222; stroke-width: 1; visibility: visible !important}
`)
                    },

                    {
                        metric: 'clockMinute',
                        unit: 'minute',
                        r: 95,
                        axis: {
                            scale: d3.scaleLinear().domain([0,60]).range([0,360]),
                            tickMarks: {
                                major: { start: 5, step: 5, dr: 16},
                            }
                        },
                        indicators: [
                            { href: '#indicator-blade', scale: d3.scaleLinear().domain([0,60*12]).range([0, 360])},
                            { href: '#indicator-sword',  },
                        ],
                        style: css(`
.gauge-tickmark-major { stroke-width: 4 !important }
`)
                    },
                ]
            }
        ],
        style: css(`
.gauge .gauge-axis { visibility: hidden; }
.gauge-face { fill: #111; }
.gauge .gauge-face circle { visibility: hidden; }
.gauge-tickmarks, .gauge-tickmark-major { stroke-width: 0.5 }
.gauge-tickmark-special { stroke: none; fill: white; }
.gauge-ticklabel-special text { font-size: 30% }
.gauge .gauge-ticklabel-primary text { font-size: 300% }
`)
    },
    {
        metric: "altitude",
        unit: "feet",
        axis: {
            scale: d3.scaleLinear().domain([0, 1000]).range([0, 360]),
            tickMarks: {
                major: {step: 100, dr: 15},
                minor: {step: 20},
            },
            tickLabels: {
                primary: {step: 100, stop: 900, fmt: v => v/100, dr: 25}
            },
        },
        decorations: [
            {kind: 'label', r: -30, label: "ALTITUDE"},
            {kind: 'label', label: "100"},
            {kind: 'label', label: "FEET"},
            {kind: 'label', label: "1000 FEET"},
            {kind: 'label', label: "10000 FEET"},
            {kind: 'label', label: "CALIBRATED TO"},
            {kind: 'label', label: "20,000 FEET"}
        ],
        indicators: [
            { href: '#indicator-dagger', scale: d3.scaleLinear().domain([0,100000]).range([0, 360]) },
            { href: '#indicator-blade', scale: d3.scaleLinear().domain([0,10000]).range([0, 360]) },
            { href: '#indicator-sword' },
        ],
        style: css`
.gauge-ticklabel-primary { font-size: 90% };
`,
        childGauges: [
            {
                metric: "atmosphericPressure",
                unit: "hPa",
                underneath: true,
                r: 88,
                rotate: 90,
                axis: {
                    scale: d3.scaleLinear().domain([955,1075]).range([0, 360]),
                    tickMarks: {
                        major: {step: 5, dr: 5},
                        minor: {step: 1, dr: 3},
                        special: {values: [1013.25]}
                    },
                    tickLabels: {
                        primary: {step: 5, stop: 1070, radial: true, dr: 6}
                    },
                },
                indicator: { style: 'fixed', href: '' },
                style: css`
.gauge-face { fill: #222; }
.gauge-ticklabel-primary { font-size: 75% };
.gauge-tickmark-special { stroke: white; stroke-width: 1; }`
            }
        ]
    },
    {
        metric: "heading",
        unit: "degree",
        axis: {
            scale: d3.scaleLinear().domain([0, 360]).range([0, 360]),
            tickMarks: {
                major: {step: 10, dr: 10},
                minor: {step: 5, dr: 5}
            },
            tickLabels: {
                primary: {step: 30, stop: 330, fmt: (v) => (v%90==0)?'NESW'.charAt(v/90):(v/10)}
            },
        },
        indicator: { style: 'fixed', href: '#indicator-aircraft-plan' }
    },
    {
        metric: "verticalSpeed",
        unit: "feetPerMinute",
        axis: {
            scale: d3.scaleLinear().domain([-2000, 2000]).range([90, 90+360]),
            tickMarks: {
                major: {step: 500, dr: 15},
                minor: {step: 100}
            },
            tickLabels: {
                primary: {step: 1000, stop: 1000, fmt: (v) => Math.abs(v/100)},
                secondary: {step: 500, stop: 1500, fmt: (v) => Math.abs(v/100)}
            }
        },
        decorations: [
            {kind: "label", r: -20, label: "VERTICAL SPEED",},
            {kind: "label", r: -10, label: "100 FEET PER MIMUTE"},
            {kind: "label", r: 60, angle: -75, label: "UP"},
            {kind: "label", r: 60, angle: -115, label: "DOWN"},
            // TODO arrows
        ]
    },
    {
        metric: "turnCoordinator",
        unit: "degreesPerSecond",
        axis: {
            scale: d3.scaleLinear().domain([-3, 3]).range([-20, 20]),
            tickMarks: {
                special: {values: [-16.5, -13.5, 13.5, 16.5]}
            }
        },
        indicator: {href: '#indicator-aircraft-rear'}
    },
    {
        metric: "airspeed",
        unit: "knot",
        axis: {
            scale: d3.scaleLinear().domain([40,200]).range([30, 350]),
            tickMarks: {
                major: {step: 10, dr: 15},
                minor: {step: 5, dr: 10},
                special: {values: [180], dr: 20},
            },
            tickLabels: {
                primary: {step: 20, dr: 33}
            },
            regions: [
                {name: "flaps", start: 60, stop: 105, r: 90},
                {name: "normal", start: 60, stop: 145},
                {name: "maximum", start: 145, stop: 180},
            ]
        },
        indicator: { href: '#indicator-sword' },
        decorations: [
            {kind: 'label', r: -33, label: "AIRSPEED"},
            {kind: 'label', r: 33, label: "MPH"},
        ],
    },
    {
        metric: "engineTachometer",
        unit: "RPM",
        axis: {
            scale: d3.scaleLinear().domain([300, 3500]).range([225, 495]),
            tickMarks: {
                major: {start: 500, step: 500, dr: 20},
                minor: {step: 100},
                special: {values: [2300], dr: 20},
            },
            tickLabels: {
                primary: {start: 500, step: 500, fmt: v => v/100},
                secondary: {values: [300], fmt: v => v/100},
            },
            regions: [
                {name: "idle", start: 1600, stop: 2000},
                {name: "normal", start: 2000, stop: 2200},
            ]
        },
        decorations: [
            {kind: 'label', r: -50, label: "RPM"},
            {kind: 'label', r: -33, label: "HUNDREDS"},
        ],
    },
    {
        metric: "manifoldPressure",
        unit: "inHg",
        axis: {
            scale: d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]),
            tickMarks: {
                major: {step: 5},
                minor: {step: 1},
                special: {values: [30, 36.5], dr: 20},
            },
            tickLabels: {
                primary: {step: 10},
                secondary: {step: 5},
            },
            regions: [
                {name: "idle", start: 18, stop: 30},
                {name: "normal", start: 30, stop: 35},
            ]
        },
        decorations: [
            {kind: 'label', r: -50, label: "MANIFOLD"},
            {kind: 'label', r: -30, label: "PRESSURE"},
            {kind: 'label', r: 50, label: "INCHES OF MERCURY"},
        ],
    },
    {
        metric: "oilFuel",
        indicator: { href: '' }, // #TODO hack
        childGauges: [
            {
                metric: "oilPressure",
                unit: "psi",
                r: 50,
                cx: -15,
                cy: 40,
                axis: {
                    r: 90,
                    scale: d3.scaleLinear().domain([0,200]).range([180, 360]),
                    tickMarks: {
                        major: {step: 50, dr: -15},
                        minor: {step: 10, dr: -10},
                        special: {values: [50, 100], dr: -15},
                    },
                    tickLabels: {
                        primary: {step: 50}
                    },
                    regions: [
                        {name: "normal", start: 70, stop: 90, r: 89, dr: -5}
                    ]
                },
                decorations: [
                    {kind: "label", r: 20, angle: 0, label: "OIL"}
                ]
            },
            {
                metric: "fuelPressure",
                unit: "psi",
                r: 50,
                cx: 15,
                cy: 40,
                axis: {
                    r: 90,
                    scale: d3.scaleLinear().domain([0,10]).range([180, 0]),
                    tickMarks: {
                        major: {step: 1, dr: -15},
                        special: {values: [3, 6], dr: -15},
                    },
                    tickLabels: {
                        primary: {step: 5}
                    },
                    regions: [
                        {name: "normal", start: 4, stop: 5, r: 89, dr: -5}
                    ]
                },
                decorations: [
                    {kind: "label", r: 20, angle: 0, label: "FUEL"}
                ]
            },
            {
                metric: "oilTemperature",
                unit: "degreeCelsius",
                r: 90,
                cy: -5,
                axis: {
                    r: 90,
                    scale: d3.scaleLinear().domain([0, 100]).range([-90, 90]),
                    tickMarks: {
                        major: {step: 10, dr: -10},
                        minor: {step: 5, dr: -10},
                        special: {values: [40, 85], dr: -10}
                    },
                    tickLabels: {
                        primary: {step: 20, dr: 20}
                    },
                    regions: [
                        {name: "normal", start: 60, stop: 75, r: 89, dr: -3}
                    ]
                },
                decorations: [
                    {kind: "label", r: -40, label: "TEMP°C"}
                ]
            }
        ],
        decorations: [
            {kind: "label", r: 30, label: "LBS"},
            {kind: "label", r: 40, label: "SQ.IN"},
        ],
        style: css(`
.gauge .gauge-face circle {visibility: hidden;}
`)
    },
    {
        metric: "fuel",
        indicator: { href: '' }, // #TODO hack
        childGauges: [
            {
                metric: "front",
                unit: "US gal",
                r: 40,
                cx: -45,
                cy: 30*0.866,
                axis: {
                    /* 29 gal capacity */
                    scale: d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]),
                    tickMarks: {
                        major: {start: 4, step: 4},
                        special: {values: [3, 25]},
                    },
                    tickLabels: {
                        primary: {start: 4, step: 4},
                        special: [
                            {value: 2, label: 'E'},
                            {value: 26, label: 'F'}
                        ]
                    }
                },
                indicator: { href: '#indicator-rondel' },
                decorations: [
                    {kind: "label", label: "FRONT"},
                    {kind: "use", class: "active-status", href: '#dimple', r: 50},
                ],
                exports: {
                    active: function(isActive) {
                        d3.select(this).select('.active-status')
                            .style('fill', isActive ? 'orange': null);
                    }
                },
/*
harder to style specific elements within use (shadow-dom), except via tricks like inherit overrides
see https://developers.google.com/web/fundamentals/web-components/shadowdom#stylefromoutside
*/
            },
            {
                metric: "center",
                unit: "US gal",
                r: 40,
                cx: 45,
                cy: 30*0.866,
                axis: {
                    /* 29 gal capacity */
                    scale: d3.scaleLinear().domain([3,25]).range([180+48, 360+180-48]),
                    tickMarks: {
                        major: {start: 4, step: 4},
                        special: {values: [3, 25]},
                    },
                    tickLabels: {
                        primary: {start: 4, step: 4},
                        special: [
                            {value: 2, label: 'E'},
                            {value: 26, label: 'F'}
                        ]
                    },
                },
                indicator: { href: '#indicator-rondel' },
                decorations: [
                    {kind: "label", label: "CENTER"},
                    {kind: "use", href: '#dimple', r: 50},
                ]
            },
            {
                metric: "rear",
                unit: "US gal",
                r: 40,
                cx: 0,
                cy: -60*0.866,
                axis: {
                    /* 21 gal capacity */
                    scale: d3.scaleLinear().domain([2,19]).range([180+44,360+180-44]),
                    tickMarks: {
                        major: {start: 4, step: 4},
                        special: {values: [2, 19]},
                    },
                    tickLabels: {
                        primary: {start: 4, step: 4},
                        special: [
                            {value: 1, label: 'E'},
                            {value: 20, label: 'F'}
                        ]
                    }
                },
                indicator: { href: '#indicator-rondel' },
                decorations: [
                    {kind: "label", label: "REAR"},
                    {kind: "use", href: '#dimple', r: 50},
                ]
            },
        ],
    },
    {
        metric: "suctionPressure",
        unit: "inHg",
        axis: {
            scale: d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]),
            tickMarks: {
                major: {step: 1, dr: 20},
                minor: {step: 0.2, dr: 10},
                special: {values: [4.5, 5.4], dr: 20}
            },
            tickLabels: {
                primary: {step: 2, dr: 33},
            },
        },
        decorations: [
            {kind: 'label', r: -33, label: "SUCTION"},
            {kind: 'label', r: 25, label: "INCHES OF MERCURY"},
            {kind: 'screw', style: 'slotted', r: 50, scale: 0.8},
            {kind: 'screw', style: 'phillips', r: -50, scale: 0.8},
        ],
        style: css(`
.gauge-ticklabel-primary text { font-size: 150%; }
.gauge-decoration-label-inches_of_mercury { font-size: 50%; }
`)
    },
];

function enumerateGauges(gs, pfx) {
    return gs.map(g => [(pfx || '') + g.metric, g]).concat(
        ... gs.filter(g => g.childGauges).map(g => enumerateGauges(g.childGauges, g.metric + '_'))
    );
}
export const gaugeDefs = Object.fromEntries(enumerateGauges(gauges));
