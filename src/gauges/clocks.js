import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('clockSimple')
    .metric('time').unit('second')
    .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
    .layers(
        gauge.face(),
        gauge.axis.ticks().step(5).size(10),
        gauge.axis.ticks(d3.range(0, 60).filter(v => v % 5)).mark('dot').size(1).inset(2).css('stroke: none; fill: white'),
        gauge.axis.labels().step(5).start(5).format(v => v/5).inset(20),
        gauge.indicator.pointer('blade').rescale(v => v/60/12),
        gauge.indicator.pointer('sword').rescale(v => v/60),
        gauge.indicator.pointer(),
    );

gauge('casioF91W')
    .metric('date').unit('dateTime')
    .css('text {font-family: DSEG7-Classic; font-weight: bold; fill: #20282C;}')
    .layers(
        (_) => _.append('rect')
            .attr('width', 200).attr('height', 80).attr('x', -100).attr('y', -43)
            .attr('rx', 10)
            .attr('style', 'fill: #BCDCD8'),
        gauge.indicator.text().format(d3.timeFormat('%p')).y(-20).x(-65).scale(0.75)
            .css('font-family: Gill Sans !important; font-weight: normal !important;'),  // am/pm
        gauge.indicator.text().format(v => d3.timeFormat('%a')(v).slice(0,2)).y(-25).x(-5),  // day of week
        gauge.indicator.text().format(d3.timeFormat('%e')).y(-25).x(70),  // day of month
        gauge.indicator.text().format(d3.timeFormat('%_I:%M')).x(-20).y(10).scale(1.8),
        gauge.indicator.text().format(d3.timeFormat('%S')).y(14).x(65).scale(1.35),
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
