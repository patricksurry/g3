import * as d3 from 'd3';
import * as g3 from '../g3.js';


export const
    // format a heading in degrees like 270 => W, 240 => 24
    headingFormat = (v) => (v%90==0)?'NESW'.charAt(v/90):(v/10),
    deviationScale = d3.scaleLinear().domain([-10,10]).range([-50,50]);


export function altitudeGeneric() {
    return g3.gauge()
        .metric('altitude').unit('ft')
        .fake(g3.forceSeries(0, 30000, {fmax: 0.001}))
        .measure(d3.scaleLinear().domain([0, 1000]).range([0, 360]))
        .defs(
            g3.element('pattern', {
                id: 'altitudeDangerPattern',
                width: 10, height: 10,
                patternTransform: 'rotate(45)',
                patternUnits: 'userSpaceOnUse'
            }).append(g3.element('rect', {width: 10, height: 5}).class('g3-fg-fill')),
        )
        .append(
            // self-indicating gauge for pressure, to view through window
            g3.put().rotate(90).append(
                g3.gauge()
                    .metric('pressureSetting').unit('hPa')
                    .fake(g3.forceSeries(955, 1075))
                    .measure(d3.scaleLinear().domain([955,1075]).range([0, 360]))
                    .autoindicate(true)
                    .append(
                        g3.gaugeFace().style('fill: #111'),
                        g3.axisTicks().step(5).size(5).inset(10),
                        g3.axisTicks().step(1).size(3).inset(10),
                        g3.axisTicks([1013.25]).size(5).inset(10).class('g3-danger-stroke'),
                        g3.axisLabels(d3.range(955, 1075, 5)).size(10).orient('relative').rotate(-90),
                    )
            ),
            // add an inner circle with danger hatching
            g3.element('circle', {r: 65, fill: 'url(#altitudeDangerPattern)'}),
            // rotating cover for danger stripes, behind the main face
            // see https://www.cfinotebook.net/notebook/avionics-and-instruments/altimeter
            // A striped segment is visible below 10,000', when mask starts to cover, fully covered at 15,000'
            g3.indicatePointer().rescale(v => 3*v/100).append(
                g3.axisSector([625, 1125]).inset(40).size(60).class('g3-bg-fill')
            ).style('filter: url(#dropShadow1)'),
            // add a face with two see-through windows
            g3.gaugeFace().window((_, g) => {
                g3.axisSector([225, 275]).inset(11).size(24).style('fill: black')(_, g); // pressure window
                g3.axisSector([425, 575]).inset(40).size(40).style('fill: black')(_, g); // low-altitude danger window
            }).style('filter: url(#dropShadow3)'),  //TODO doesn't drop shadow windows properly?
            g3.axisTicks([250]).shape('wedge').size(10).width(3),
            g3.axisTicks().step(20),
            g3.axisTicks().step(100).size(15).style('stroke-width: 2'),
            g3.axisLabels().step(100).format(v => v/100).size(25),
            g3.axisLabels({950: '100', 50: 'FEET'}).orient('relative').size(8).inset(16),
            // g3.gaugeLabel("ALTITUDE").y(-10).size(15),
            g3.axisLabels({0: '1000 FEET'}).orient('clockwise').inset(50).size(8),
            g3.axisLabels({0: '10000 FEET'}).orient('clockwise').inset(62).size(8),
            g3.gaugeLabel("CALIBRATED").x(-40).y(-8).size(6),
            g3.gaugeLabel("TO").x(-40).y(0).size(6),
            g3.gaugeLabel("20,000 FEET").x(-40).y(8).size(6),
            g3.indicatePointer().shape('dagger').rescale(v => v/100),
            g3.indicatePointer().shape('blade').rescale(v => v/10),
            g3.indicatePointer().shape('sword'),
        );
}


export function attitudeGeneric() {
    return g3.gauge()
        // outer gauge is invisible other than the indicator marks
        .append(
            // the outer dial is a self-indicating roll gauge
            g3.gauge()
                .metric('roll').unit('deg')
                .fake(g3.forceSeries(-25, 25))
                .measure(d3.scaleLinear().domain([-90,90]).range([-90,90]))
                .autoindicate(true)
                .clip(g3.gaugeFace())
                .append(
                    // the inner dial is a self-indicating pitch gauge with a linear scale
                    g3.put().rotate(-90).append(
                        g3.gauge()
                            .metric('pitch').unit('deg')
                            .fake(g3.forceSeries(-25, 25))
                            .measure(d3.scaleLinear().domain([-20, 20]).range([-25,25]))
                            .kind('linear').autoindicate(true)
                            .css('text {fill: #ddd}')
                            .append(
                                g3.element('rect', {height: 200, width: 150, y: -100}) // sky
                                    .class('g3-sky-fill g3-fg-stroke'),
                                g3.element('rect', {height: 200, width: 150, x: -150, y: -100}) // ground
                                    .class('g3-ground-fill g3-fg-stroke'),
                                g3.axisTicks([-20,20]).size(50).inset(-25),
                                g3.axisTicks([-10,10]).size(30).inset(-15),
                                g3.axisTicks().start(-15).step(10).size(20).inset(-10),
                                g3.axisLabels([-20,20]).inset(35).format(Math.abs).rotate(90).size(12),
                                g3.axisLabels([-20,20]).inset(-35).format(Math.abs).rotate(90).size(12),
                                g3.axisLabels([-10,10]).inset(25).format(Math.abs).rotate(90).size(12),
                                g3.axisLabels([-10,10]).inset(-25).format(Math.abs).rotate(90).size(12),
                            )
                    ),
                    g3.axisSector([0, 360]).size(20).style('filter: url(#dropShadow3)'),
                    g3.axisSector([-90,90]).size(20).class('g3-sky-fill g3-fg-stroke'),
                    g3.axisSector([90,270]).size(20).class('g3-ground-fill g3-fg-stroke'),
                    g3.axisTicks().step(30).size(20),
                    g3.axisTicks([-45, 45]).shape('wedge').inset(10).size(10).width(10),
                    g3.axisTicks([-20,-10,10,20]).inset(10).size(10),
                ),
            // add outline, post-clipping to avoid losing half the exterior
            g3.element('circle', {r: 100}).class('g3-fg-stroke'),
            g3.put().append(
                // top pointer
                g3.element('path', {d: 'M 0,-80 l 5,15 l -10,0 z'})
                    .class('g3-highlight-stroke g3-no-fill'),
                // grey handlebar support
                g3.element('path', {d: 'M -15,0 a 15,10 0 0 0 30,0 M 0,10 l 0,35'})
                    .class('g3-bg-stroke').style('stroke-width: 2'),
                g3.element('path', {d: 'M 0,40 l 15,38 a 100,100 0 0 1 -30,0 z'})
                    .class('g3-bg-fill').style('stroke-width: 2'),
                // handlebar arms and dot
                g3.element('path', {d: 'M -50,0 l 35,0 m 30,0 l 35,0'})
                    .class('g3-highlight-stroke g3-no-fill').style('filter: url(#dropShadow1)'),
                g3.element('circle', {r: 2}).class('g3-highlight-fill'),
            ).style('filter: url(#dropShadow1)')
        );
}


export function headingGeneric() {
    return g3.gauge()
        .metric('heading').unit('deg')
        .fake(g3.forceSeries(0, 360, {wrap: true}))
        .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
        .autoindicate(true)
        .append(
            g3.gaugeFace(),
            g3.axisTicks().step(5).size(5),
            g3.axisTicks().step(10).size(10),
            g3.axisTicks().step(30).size(10).style('stroke-width: 2'),
            g3.axisLabels().step(30).orient('relative').format(headingFormat),
            g3.indicatePointer().shape('aircraft-heading'),
        );
}


export function VSIGeneric() {
    return g3.gauge()
        .metric('verticalSpeed').unit('ft/min')
        .fake(g3.forceSeries(-2500, 2500))
        .measure(d3.scaleLinear().domain([-2000, 2000]).range([90, 90+360]))
        .append(
            g3.gaugeFace(),
            g3.axisTicks().step(100).size(5),
            g3.axisTicks().step(500).size(15).style('stroke-width: 2'),
            g3.axisLabels().step(1000).format(v => Math.abs(v/100)),
            g3.axisLabels().step(1000).start(-1500).format(v => Math.abs(v/100)).size(16),
            g3.gaugeLabel("VERTICAL SPEED").y(-25).size(12),
            g3.gaugeLabel("100 FEET PER MIMUTE").y(-10).size(10),
            // add up/down arrows as sector lines plus custom tick marks
            g3.axisSector([100,400]).size(0).inset(25).class('g3-fg-stroke').style('stroke-width: 2'),
            g3.axisSector([-100,-400]).size(0).inset(25).class('g3-fg-stroke').style('stroke-width: 2'),
            // TODO this should be a custom tick mark shape, with access to current tick val?
            (_, g) => {
                _.selectAll(null).data([-400, 400])
                .enter().append('path')
                    .attr('d', "M 2,0 l -7,4 l 0,-8 Z")
                    .attr('transform', d => g.marktransform(d, 25) + (d < 0 ? ' rotate(-180)':''))
                    .attr('class', 'g3-fg-fill')
            },
            g3.gaugeLabel("UP").x(-57).y(-37).size(8).style('text-anchor: start'),
            g3.gaugeLabel("DOWN").x(-57).y(37).size(8).style('text-anchor: start'),
            g3.indicatePointer().shape('sword').clamp([-1950, 1950]),
        );
}


export function turnCoordinatorGeneric() {
    return g3.gauge()
        .metric('turnrate').unit('deg/s')
        .fake(g3.forceSeries(-10, 10))
        .measure(d3.scaleLinear().domain([-3, 3]).range([-20, 20]))
        .append(
            // gaguge for slip, degrees of ball deflection
            g3.gauge()
                .metric('slip').unit('deg')
                .fake(g3.forceSeries(-25, 25))
                .measure(d3.scaleLinear().domain([-20,20]).range([170,190]))
                .r(300)
                .append(
                    g3.gaugeFace(),
                    g3.gaugeLabel('TURN COORDINATOR').size(11).y(22),
                    g3.gaugeLabel('2 MIN').size(14).y(65),
                    g3.put().y(-255).append(
                        // background for the tube
                        g3.axisSector([-30,30]).inset(-9).size(18).style('fill: #c0c0a8; filter: url(#dropShadow3)'),
                        // add ball as pointer
                        g3.indicatePointer().clamp([-20,20]).append(
                            g3.put().scale(0.8,1).y(-300).rotate(-180).append(
                                // add ball background plus a highlight, with the rotate(-180) to avoid having
                                // the highlight flipped since the ball is tyipcally indicating near 180 rotation
                                g3.element('circle', {r: 8}).style('fill: #333'),
                                g3.element('circle', {r: 8}).class('g3-highlight'),
                            )
                        ),
                        g3.axisTicks([-3,3]).inset(-9).size(18).style('stroke-width: 2; stroke: #666'),
                        // add a blurred highlight to the tube
                        g3.axisSector([-30,30]).inset(0).size(6)
                            .style('fill: white; filter: url(#gaussianBlur1); fill-opacity: 0.33')
                    )
                ),
            g3.axisSector([0,360]).size(24).class('g3-bg-fill').style('filter: url(#dropShadow2)'),
            g3.axisTicks([-16.5, -13.5, 13.5, 16.5]).size(24).style('stroke-width: 4'),
            g3.gaugeLabel('D.C.').y(-92),
            g3.gaugeLabel('ELEC.').y(-82),
            g3.gaugeLabel('NO PITCH').y(80).size(8),
            g3.gaugeLabel('INFORMATION').y(90).size(8),
            g3.indicatePointer().clamp([-9,9]).shape('aircraft-turn'),
        );
}

