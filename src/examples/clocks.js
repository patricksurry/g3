import * as d3 from 'd3';
import * as g3 from '../g3.js';


g3.gauge('clockSimple')
    .metric('time').unit('second')
    .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
//    .defs()
    .append(
        g3.gaugeFace(),
        g3.axisTicks().step(5).size(10),
        g3.axisTicks(d3.range(0, 60).filter(v => v % 5)).shape('dot').size(1).inset(2).style('stroke: none; fill: white'),
        g3.axisLabels().step(5).start(5).format(v => v/5).inset(20),
        g3.indicatePointer().shape('blade').rescale(v => v/60/12),
        g3.indicatePointer().shape('sword').rescale(v => v/60),
        g3.indicatePointer().rescale(g3.snapScale()),
    );

const dowFormat = v => d3.timeFormat('%a')(v).slice(0,2).toUpperCase();

g3.gauge('casioF91W')
    .metric('date').unit('dateTime')
    .css('text.g3-indicate-text { fill: #20282C }')
    .append(
        g3.element('rect', {width: 200, height: 80, x: -100, y: -43}).attr('rx', 10).style('fill: #BCDCD8'),
        // am/pm
        g3.put().x(-65).y(-20).append(
            g3.indicateText().format(d3.timeFormat('%p')).size(15).style('font-family: Gill Sans; font-weight: normal;')
        ),
        // day of week
        g3.put().x(-5).y(-25).append(
            g3.indicateText().format(dowFormat).style('font-family: DSEG14-Classic')
        ),
        // day of month
        g3.put().x(70).y(-25).append(
            g3.indicateText().format(d3.timeFormat('%e')).style('font-family: DSEG14-Classic')
        ),
        g3.put().x(-20).y(10).append(
            g3.indicateText().format(d3.timeFormat('%_I:%M')).size(36).style('font-family: DSEG7-Classic')
        ),
        g3.put().x(65).y(14).append(
            g3.indicateText().format(d3.timeFormat('%S')).size(27).style('font-family: DSEG7-Classic')
        ),
    );

/*
//TODO

// tachymetre



const tickFilter = v => Math.abs(v - 5*Math.round(v/5)) > 0.25;

var speedmaster = gauge({
    axis: axis({
        metric: 'chronometer',
        unit: 'second',
        measure: d3.scaleLinear().domain([0,60]).range([0, 360]),
    }),
    layers: [
        axisFace({class: css('fill: #111')}),
        axisMarks({
            values: d3.range(0, 60, 0.2).filter(tickFilter),
            inset: 20,
            marker: tick({r: 1, length: 2}),
        }),
        axisMarks({
            values: d3.range(0, 60, 1).filter(tickFilter),
            inset: 20,
            marker: tick({length: 5}),
        }),
        axisMarks({
            values: d3.range(5, 61, 5),
            inset: 21.8,
            marker: label({orientation: 'reading', scale: 0.4, format: d3.format('02d')})
        })
    ]
});


const speedMasterTachymetre =  [].concat(
    d3.range(60,95,5),
    d3.range(100,200,10),
    d3.range(200,300,25),
    d3.range(300,400,50),
    d3.range(400,600,100),
);

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

*/
