import * as d3 from 'd3';
import * as g3 from '../g3';
import type { GaugeComponent } from '../types';


export const
    // format a heading in degrees like 270 => W, 240 => 24
    headingFormat = (v: number) => (v%90==0)?'NESW'.charAt(v/90):(v/10),
    deviationScale = d3.scaleLinear().domain([-10,10]).range([-50,50]);


/**
 * Three-pointer barometric altimeter (hundreds, thousands, and ten-thousands of feet)
 * with a self-indicating Kollsman pressure window (hPa) and low-altitude striped warning sector.
 */
export function altitudeGeneric(): GaugeComponent {
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
            g3.gaugeFace().window((_: any, g: any) => {
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


/**
 * Artificial horizon / attitude indicator combining a circular self-indicating roll dial
 * with a clipped linear self-indicating pitch scale.
 */
export function attitudeGeneric(): GaugeComponent {
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


// shading for a ball lit from the viewer: brightness falls off as cos(angle to the viewer), i.e. sqrt(1 - s^2)
// at radius fraction s, centred on the ball so it stays circular whatever shape it fills
function ballShading(id: string, r: number, strength = 0.85) {
    return g3.element('radialGradient', {id, gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r}).append(
        ...[0, 0.3, 0.5, 0.65, 0.75, 0.85, 0.92, 0.97, 1].map(s => g3.element('stop', {
            offset: s, 'stop-color': '#000', 'stop-opacity': +(strength * (1 - Math.sqrt(1 - s * s))).toFixed(3),
        }))
    );
}

// arc length in SVG units of `deg` degrees on a ball of radius r
const arc = (r: number) => (deg: number) => deg * Math.PI / 180 * r;


/**
 * Attitude indicator ball seen through a round faceplate aperture,
 * rolling, pitching and turning in three dimensions with a heading scale along the horizon.
 */
export function attitudeBall(): GaugeComponent {
    const A = 78,       // faceplate aperture radius
        B = 104,        // the ball is larger than the aperture, so its edge is never seen
        w = arc(B);
    // the pitch ladder repeats every 30° of heading so it reads all the way round the ball
    const ladder = d3.range(0, 360, 30).flatMap(lon => [
        g3.axisTicks(d3.range(-80, 81, 10).filter(v => v)).inset(w(lon - 7)).size(w(14)).style('stroke: #fff'),
        g3.axisTicks(d3.range(-75, 76, 10)).inset(w(lon - 3)).size(w(6)).style('stroke: #fff'),
    ]);
    const ladderLabels = [0, 90, 180, 270].flatMap(lon => [-11, 11].map(dx =>
        g3.axisLabels(d3.range(-80, 81, 10).filter(v => v)).inset(w(lon + dx)).rotate(90).size(8).format(Math.abs)
    ));
    return g3.gauge()
        .defs(
            ballShading('g3-attitude-ball-shade', B),
            // shadow cast by the faceplate just inside the aperture
            g3.element('radialGradient', {id: 'g3-attitude-ball-rim', gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: A}).append(
                ...[[0.8, 0], [0.92, 0.3], [0.98, 0.6], [1, 0.8]].map(([offset, a]) =>
                    g3.element('stop', {offset, 'stop-color': '#000', 'stop-opacity': a}))
            ),
        )
        .css('text {fill: #fff}')
        .append(
            g3.gaugeFace(),
            // roll turns the whole ball in the plane of the panel
            g3.gauge()
                .metric('roll').unit('deg')
                .fake(g3.forceSeries(-30, 30))
                .measure(d3.scaleLinear().domain([-180, 180]).range([-180, 180]))
                .autoindicate(true)
                .clip(g3.element('circle', {r: A}))
                .append(
                    g3.gauge()
                        .kind('ball.yaw').r(B)
                        .metric('heading').unit('deg')
                        .fake(g3.forceSeries(0, 360, {wrap: true}))
                        .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
                        .autoindicate(true)
                        .append(
                            g3.axisSector([0, 360]).inset(-w(90)).size(w(90)).class('g3-sky-fill'),
                            g3.axisSector([0, 360]).size(w(90)).class('g3-ground-fill'),
                            g3.axisLine().style('stroke: #fff; stroke-width: 1.5'),
                            g3.axisTicks().step(5).size(w(1.5)).style('stroke: #fff'),
                            g3.axisTicks().step(10).size(w(3)).style('stroke: #fff'),
                            g3.axisLabels().step(30).inset(w(6.5)).size(11).format(headingFormat),
                            // a pitch gauge nested in the heading ball pitches the same ball
                            g3.gauge()
                                .kind('ball.pitch')
                                .metric('pitch').unit('deg')
                                .fake(g3.forceSeries(-20, 20))
                                .measure(d3.scaleLinear().domain([-90, 90]).range([-90, 90]))
                                .autoindicate(true)
                                .append(...ladder, ...ladderLabels),
                        ),
                    g3.element('circle', {r: A, fill: 'url(#g3-attitude-ball-shade)'}),
                    g3.element('circle', {r: A, fill: 'url(#g3-attitude-ball-rim)'}),
                    // sky pointer turns with the horizon
                    g3.element('path', {d: `M 0,${-A + 1} l -5,10 l 10,0 z`}).class('g3-highlight-fill'),
                ),
            g3.element('circle', {r: A + 0.5}).style('stroke: #3a3a3a'),
            // bank scale painted on the faceplate
            g3.gauge()
                .r(A)
                .measure(d3.scaleLinear().domain([-180, 180]).range([-180, 180]))
                .append(
                    g3.axisTicks([-60, -30, 30, 60]).inset(-14).size(11).style('stroke-width: 2'),
                    g3.axisTicks([-45, -20, -10, 10, 20, 45]).inset(-9).size(6).style('stroke-width: 2'),
                    g3.element('path', {d: `M 0,${-A - 3} l -5,-10 l 10,0 z`}).class('g3-fg-fill'),
                ),
            // fixed aircraft symbol
            g3.element('path', {d: 'M -50,0 h 30 l 10,8 l 10,-8 l 10,8 l 10,-8 h 30'})
                .class('g3-highlight-stroke').style('stroke-width: 3; stroke-linejoin: round'),
            g3.element('circle', {r: 2}).class('g3-highlight-fill'),
        );
}


/**
 * Wet (whiskey) magnetic compass: a cylindrical card on a drum seen through a window,
 * read from behind so east appears to the left of north.
 * See nav.compass.wetTilting for a card that also tilts with pitch and roll.
 */
export function wetCompass(): GaugeComponent {
    const win = {x: -78, y: -36, width: 156, height: 72, rx: 8};
    return g3.gauge()
        .defs(cardShading('g3-wet-compass-shade', 85))
        .css('text {fill: #eee}')
        .append(
            g3.element('rect', {x: -100, y: -60, width: 200, height: 120, rx: 12}).class('g3-gauge-face'),
            g3.gauge()
                .clip(g3.element('rect', win))
                .append(
                    g3.element('rect', win).style('fill: #0b0b0b'),
                    g3.gauge()
                        .kind('drum').r(85)
                        .metric('heading').unit('deg')
                        .fake(g3.forceSeries(0, 360, {wrap: true}))
                        // heading h sits at -h around the drum, so the card reads reversed
                        .measure(d3.scaleLinear().domain([0, 360]).range([0, -360]))
                        .autoindicate(true)
                        .append(...compassCard(arc(85))),
                    g3.element('rect', {...win, fill: 'url(#g3-wet-compass-shade)'}),
                ),
            ...compassCase(win),
        );
}


/**
 * Wet compass whose card hangs level on its pivot, so it appears to tilt in the window
 * as the aircraft pitches and rolls, up to the stops at about 18° either way.
 * Its heading is the aircraft's, without the turning and acceleration errors of a real compass,
 * or the swing of the card as it settles.  For those, bind the `heading` metric to an indicated
 * heading from your own compass model, for example a damped spring that lags and overshoots
 * the true heading, plus the northerly turning and acceleration errors.
 */
export function wetCompassTilting(): GaugeComponent {
    const B = 85,
        w = arc(B),
        tilt = d3.scaleLinear().domain([-18, 18]).range([-18, 18]).clamp(true),
        win = {x: -78, y: -36, width: 156, height: 72, rx: 8};
    return g3.gauge()
        .defs(ballShading('g3-wet-compass-tilting-shade', B))
        .css('text {fill: #eee}')
        .append(
            g3.element('rect', {x: -100, y: -60, width: 200, height: 120, rx: 12}).class('g3-gauge-face'),
            g3.gauge()
                .clip(g3.element('rect', win))
                .append(
                    g3.element('rect', win).style('fill: #0b0b0b'),
                    // the card stays level as the case rolls around it
                    g3.gauge()
                        .metric('roll').unit('deg')
                        .fake(g3.forceSeries(-25, 25))
                        .measure(tilt)
                        .autoindicate(true)
                        .append(
                            g3.gauge()
                                .kind('ball.yaw').r(B)
                                .metric('heading').unit('deg')
                                .fake(g3.forceSeries(0, 360, {wrap: true}))
                                .measure(d3.scaleLinear().domain([0, 360]).range([0, -360]))
                                .autoindicate(true)
                                .append(
                                    ...compassCard(w),
                                    // an empty pitch gauge pitches the shared ball, so the card dips as the nose rises
                                    g3.gauge()
                                        .kind('ball.pitch')
                                        .metric('pitch').unit('deg')
                                        .fake(g3.forceSeries(-15, 15))
                                        .measure(tilt)
                                        .autoindicate(true),
                                ),
                        ),
                    g3.element('rect', {...win, fill: 'url(#g3-wet-compass-tilting-shade)'}),
                ),
            ...compassCase(win),
        );
}


// shading across a drum of radius r lit from the viewer, falling off towards its edges like ballShading
function cardShading(id: string, r: number) {
    return g3.element('linearGradient', {id, gradientUnits: 'userSpaceOnUse', x1: -r, y1: 0, x2: r, y2: 0}).append(
        ...[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(f => {
            const s = Math.abs(2 * f - 1);
            return g3.element('stop', {offset: f, 'stop-color': '#000', 'stop-opacity': +(0.85 * (1 - Math.sqrt(1 - s * s))).toFixed(3)});
        })
    );
}

// the compass card markings, with `w` converting degrees of arc to SVG units on the card
const compassCard = (w: (deg: number) => number) => [
    g3.axisSector([0, 360]).inset(-w(14)).size(w(30)).style('fill: #202020'),
    g3.axisTicks().step(5).inset(-w(10)).size(w(4)).style('stroke: #eee'),
    g3.axisTicks().step(10).inset(-w(10)).size(w(7)).style('stroke: #eee'),
    g3.axisLabels().step(30).inset(w(4)).size(16).format(headingFormat),
];

// the window frame and lubber line on the compass case
const compassCase = (win: {x: number, y: number, width: number, height: number, rx: number}) => [
    g3.element('rect', win).style('stroke: #555; stroke-width: 2'),
    g3.element('path', {d: `M 0,${win.y} v ${win.height}`}).class('g3-highlight-stroke').style('stroke-width: 2'),
];


/**
 * Directional gyro / heading indicator with a rotating 360° compass card and fixed aircraft reference symbol.
 */
export function headingGeneric(): GaugeComponent {
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


/**
 * Vertical speed indicator (VSI) measuring rate of climb or descent (±2,000 ft/min) with clamped pointer stops.
 */
export function VSIGeneric(): GaugeComponent {
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
            (_: any, g: any) => {
                _.selectAll(null).data([-400, 400])
                .enter().append('path')
                    .attr('d', "M 2,0 l -7,4 l 0,-8 Z")
                    .attr('transform', (d: any) => g.marktransform(d, 25) + (d < 0 ? ' rotate(-180)':''))
                    .attr('class', 'g3-fg-fill');
            },
            g3.gaugeLabel("UP").x(-57).y(-37).size(8).style('text-anchor: start'),
            g3.gaugeLabel("DOWN").x(-57).y(37).size(8).style('text-anchor: start'),
            g3.indicatePointer().shape('sword').clamp([-1950, 1950]),
        );
}


/**
 * Turn coordinator combining a miniature aircraft turn-rate pointer (deg/s) with an inclinometer slip/skid ball tube.
 */
export function turnCoordinatorGeneric(): GaugeComponent {
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
