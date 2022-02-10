import * as d3 from 'd3';
import * as g3 from '../g3.js';

import {headingFormat, deviationScale} from './nav.js';


export function VORGeneric() {
    return g3.gauge()
        // the inner part of the VOR gauge measures the deviation from selected radial
        .metric('radialDeviation').unit('deg')
        .fake(g3.forceSeries(-10, 10))
        .measure(deviationScale)
        .kind('linear')
        .clip(g3.gaugeFace())
        .append(
            g3.gaugeFace(),
            // dots show every two degrees of deviation, with an extra central dot
            g3.axisTicks([-10,-8,-6,-4,0,4,6,8,10]).shape('dot').size(3),
            g3.element('circle', {r: deviationScale(2)}).class('g3-axis-ticks').style('stroke-width: 2; fill: none'),
            g3.gaugeLabel('TO').x(35).y(-35).size(8),
            g3.gaugeLabel('FR').x(35).y(35).size(8),
            // use a single styled gauge to flip to/from/unreliable
            // draw the 'to' state with a greyed out 'from' state
            g3.element('path', {d: 'M 35,25 l 8,-14 l -16,0 z'}).class('g3-highlight-fill'),
            g3.element('path', {d: 'M 35,-25 l 8,14 l -16,0 z'}).class('g3-bg-fill'),
            g3.gauge()
                .metric('toFromVOR')  // 1: to, -1: from, 0: off
                .fake(g3.categoricalSeries([1, 0, -1]))
                .append(
                    g3.indicateStyle().trigger(v => v == -1 ? 0.9 : 0.1).append(
                        // overlay a slightly (or very) transparent 'from' state
                        g3.element('path', {d: 'M 35,25 l 8,-14 l -16,0 z'}).class('g3-bg-fill'),
                        g3.element('path', {d: 'M 35,-25 l 8,14 l -16,0 z'}).class('g3-highlight-fill'),
                    ),
                ),
            // similarly, show unreliability by drawing background over to/from plus the NAV indicator
            g3.gauge()
                .metric('toFromVOR')
                .append(
                    g3.indicateStyle().trigger(v => v == 0 ? 1 : 0).append(
                        g3.element('path', {d: 'M 35,-25 l 8,14 l -16,0 z'}).class('g3-bg-fill'),
                        g3.element('path', {d: 'M 35,25 l 8,-14 l -16,0 z'}).class('g3-bg-fill'),
                        g3.element('rect', {x: 10, width: 12, y: -50, height: 30}).style('fill: red'),
                    ),
                ),
            g3.put().y(-35).x(16).css('text {fill: black}').append(
                g3.gaugeLabel('N').y(-9),
                g3.gaugeLabel('A'),
                g3.gaugeLabel('V').y(9),
            ),
            g3.indicatePointer().append(
                g3.element('path', {d: 'M 0,-100 L 0,100'}).class('g3-fg-stroke').style('stroke-width: 4')
            ),
            g3.gauge()
                // the outer ring auto-indicates to show the radial heading
                .metric('radialVOR').unit('deg')
                .fake(g3.forceSeries(0, 360, {wrap: true}))
                .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
                .autoindicate(true)
                .append(
                    g3.axisSector([0,360]).size(30).style('filter: url(#dropShadow3)').class('g3-bg-fill'),
                    g3.axisTicks().step(5).inset(30).size(-5),
                    g3.axisTicks().step(10).inset(30).size(-10),
                    g3.axisTicks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                    g3.axisLabels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
                ),
            // top triangular indicator
            g3.element('path', {d: 'M 0,-80 l 0,10 l 8,14 l -16,0 l 8,-14 z'})
                .class('g3-highlight-fill g3-highlight-stroke'),
        );
}


export function ADFGeneric() {
    return g3.gauge()
        .metric('relativeADF').unit('deg')
        .fake(g3.forceSeries(0, 360, {wrap: true}))
        .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
        .append(
            // pilot set heading gauge
            g3.gauge()
                .metric('headingADF').unit('deg')
                .fake(g3.forceSeries(0, 360, {wrap: true}))
                .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
                .autoindicate(true)
                .append(
                    g3.axisSector([0,360]).size(30).class('g3-bg-fill'),
                    g3.axisTicks().step(5).inset(30).size(-5),
                    g3.axisTicks().step(10).inset(30).size(-10),
                    g3.axisTicks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                    g3.axisLabels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
                ),
            g3.gaugeFace().r(70),
            // arrow ADF bearing indicator
            g3.indicatePointer().append(
                g3.element('path', {d: 'M 0,-65 L 0,60'}).class('g3-fg-stroke').style('stroke-width: 4'),
                g3.element('path', {d: 'M 0,65 l 5,-15 l -10,0 z'}).class('g3-fg-fill'),
            ),
            // heading marks
            g3.axisTicks().step(45).shape('wedge').size(15).width(6).class('g3-highlight-fill g3-no-stroke'),
            // aircraft marker
            g3.element('path', {d: 'M 0,-10 l 0,30 m 5,-5 l -10,0 M 15,0 l -30,0'})
                .class('g3-highlight-stroke').style('stroke-width: 3'),
        );
}

