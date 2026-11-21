import * as d3 from 'd3';
import * as g3 from '../g3';
import type { GaugeComponent } from '../types';


/**
 * Dual-scale automotive speedometer (mph outer scale, km/h inner scale) with a lower
 * remaining-range sector bar and destination distance marker.
 */
export function speedometerBMW(): GaugeComponent {
    return g3.gauge()
        .metric('speed').unit('mph').fake(g3.forceSeries(9, 160))
        .measure(d3.scaleLinear().domain([0,160]).range([-120,120]))
        .append(
            g3.gaugeFace(),
            g3.axisSector([-3,163]).size(1).inset(-1).class('g3-axis-line'),
            g3.axisSector([-3,163]).inset(2).size(5).style('fill: #333'),
            g3.axisTicks().step(10).inset(2).size(5),
            g3.axisLabels().step(20).size(14).inset(20).format(v => v.toString().padEnd(3, '\u00A0')),
            g3.axisLabels({'-3': 'mph'}).inset(24).size(6),
            g3.gauge().metric('speed').unit('km/h')
                .measure(d3.scaleLinear().domain([0,1.60934*160]).range([-120,120]))
                .r(66)
                .append(
                    g3.axisTicks(d3.range(0,261,10)).step(10).size(3),
                    g3.axisLabels(d3.range(0,261,20)).size(8).inset(12).format(v => v.toString().padEnd(3, '\u00A0')),
                    g3.axisLabels({'-5': '\u00A0km/h'}).inset(16).size(5),
                ),
            g3.indicatePointer(),
            g3.gauge().metric('range').unit('mi').fake(g3.forceSeries(0, 500))
                .measure(d3.scaleLinear().domain([-100,600]).range([240,120]))
                .r(90)
                .append(
                    g3.axisSector([-50,550]).size(1).inset(-3).class('g3-axis-line'),
                    g3.axisTicks(d3.range(0,500,10)).style('stroke: #800').size(5),
                    g3.axisLabels(d3.range(0,500,200)).size(10).inset(15),
                    g3.indicateSector().size(5).style('fill: red'),
                    g3.axisTicks(d3.range(0,501,100)).size(8).style('stroke-width: 2'),
                    g3.axisLabels({500: 'miles'}).orient('counterclockwise').size(6).inset(-7),
                ),
            g3.gauge().metric('destination').unit('mi').fake(g3.forceSeries(0, 500))
                .measure(d3.scaleLinear().domain([-100,600]).range([240,120]))
                .append(
                    g3.indicatePointer().append(g3.element('circle', {cy: -85, r: 4})).style('fill: white; stroke: black; filter: none;')
                ),
        );
}


/**
 * The position of each drum on a classic odometer: the tenths drum turns continuously,
 * while each higher drum waits on its digit, and only rolls on to the next
 * as the drum to its right passes from 9 to 0.
 * Returns positions from 0 up to 10 for `n` drums, tenths first.
 */
export function odometerDrums(v: number, n: number): number[] {
    const ps: number[] = [];
    let carry = 0;
    for (let k = 0; k < n; k++) {
        const x = Math.max(0, v) * 10 / 10 ** k,
            p = k == 0 ? x % 10 : Math.floor(x) % 10 + carry;
        ps.push(p);
        carry = Math.max(0, p - 9);
    }
    return ps;
}


/**
 * Classic mechanical odometer: a row of numbered drums behind a slot, with a contrasting tenths drum on the right.
 * Each drum is a horizontal drum gauge, and the drums carry as they roll over, so 89999.9 rolls smoothly to 90000.0.
 */
export function odometerClassic(): GaugeComponent {
    const n = 7,            // six whole digits and tenths
        w = 22,             // width of each drum
        gap = 2,
        R = 26,             // drum radius: digits sit 36° apart, about 16 units
        win = {x: -n * (w + gap) / 2 - 2, y: -15, width: n * (w + gap) + 4, height: 30, rx: 3};
    const drum = (k: number) => g3.put()
        .x(win.x + 2 + gap / 2 + (n - 1 - k) * (w + gap) + w / 2)
        // a drum spins about its vertical axis, so lay it on its side to roll digits up the slot
        .rotate(90)
        .append(
            g3.gauge()
                .kind('drum').r(R)
                .metric('odometer').unit('mi')
                .rescale((v: number) => odometerDrums(v, n)[k])
                .measure(d3.scaleLinear().domain([0, 10]).range([0, 360]))
                .autoindicate(true)
                .append(
                    g3.axisSector([0, 10]).inset(-w / 2).size(w)
                        .class(k == 0 ? 'g3-odometer-tenths' : 'g3-odometer-drum'),
                    g3.axisLabels(d3.range(10)).inset(0).rotate(-90).size(17).format(String),
                ),
        );
    return g3.gauge()
        .defs(
            // drums darken towards the top and bottom of the slot as they curve away
            g3.element('linearGradient', {id: 'g3-odometer-shade', gradientUnits: 'userSpaceOnUse', x1: 0, y1: -R, x2: 0, y2: R}).append(
                ...[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(f => {
                    const s = Math.abs(2 * f - 1);
                    return g3.element('stop', {offset: f, 'stop-color': '#000', 'stop-opacity': +(0.9 * (1 - Math.sqrt(1 - s * s))).toFixed(3)});
                })
            ),
        )
        .css(`
            .g3-odometer-drum {fill: #151515}
            .g3-odometer-drum ~ .g3-axis-labels text {fill: #f2ead8; font-family: Helvetica, Arial, sans-serif}
            .g3-odometer-tenths {fill: #e9dcc0}
            .g3-odometer-tenths ~ .g3-axis-labels text {fill: #111; font-family: Helvetica, Arial, sans-serif}
        `)
        .append(
            g3.element('rect', {x: -110, y: -32, width: 220, height: 64, rx: 10}).class('g3-gauge-face'),
            g3.gauge()
                .clip(g3.element('rect', win))
                .append(
                    g3.element('rect', win).style('fill: #050505'),
                    // only one drum needs to fake the shared metric, starting just before a rollover
                    g3.gauge().metric('odometer').unit('mi')
                        .fake((v?: number) => v === undefined ? 89999.7 : v + 0.02),
                    ...d3.range(n).map(drum),
                    g3.element('rect', {...win, fill: 'url(#g3-odometer-shade)'}),
                ),
            g3.element('rect', win).style('fill: none; stroke: #444; stroke-width: 1.5'),
        );
}
