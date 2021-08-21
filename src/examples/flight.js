import * as d3 from 'd3';
import * as g3 from '../g3.js';


g3.fakeMetrics.register({
    pressureSetting: g3.forceSeries(955, 1075),
    altitude: g3.forceSeries(0, 30000, {fmax: 0.001}),
    pitch: g3.forceSeries(-25, 25),
    roll: g3.forceSeries(-25, 25),
    slip: g3.forceSeries(-20,20),
    heading: g3.forceSeries(0, 360, {wrap: true}),
    radialDeviation: g3.forceSeries(-10, 10),
    radialVOR: g3.forceSeries(0, 360, {wrap: true}),
    toFrVOR: g3.categoricalSeries([true, false]),
    reliabilityVOR: g3.categoricalSeries([true, false]),
    headingADF: g3.forceSeries(0, 360, {wrap: true}),
    relativeADF: g3.forceSeries(0, 360, {wrap: true}),
    verticalSpeed: g3.forceSeries(-1500, 1500),
    turnrate: g3.forceSeries(-3, 3),
    airspeed: g3.forceSeries(40, 200),
});


// format a heading in degrees like 270 => W, 240 => 24
const headingFormat = (v) => (v%90==0)?'NESW'.charAt(v/90):(v/10);


g3.gauge('altitudeDHC2')
    .metric('altitude').unit('feet')
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
        g3.indicatePointer().convert(v => 3*v/100).append(
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
        g3.indicatePointer().shape('dagger').convert(v => v/100),
        g3.indicatePointer().shape('blade').convert(v => v/10),
        g3.indicatePointer().shape('sword'),
    );

g3.gauge('attitudeDHC2')
    // outer gauge is invisible other than the indicator marks
    .append(
        // the outer dial is a self-indicating roll gauge
        g3.gauge()
            .metric('roll').unit('degree')
            .measure(d3.scaleLinear().domain([-90,90]).range([-90,90]))
            .autoindicate(true)
            .clip(g3.gaugeFace())
            .append(
                // the inner dial is a self-indicating pitch gauge with a linear scale
                g3.put().rotate(-90).append(
                    g3.gauge()
                        .metric('pitch').unit('degree')
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


g3.gauge('headingDHC2')
    .metric('heading').unit('degree')
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

let deviationScale = d3.scaleLinear().domain([-10,10]).range([-50,50]);

g3.gauge('VORDHC2')
    // the inner part of the VOR gauge measures the deviation from selected radial
    .metric('radialDeviation').unit('degree')
    .measure(deviationScale)
    .kind('linear')
    .clip(g3.gaugeFace())
    .append(
        g3.gaugeFace(),
        g3.axisTicks([-10,-8,-6,-4,0,4,6,8,10]).shape('dot').size(3),
        g3.element('circle', {r: deviationScale(2)}).class('g3-axis-ticks').style('stroke-width: 2; fill: none'),
        g3.gaugeLabel('TO').x(35).y(-35).size(8),
        g3.gaugeLabel('FR').x(35).y(35).size(8),
        // use a single styled gauge to flip to=0/from=1 dir by styling the 'on' state over the 'off' state
        g3.element('path', {d: 'M 35,25 l 8,-14 l -16,0 z'}).class('g3-highlight-fill'),
        g3.element('path', {d: 'M 35,-25 l 8,14 l -16,0 z'}).class('g3-bg-fill'),
        g3.gauge().metric('toFrVOR').append(
            g3.indicateStyle().trigger(v => v ? 0.9 : 0.1).append(
                g3.element('path', {d: 'M 35,25 l 8,-14 l -16,0 z'}).class('g3-bg-fill'),
                g3.element('path', {d: 'M 35,-25 l 8,14 l -16,0 z'}).class('g3-highlight-fill'),
            ),
        ),
        // a similar styled gauge hides both to show the unreliable signal indicator
        g3.gauge().metric('reliabilityVOR').append(
            g3.indicateStyle().trigger(v => v ? 0 : 1).append(
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
            .metric('radialVOR').unit('degree')
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

g3.gauge('ADFDHC2')
    .metric('relativeADF').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .append(
        // pilot set heading gauge
        g3.gauge()
            .metric('headingADF').unit('degree')
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

g3.gauge('vsiDHC2')
    .metric('verticalSpeed').unit('feetPerMinute')
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
        g3.indicatePointer().shape('sword'),
    );

g3.gauge('turnCoordinatorDHC2')
    .metric('turnrate').unit('degreesPerSecond')
    .measure(d3.scaleLinear().domain([-3, 3]).range([-20, 20]))
    .append(
        // gaguge for slip, degress of ball deflection
        g3.gauge()
            .metric('slip').unit('degree')
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
                    g3.indicatePointer().append(
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
        g3.indicatePointer().shape('aircraft-turn'),
    );

g3.gauge('airspeedDHC2')
    .metric('airspeed').unit('knot')
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
