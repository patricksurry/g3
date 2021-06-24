import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('clockSimple')
    .metric('time').unit('second')
    .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
//    .defs()
    .append(
        gauge.face(),
        gauge.axis.ticks().step(5).size(10),
        gauge.axis.ticks(d3.range(0, 60).filter(v => v % 5)).kind('dot').size(1).inset(2).css('stroke: none; fill: white'),
        gauge.axis.labels().step(5).start(5).format(v => v/5).inset(20),
        gauge.indicator.pointer('blade').rescale(v => v/60/12),
        gauge.indicator.pointer('sword').rescale(v => v/60),
        gauge.indicator.pointer(),
    );

const dowFormat = v => d3.timeFormat('%a')(v).slice(0,2).toUpperCase();

gauge('casioF91W')
    .metric('date').unit('dateTime')
    .css('text {font-family: DSEG7-Classic; font-weight: bold; fill: #20282C;}')
    .append(
        gauge.element('rect', {width: 200, height: 80, x: -100, y: -43}).attr('rx', 10).css('fill: #BCDCD8'),
        // am/pm
        gauge.put(
            gauge.indicator.text().format(d3.timeFormat('%p')).size(15).style('font-family: Gill Sans !important; font-weight: normal !important;'),
            {x: -65, y: -20}),
        // day of week
        gauge.put(
            gauge.indicator.text().format(dowFormat).style('font-family: DSEG14-Classic !important'),
            {x: -5, y: -25}),
        // day of month
        gauge.put(
            gauge.indicator.text().format(d3.timeFormat('%e')).style('font-family: DSEG14-Classic !important'),
            {x: 70, y: -25}),
        gauge.put(gauge.indicator.text().format(d3.timeFormat('%_I:%M')).size(36), {x: -20, y: 10}),
        gauge.put(gauge.indicator.text().format(d3.timeFormat('%S')).size(27), {x: 65, y: 14}),
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
