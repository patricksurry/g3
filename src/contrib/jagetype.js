import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function tachometer() {
    return g3.gauge()
        .metric('engineRPM').unit('rpm')
        .measure(d3.scaleLinear().domain([0,6000]).range([-125,125]))
        .css(`
text.g3-gauge-label, .g3-axis-labels text {
    font-stretch: normal;
    font-weight: 600;
    fill: #ccc;
}
.g3-gauge-face { fill: #282828 }
`)
        .append(
            g3.gaugeFace(),
            g3.gaugeFace().r(50).style('filter: url(#dropShadow2)'),
            g3.axisSector([5000,6000]).inset(50).size(35).style('fill: #800'),
            g3.gaugeLabel('SMITHS').y(-45).size(7),
            g3.gaugeLabel('8 CYL').y(40).size(7),
            // a trick to put a circular path label opposite the 3000RPM top of the gauge
            g3.put().rotate(180).append(
                g3.axisLabels({3000: 'POSITIVE EARTH'}).orient('counterclockwise').size(3.5).inset(52)
            ),
            g3.gaugeLabel('RPM').y(65).size(12),
            g3.gaugeLabel('X 100').y(75).size(8),
            g3.gaugeScrew().shape('phillips').r(3).x(-20),
            g3.gaugeScrew().shape('phillips').r(3).x(20),
            g3.put().scale(0.95).append(
                g3.axisSector().style('fill: none; stroke: white'),
                g3.axisTicks().step(500).style('stroke-width: 5'),
                g3.axisTicks().step(100).size(5),
                g3.axisLabels().inset(20).size(15).format(v => v/100),
                g3.indicatePointer().append(
                    // the full pointer blade
                    g3.element('path', {d: 'M 3,0 l -1.5,-90 l -1.5,-5 l -1.5,5 l -1.5,90 z'})
                        .style('fill: #ddd'),
                    // the bottom half of the pointer, drawn over the full blade
                    g3.element('path', {d: 'M 3,0 l -0.75,-45 l -4.5,0 l -0.75,45 z'})
                        .style('fill: #333'),
                    // a blurred highlight on the blade to give a bit of 3D effect
                    g3.element('path', {d: 'M -1,0 l 0,-90 l 2,0 z'})
                        .style('fill: white; filter: url(#gaussianBlur1); opacity: 0.5'),
                    // the central hub, with a highlight
                    g3.element('circle', {r: 15}).style('fill: #ccd'),
                    g3.element('circle', {r: 15}).class('g3-highlight'),
                    // the central pin
                    g3.element('circle', {r: 5}).style('fill: #333'),
                ),
            ),
        );
}
