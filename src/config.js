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
//defs.append("image").attr('id', 'speedmaster').attr('href', 'speedmaster_bw.png').attr('x', -16).attr('y', -50).attr('width', 32);

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






];

function enumerateGauges(gs, pfx) {
    return gs.map(g => [(pfx || '') + g.metric, g]).concat(
        ... gs.filter(g => g.childGauges).map(g => enumerateGauges(g.childGauges, g.metric + '_'))
    );
}
export const gaugeDefs = Object.fromEntries(enumerateGauges(gauges));
