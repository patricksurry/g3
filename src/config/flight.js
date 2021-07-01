import * as d3 from 'd3';
import * as g3 from '../g3.js';


const headingFormat = (v) => (v%90==0)?'NESW'.charAt(v/90):(v/10);


g3.gauge('altitudeDHC2')
    .metric('altitude').unit('feet')
    .measure(d3.scaleLinear().domain([0, 1000]).range([0, 360]))
    .defs(
        g3.element('pattern', {
            id: 'altitudeWarning',
            width: 10, height: 10,
            patternTransform: 'rotate(45)',
            patternUnits: 'userSpaceOnUse'
        }).append(g3.element('rect', {width: 10, height: 5}).style('stroke: none; fill: white')),
    )
    .append(
        g3.put().rotate(90).append(
            g3.gauge('atmosphericPressureDHC2')
                .metric('atmosphericPressure').unit('hPa')
                .measure(d3.scaleLinear().domain([955,1075]).range([0, 360]))
                .autoindicate(true)
                .append(
                    g3.gaugeFace().style('fill: #111'),
                    g3.axisTicks().step(5).size(5).inset(10),
                    g3.axisTicks().step(1).size(3).inset(10),
                    g3.axisTicks([1013.25]).size(5).inset(10).class('tick-warning'),
                    g3.axisLabels(d3.range(955, 1075, 5)).size(10).orient('relative').rotate(-90),
                )
        ),
        // add an inner circle with warning hatching
        g3.element('circle', {r: 65, fill: 'url(#altitudeWarning)'}),
        // rotating cover for warning stripes, behind the main face
        // see https://www.cfinotebook.net/notebook/avionics-and-instruments/altimeter
        // A striped segment is visible below 10,000', when mask starts to cover, fully covered at 15,000'
        g3.indicatePointer().rescale(v => 3*v/100).append(
            g3.axisSector([625, 1125]).inset(40).size(60).class('gauge-face')
        ).style('filter: url(#dropShadow1)'),
        // add a face with two see-through windows
        g3.gaugeFace().window((_, g) => {
            g3.axisSector([225, 275]).inset(11).size(24)(_, g); // pressure window
            g3.axisSector([425, 575]).inset(40).size(40)(_, g); // warning window
        }).style('filter: url(#dropShadow3)'),  //TODO doesn't drop shadow windows properly?
        g3.axisTicks([250]).shape('wedge').size(10).width(3),
        g3.axisTicks().step(100).size(15),
        g3.axisTicks().step(20),
        g3.axisLabels().step(100).format(v => v/100).size(25),
        g3.axisLabels({950: '100', 50: 'FEET'}).orient('relative').size(8).inset(16),
        // g3.gaugeLabel("ALTITUDE").y(-10).size(15),
        g3.axisLabels({0: '1000 FEET'}).orient('cw').inset(50).size(8),
        g3.axisLabels({0: '10000 FEET'}).orient('cw').inset(62).size(8),
        g3.gaugeLabel("CALIBRATED").x(-40).y(-8).size(6),
        g3.gaugeLabel("TO").x(-40).y(0).size(6),
        g3.gaugeLabel("20,000 FEET").x(-40).y(8).size(6),
        g3.indicatePointer().shape('dagger').rescale(v => v/100),
        g3.indicatePointer().shape('blade').rescale(v => v/10),
        g3.indicatePointer().shape('sword'),
    );

g3.gauge('attitudeDHC2')
    // outer gauge is invisible other than the indicator marks
    .append(
        // the outer dial is a self-indicating roll gauge
        g3.gauge('rollDHC2')
            .metric('roll').unit('degree')
            .measure(d3.scaleLinear().domain([-90,90]).range([-90,90]))
            .autoindicate(true)
            .clip(g3.gaugeFace())
            .append(
                // the inner dial is a self-indicating pitch gauge with a linear scale
                g3.put().rotate(-90).append(
                    g3.gauge('pitchDHC2')
                        .metric('pitch').unit('degree')
                        .measure(d3.scaleLinear().domain([-20, 20]).range([-25,25]))
                        .kind('linear').autoindicate(true)
                        .css('text {fill: #eee}')
                        .append(
                            g3.element('rect', {height: 200, width: 150, y: -100}) // sky
                                .class('sector-blue').style('stroke: white'),
                            g3.element('rect', {height: 200, width: 150, x: -150, y: -100}) // ground
                                .style('fill: #6B5634; stroke: white'),
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
                g3.axisSector([-90,90]).size(20).style('fill: #05AEEF; stroke: white'),
                g3.axisSector([90,270]).size(20).style('fill: #6B5634; stroke: white'),
                g3.axisTicks().step(30).size(20),
                g3.axisTicks([-45, 45]).shape('wedge').inset(10).size(10).width(10),
                g3.axisTicks([-20,-10,10,20]).inset(10).size(10),
            ),
        // add outline, post-clipping
        g3.element('circle', {r: 100}).style('fill: none !important; stroke: white'),
        // top pointer
        g3.element('path', {d: 'M 0,-80 l 5,15 l -10,0 z'})
            .style('stroke: orange; fill: none; stroke-width: 2; filter: url(#dropShadow1)'),
        // grey handlebar support
        g3.element('path', {d: 'M -15,0 a 15,10 0 0 0 30,0 M 0,10 l 0,35'})
            .style('stroke: #333; stroke-width: 3; fill: none; filter: url(#dropShadow1)'),
        g3.element('path', {d: 'M 0,40 l 15,38 a 100,100 0 0 1 -30,0 z'})
            .style('fill: #333; filter: url(#dropShadow1)'),
        // handlebar arms and dot
        g3.element('path', {d: 'M -50,0 l 35,0 m 30,0 l 35,0'})
            .style('stroke: orange; stroke-width: 3; fill: none; filter: url(#dropShadow1)'),
        g3.element('circle', {r: 2}).style('fill: orange !important; stroke: none; filter: url(#dropShadow1)'),
    );


g3.gauge('headingDHC2')
    .metric('heading').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .autoindicate(true)
    .append(
        g3.gaugeFace(),
        g3.axisTicks().step(10).size(10),
        g3.axisTicks().step(5).size(5),
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
        g3.element('circle', {r: deviationScale(2)}).style('fill: none; stroke: white; stroke-width: 2'),
        g3.gaugeLabel('TO').x(35).y(-35).size(8),
        g3.gaugeLabel('FR').x(35).y(35).size(8),
        // use a single styled gauge to flip direction by styling the 'on' state over the 'off' state
        g3.element('path', {d: 'M 35,20 l 7,-8 l -14,0 z', fill: 'orange'}),
        g3.element('path', {d: 'M 35,-20 l 7,8 l -14,0 z'}).class('gauge-face'),
        g3.gauge('VORToFr').metric('toFrVOR').append(
            g3.indicateStyle().trigger(v => v ? 0.9 : 0.1).append(
                g3.element('path', {d: 'M 35,20 l 7,-8 l -14,0 z'}).class('gauge-face'),
                g3.element('path', {d: 'M 35,-20 l 7,8 l -14,0 z', fill: 'orange'}),
            ),
        ),
        // a similar styled gauge hides both to show the unreliable signal indicator
        g3.gauge('VORReliability').metric('reliabilityVOR').append(
            g3.indicateStyle().trigger(v => v ? 0 : 1).append(
                g3.element('path', {d: 'M 35,-20 l 7,8 l -14,0 z'}).class('gauge-face'),
                g3.element('path', {d: 'M 35,20 l 7,-8 l -14,0 z'}).class('gauge-face'),
                g3.element('rect', {x: 10, width: 12, y: -50, height: 30}).style('fill: red'),
            ),
        ),
        g3.put().y(-28).x(16).rotate(90).append(g3.gaugeLabel('NA V').rotate(-90).style('fill: black')),
        g3.indicatePointer().append(
            g3.element('path', {d: 'M 0,-100 L 0,100'})
        ).css('path {stroke: white; stroke-width: 4}'),
        g3.gauge('radialVORDHC2')
            // the outer ring auto-indicates to show the radial heading
            .metric('radialVOR').unit('degree')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(
                g3.axisSector([0,360]).size(30).style('filter: url(#dropShadow3)').class('gauge-face'),
                g3.axisTicks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                g3.axisTicks().step(10).inset(30).size(-10),
                g3.axisTicks().step(5).inset(30).size(-5),
                g3.axisLabels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
            ),
        // top triangular indicator
        g3.element('path', {d: 'M 0,-80 l 0,10 l 8,14 l -16,0 l 8,-14 z'})
            .style('stroke: orange; fill: orange; stroke-width: 2'),
    );

g3.gauge('ADFDHC2')
    .metric('relativeADF').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .append(
        // pilot set heading
        g3.gauge('headingADFDHC2')
            .metric('headingADF').unit('degree')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(
                g3.axisSector([0,360]).size(30).class('gauge-face'),
                g3.axisTicks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                g3.axisTicks().step(10).inset(30).size(-10),
                g3.axisTicks().step(5).inset(30).size(-5),
                g3.axisLabels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
            ),
        g3.gaugeFace().r(70),
        // arrow ADF bearing indicator
        g3.indicatePointer().append(
            g3.element('path', {d: 'M 0,-65 L 0,65 l 3,-10 l -6,0 L 0,65'})
        ).css('path {fill: yellow; stroke: yellow; stroke-width: 3; stroke-linecap: square}'),
        // heading marks
        g3.axisTicks().step(45).shape('wedge').size(15).width(6).css('path {fill: orange;}'),
        // aircraft marker
        g3.element('path', {d: 'M 0,-10 l 0,30 m 5,-5 l -10,0 M 15,0 l -30,0'})
            .style('stroke-width: 3; stroke: orange'),
    );

g3.gauge('vsiDHC2')
    .metric('verticalSpeed').unit('feetPerMinute')
    .measure(d3.scaleLinear().domain([-2000, 2000]).range([90, 90+360]))
    .append(
        g3.gaugeFace(),
        g3.axisTicks().step(500).size(15),
        g3.axisTicks().step(100).size(5),
        g3.axisLabels().step(1000).format(v => Math.abs(v/100)),
        g3.axisLabels().step(1000).start(-1500).format(v => Math.abs(v/100)).size(16),
        g3.gaugeLabel("VERTICAL SPEED").y(-20).size(10),
        g3.gaugeLabel("100 FEET PER MIMUTE").y(-10).size(8),
        g3.gaugeLabel("UP").x(-55).y(-35).size(6),
        g3.gaugeLabel("DOWN").x(-55).y(35).size(6),
        g3.indicatePointer().shape('sword'),
    );

//TODO add the ball indicator and finish this
g3.gauge('turnCoordinatorDHC2')
    .metric('turnrate').unit('degreesPerSecond')
    .measure(d3.scaleLinear().domain([-3, 3]).range([-20, 20]))
    .append(
        g3.gaugeFace(),
        g3.axisTicks([-16.5, -13.5, 13.5, 16.5]).size(10),
        g3.gaugeScrew().shape('robertson').y(50),
        g3.gaugeScrew().shape('phillips').y(-50),
        g3.gaugeScrew().x(-50),
        g3.gaugeScrew().x(50),
        g3.indicatePointer().shape('aircraft-turn'),
    );

g3.gauge('airspeedDHC2')
    .metric('airspeed').unit('knot')
    .measure(d3.scaleLinear().domain([40,200]).range([30, 350]))
    .append(
        g3.gaugeFace(),
        g3.axisSector([60, 105]).inset(10).size(5).class('sector-light'),  // flaps
        g3.axisSector([60, 145]).size(5).class('sector-green'),  // normal
        g3.axisSector([145, 180]).size(5).class('sector-red'),  // max
        g3.axisTicks().step(10).size(15),
        g3.axisTicks().step(5).size(10),
        g3.axisTicks([180]).size(15).class('tick-warning'),
        g3.axisLabels().step(20).inset(30),
        g3.gaugeLabel("AIRSPEED").size(12).y(-33),
        g3.gaugeLabel("MPH").y(33),
        g3.indicatePointer().shape('sword'),
    );
