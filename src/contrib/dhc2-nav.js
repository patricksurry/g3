import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function airspeed() {
    return g3.gauge()
        .metric('airspeed').unit('knot')
        .fake(g3.forceSeries(40, 200))
        .measure(d3.scaleLinear().domain([40,200]).range([30, 350]))
        .append(
            g3.gaugeFace(),
            g3.axisSector([60, 105]).inset(10).size(5),  // flaps
            g3.axisSector([60, 145]).size(5).class('g3-normal-fill'),  // normal
            g3.axisSector([145, 180]).size(5).class('g3-danger-fill'),  // max
            g3.axisTicks().step(5).size(10),
            g3.axisTicks().step(10).size(15).style('stroke-width: 2'),
            g3.axisTicks([180]).size(15).class('g3-danger-stroke'),
            g3.axisLabels().step(20).inset(30),
            g3.gaugeLabel("AIRSPEED").size(12).y(-33),
            g3.gaugeLabel("MPH").y(33),
            g3.indicatePointer().shape('sword'),
        );
}
