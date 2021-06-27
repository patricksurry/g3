import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('clockSimple')
    .metric('time').unit('second')
    .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
//    .defs()
    .append(
        gauge.face(),
        gauge.axis.ticks().step(5).size(10),
        gauge.axis.ticks(d3.range(0, 60).filter(v => v % 5)).shape('dot').size(1).inset(2).style('stroke: none; fill: white'),
        gauge.axis.labels().step(5).start(5).format(v => v/5).inset(20),
        gauge.indicator.pointer().shape('blade').rescale(v => v/60/12),
        gauge.indicator.pointer().shape('sword').rescale(v => v/60),
        gauge.indicator.pointer(),
    );

const dowFormat = v => d3.timeFormat('%a')(v).slice(0,2).toUpperCase();

gauge('casioF91W')
    .metric('date').unit('dateTime')
    .css('text {font-family: DSEG7-Classic; font-weight: bold; fill: #20282C;}')
    .append(
        gauge.element('rect', {width: 200, height: 80, x: -100, y: -43}).attr('rx', 10).style('fill: #BCDCD8'),
        // am/pm
        gauge.put().x(-65).y(-20).append(
            gauge.indicator.text().format(d3.timeFormat('%p')).size(15).style('font-family: Gill Sans; font-weight: normal;')
        ),
        // day of week
        gauge.put().x(-5).y(-25).append(
            gauge.indicator.text().format(dowFormat).style('font-family: DSEG14-Classic')
        ),
        // day of month
        gauge.put().x(70).y(-25).append(
            gauge.indicator.text().format(d3.timeFormat('%e')).style('font-family: DSEG14-Classic')
        ),
        gauge.put().x(-20).y(10).append(
            gauge.indicator.text().format(d3.timeFormat('%_I:%M')).size(36)
        ),
        gauge.put().x(65).y(14).append(
            gauge.indicator.text().format(d3.timeFormat('%S')).size(27)
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
