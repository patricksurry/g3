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
    .css('text {font-family: DSEG7-Classic; font-weight: bold; fill: #20282C;}')
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
            g3.indicateText().format(d3.timeFormat('%_I:%M')).size(36)
        ),
        g3.put().x(65).y(14).append(
            g3.indicateText().format(d3.timeFormat('%S')).size(27)
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


*/
