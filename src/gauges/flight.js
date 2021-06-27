import * as d3 from 'd3';
import {gauge} from '../gauge.js';


const headingFormat = (v) => (v%90==0)?'NESW'.charAt(v/90):(v/10);


gauge('altitudeDHC2')
    .metric('altitude').unit('feet')
    .measure(d3.scaleLinear().domain([0, 1000]).range([0, 360]))
    .defs(
        gauge.element('pattern', {
            id: 'altitudeWarning',
            width: 10, height: 10,
            patternTransform: 'rotate(45)',
            patternUnits: 'userSpaceOnUse'
        }).append(gauge.element('rect', {width: 10, height: 5}).style('stroke: none; fill: white')),
    )
    .append(
        gauge.put().rotate(90).append(
            gauge('atmosphericPressureDHC2')
                .metric('atmosphericPressure').unit('hPa')
                .measure(d3.scaleLinear().domain([955,1075]).range([0, 360]))
                .autoindicate(true)
                .append(
                    gauge.face().style('fill: #111'),
                    gauge.axis.ticks().step(5).size(5).inset(10),
                    gauge.axis.ticks().step(1).size(3).inset(10),
                    gauge.axis.ticks([1013.25]).size(5).inset(10).style('stroke: red'),
                    gauge.axis.labels(d3.range(955, 1075, 5)).size(10).orient('relative').rotate(-90),
                )
        ),
        // add an inner circle with warning hatching
        gauge.element('circle', {r: 65, fill: 'url(#altitudeWarning)'}),
        // rotating cover for warning stripes, behind the main face
        // see https://www.cfinotebook.net/notebook/avionics-and-instruments/altimeter
        // A striped segment is visible below 10,000', when mask starts to cover, fully covered at 15,000'
        gauge.indicator.pointer().rescale(v => 3*v/100).append(
            gauge.axis.sector([625, 1125]).inset(40).size(60).style('fill: #333')
        ).style('filter: url(#dropShadow1)'),
        // add a face with two see-through windows
        gauge.face().window((_, g) => {
            gauge.axis.sector([225, 275]).inset(11).size(24)(_, g); // pressure window
            gauge.axis.sector([425, 575]).inset(40).size(40)(_, g); // warning window
        }).style('filter: url(#dropShadow3)'),  //TODO doesn't drop shadow windows properly?
        gauge.axis.ticks([250]).shape('wedge').size(10).width(3),
        gauge.axis.ticks().step(100).size(15),
        gauge.axis.ticks().step(20),
        gauge.axis.labels().step(100).format(v => v/100).size(25),
        gauge.axis.labels({950: '100', 50: 'FEET'}).orient('relative').size(8).inset(16),
        // gauge.label("ALTITUDE").y(-10).size(15),
        gauge.axis.labels({0: '1000 FEET'}).orient('cw').inset(50).size(8),
        gauge.axis.labels({0: '10000 FEET'}).orient('cw').inset(62).size(8),
        gauge.label("CALIBRATED").x(-40).y(-8).size(6),
        gauge.label("TO").x(-40).y(0).size(6),
        gauge.label("20,000 FEET").x(-40).y(8).size(6),
        gauge.indicator.pointer().shape('dagger').rescale(v => v/100),
        gauge.indicator.pointer().shape('blade').rescale(v => v/10),
        gauge.indicator.pointer().shape('sword'),
    );

gauge('attitudeDHC2')
    // outer gauge is invisible other than the indicator marks
    .append(
        // the outer dial is a self-indicating roll gauge
        gauge('rollDHC2')
            .metric('roll').unit('degree')
            .measure(d3.scaleLinear().domain([-90,90]).range([-90,90]))
            .autoindicate(true)
            .clip(gauge.face())
            .append(
                // the inner dial is a self-indicating pitch gauge with a linear scale
                gauge.put().rotate(-90).append(
                    gauge('pitchDHC2')
                        .metric('pitch').unit('degree')
                        .measure(d3.scaleLinear().domain([-20, 20]).range([-25,25]))
                        .kind('linear').autoindicate(true)
                        .css('text {fill: #eee}')
                        .append(
                            gauge.element('rect', {height: 200, width: 150, y: -100}) // sky
                                .style('fill: #05AEEF; stroke: white'),
                            gauge.element('rect', {height: 200, width: 150, x: -150, y: -100}) // ground
                                .style('fill: #6B5634; stroke: white'),
                            gauge.axis.ticks([-20,20]).size(50).inset(-25),
                            gauge.axis.ticks([-10,10]).size(30).inset(-15),
                            gauge.axis.ticks().start(-15).step(10).size(20).inset(-10),
                            gauge.axis.labels([-20,20]).inset(35).format(Math.abs).rotate(90).size(12),
                            gauge.axis.labels([-20,20]).inset(-35).format(Math.abs).rotate(90).size(12),
                            gauge.axis.labels([-10,10]).inset(25).format(Math.abs).rotate(90).size(12),
                            gauge.axis.labels([-10,10]).inset(-25).format(Math.abs).rotate(90).size(12),
                        )
                ),
                gauge.axis.sector([0, 360]).size(20).style('filter: url(#dropShadow3)'),
                gauge.axis.sector([-90,90]).size(20).style('fill: #05AEEF; stroke: white'),
                gauge.axis.sector([90,270]).size(20).style('fill: #6B5634; stroke: white'),
                gauge.axis.ticks().step(30).size(20),
                gauge.axis.ticks([-45, 45]).shape('wedge').inset(10).size(10).width(10),
                gauge.axis.ticks([-20,-10,10,20]).inset(10).size(10),
            ),
        // outline, post-clipping
        gauge.element('circle', {r: 100}).style('fill: none !important; stroke: white'),
        // top pointer
        gauge.element('path', {d: 'M 0,-80 l 5,15 l -10,0 z'})
            .style('stroke: orange; fill: none; stroke-width: 2; filter: url(#dropShadow1)'),
        // grey handlebar support
        gauge.element('path', {d: 'M -15,0 a 15,10 0 0 0 30,0 M 0,10 l 0,35'})
            .style('stroke: #333; stroke-width: 3; fill: none; filter: url(#dropShadow1)'),
        gauge.element('path', {d: 'M 0,40 l 15,38 a 100,100 0 0 1 -30,0 z'})
            .style('fill: #333; filter: url(#dropShadow1)'),
        // handlebar arms and dot
        gauge.element('path', {d: 'M -50,0 l 35,0 m 30,0 l 35,0'})
            .style('stroke: orange; stroke-width: 3; fill: none'),
        gauge.element('circle', {r: 2}).style('fill: orange !important; stroke: none; filter: url(#dropShadow1)'),
    );


gauge('headingDHC2')
    .metric('heading').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .autoindicate(true)
    .append(
        gauge.face(),
        gauge.axis.ticks().step(10).size(10),
        gauge.axis.ticks().step(5).size(5),
        gauge.axis.labels().step(30).orient('relative').format(headingFormat),
        gauge.indicator.pointer().shape('aircraft-heading'),
    );

gauge('VORDHC2')
    .metric('radialDeviation').unit('degree')
    .measure(d3.scaleLinear().domain([-10,10]).range([-50,50]))
    .kind('linear')
    .append(
        gauge.face(),
        //TODO change central dot
        gauge.axis.ticks().step(2).shape('dot').size(3),
        gauge.indicator.pointer().append(
            gauge.element('path', {d: 'M 0,-100 L 0,100'})
        ).css('path {stroke: white; stroke-width: 4}'),
        gauge('radialVORDHC2')
            .metric('radialVOR').unit('degree')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(
                gauge.axis.sector([0,360]).size(30).style('fill: #333; filter: url(#dropShadow3)'),
                gauge.axis.ticks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                gauge.axis.ticks().step(10).inset(30).size(-10),
                gauge.axis.ticks().step(5).inset(30).size(-5),
                gauge.axis.labels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
            ),
        // top indicator
        gauge.element('path', {d: 'M 0,-80 l 0,10 l 8,14 l -16,0 l 8,-14 z'})
            .style('stroke: orange; fill: orange; stroke-width: 2'),
// TODO TO, From, GS(?), no-signal indicators
    );

gauge('ADFDHC2')
    .metric('relativeADF').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .append(
        // pilot set heading
        gauge('headingADFDHC2')
            .metric('headingADF').unit('degree')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(
                gauge.axis.sector([0,360]).size(30).style('fill: #333'),
                gauge.axis.ticks().step(30).inset(30).size(-10).style('stroke-width: 2'),
                gauge.axis.ticks().step(10).inset(30).size(-10),
                gauge.axis.ticks().step(5).inset(30).size(-5),
                gauge.axis.labels().step(30).inset(10).size(16).orient('relative').format(headingFormat),
            ),
        gauge.face().r(70),
        // arrow ADF bearing indicator
        gauge.indicator.pointer().append(
            gauge.element('path', {d: 'M 0,-65 L 0,65 l 3,-10 l -6,0 L 0,65'})
        ).css('path {fill: yellow; stroke: yellow; stroke-width: 3; stroke-linecap: square}'),
        // heading marks
        gauge.axis.ticks().step(45).shape('wedge').size(15).width(6).css('path {fill: orange;}'),
        // aircraft marker
        gauge.element('path', {d: 'M 0,-10 l 0,30 m 5,-5 l -10,0 M 15,0 l -30,0'})
            .style('stroke-width: 3; stroke: orange'),
    );

gauge('vsiDHC2')
    .metric('verticalSpeed').unit('feetPerMinute')
    .measure(d3.scaleLinear().domain([-2000, 2000]).range([90, 90+360]))
    .append(
        gauge.face(),
        gauge.axis.ticks().step(500).size(15),
        gauge.axis.ticks().step(100).size(5),
        gauge.axis.labels().step(1000).format(v => Math.abs(v/100)),
        gauge.axis.labels().step(1000).start(-1500).format(v => Math.abs(v/100)).size(16),
        gauge.label("VERTICAL SPEED").y(-20).size(10),
        gauge.label("100 FEET PER MIMUTE").y(-10).size(8),
        gauge.label("UP").x(-55).y(-35).size(6),
        gauge.label("DOWN").x(-55).y(35).size(6),
        gauge.indicator.pointer().shape('sword'),
    );

//TODO add the ball indicator
gauge('turnCoordinatorDHC2')
    .metric('turnrate').unit('degreesPerSecond')
    .measure(d3.scaleLinear().domain([-3, 3]).range([-20, 20]))
    .append(
        gauge.face(),
        gauge.axis.ticks([-16.5, -13.5, 13.5, 16.5]).size(10),
        gauge.indicator.pointer().shape('aircraft-turn'),
    );

gauge('airspeedDHC2')
    .metric('airspeed').unit('knot')
    .measure(d3.scaleLinear().domain([40,200]).range([30, 350]))
    .append(
        gauge.face(),
        gauge.axis.sector([60, 105]).inset(10).size(5).style('fill: #ccc'),  // flaps
        gauge.axis.sector([60, 145]).size(5).style('fill: green'),  // normal
        gauge.axis.sector([145, 180]).size(5).style('fill: red'),  // max
        gauge.axis.ticks().step(10).size(15),
        gauge.axis.ticks().step(5).size(10),
        gauge.axis.ticks([180]).size(20).css('stroke: red'),  //TODO shared class?
        gauge.axis.labels().step(20).inset(33),
        gauge.label("AIRSPEED").y(-33),
        gauge.label("MPH").y(33),
        gauge.indicator.pointer().shape('sword'),
    );
