import * as d3 from 'd3';
import * as g3 from '../g3.js';


const dowFormat = v => d3.timeFormat('%a')(v).slice(0,2).toUpperCase();


export function simple() {
    return g3.gauge()
        .metric('time').unit('s')
        .fake(g3.midnightSecondsSeries())
        .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
        .append(
            g3.gaugeFace(),
            g3.axisTicks().step(5).size(10),
            g3.axisTicks(d3.range(0, 60).filter(v => v % 5)).shape('dot').size(1).inset(2).style('stroke: none; fill: white'),
            g3.axisLabels().step(5).start(5).format(v => v/5).inset(20),
            g3.indicatePointer().shape('blade').rescale(v => v/60/12),
            g3.indicatePointer().shape('sword').rescale(v => v/60),
            g3.indicatePointer().rescale(g3.snapScale()),
        );
}


export function casioF91W() {
    return g3.gauge()
        .metric('date').unit('dateTime')
        .fake(g3.datetimeSeries())
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
}
