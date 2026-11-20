import * as d3 from 'd3';
import * as g3 from '../g3';

import { injectGlobal } from '@emotion/css';
import { headingFormat, deviationScale } from './nav';
import { buttonFactory, selectorFactory, gaugeNode } from './switches';
import type { GaugeComponent, RenderFunction, SelectorOrSelection } from '../types';


/**
 * VHF Omnidirectional Range (VOR) course deviation indicator (CDI) with a rotating omni-bearing
 * selector (OBS) ring, linear radial deviation needle, and TO/FROM/NAV status flags.
 */
export function VORGeneric(): GaugeComponent {
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


/**
 * Automatic Direction Finder (ADF) relative bearing indicator with a rotating compass card.
 */
export function ADFGeneric(): GaugeComponent {
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


injectGlobal`
.kt76c-bezel { fill: #1c1c1c; stroke: #444; stroke-width: 1.5; }
.kt76c-face { fill: #131313; stroke: #2a2a2a; stroke-width: 1; }
.kt76c-silkscreen { fill: #ccc; font-weight: bold; }
.kt76c-window { fill: #22090c; stroke: #333; stroke-width: 1.5; }
.kt76c-window-inner { fill: #2d0b0f; stroke: #160406; stroke-width: 1; }
.kt76c-photocell { fill: #111; stroke: #444; stroke-width: 0.8; }
.g3-panel text.kt76c-segment { fill: #ff2e1f; font-weight: bold; }
.g3-panel text.kt76c-digits { fill: #ff2e1f; font-family: DSEG7-Classic, monospace; }
`;


export interface KT76COptions {
    /** Metric for the 4-digit squawk code, reported and set as a string like `'0400'` (default `'transponderCode'`). */
    code?: string;
    /** Metric for the mode selector position, one of `KT76C_MODES` by index (default `'transponderMode'`). */
    mode?: string;
    /** Metric that is truthy while ident is active, and the event the IDT button triggers (default `'transponderIdent'`). */
    ident?: string;
    /** Pressure altitude metric in feet for the flight level readout (default `'altitude.pressure'`). */
    altitude?: string;
}

/** KT 76C mode selector positions; the mode metric is the index of a position. */
export const KT76C_MODES = ['OFF', 'SBY', 'TST', 'ON', 'ALT'] as const;
type KT76CMode = typeof KT76C_MODES[number];


/**
 * Bendix/King KT 76C TSO panel-mount aviation transponder with a 7-segment gas-discharge display
 * (flight level, mode annunciators and 4-digit squawk code), a 5-position mode selector
 * (`OFF / SBY / TST / ON / ALT`), `IDT` ident button, and `0–7 / CLR / VFR` code entry buttons.
 * A new code is only set once all four digits have been entered.
 * @param opts - Optional metric names for `code`, `mode`, `ident` and `altitude`
 */
export function transponderKT76C(opts: KT76COptions = {}): GaugeComponent {
    const code = opts.code ?? 'transponderCode',
        mode = opts.mode ?? 'transponderMode',
        ident = opts.ident ?? 'transponderIdent',
        altitude = opts.altitude ?? 'altitude.pressure';

    const isMode = (v: any, ...modes: KT76CMode[]) => modes.some(s => Number(v) === KT76C_MODES.indexOf(s));
    const squawk = (v: any) => v === undefined || v === null || v === '' ? '----' : String(v).padStart(4, '0');

    // local UI state for each drawn transponder: the digits typed so far, and what to show without them
    type EntryState = { entry: string; code?: any; mode?: any; text?: d3.Selection<SVGTextElement, unknown, null, undefined> };
    const state = d3.local<EntryState>();

    function redraw(s: EntryState) {
        s.text?.text(isMode(s.mode, 'TST') ? '8888' : s.entry ? s.entry.padEnd(4, '-') : squawk(s.code));
    }

    const init: RenderFunction = (sel: SelectorOrSelection) => {
        state.set(gaugeNode(sel, 'kt76c'), { entry: '' });
    };

    // the code readout combines the reported code and mode with any digits being typed
    const codeReadout: RenderFunction = (sel: SelectorOrSelection, g?: GaugeComponent) => {
        const text = g3.d3sel(sel).append('text').attr('font-size', 12.5).attr('class', 'kt76c-digits'),
            s = state.get(text.node() as Element)!;
        s.text = text as any;
        if (g3.activeController && g) {
            g3.activeController.register((v, _t, metrics) => {
                s.code = v;
                s.mode = metrics?.[mode];
                redraw(s);
            }, g.metrics(), g.unit());
        }
        redraw(s);
    };

    const enter = (update: (entry: string) => string, commit?: string) => (e: Event, g: GaugeComponent) => {
        const s = state.get(e.currentTarget as Element)!;
        s.entry = commit === undefined ? update(s.entry) : '';
        if (s.entry.length == 4) {
            g.send({ op: 'set', metric: code, value: s.entry });
            s.entry = '';
        } else if (commit !== undefined) {
            g.send({ op: 'set', metric: code, value: commit });
        }
        redraw(s);
    };

    const annunciator = (text: string, cls: string, x: number, y: number, lit: (v: any, metrics?: Record<string, any>) => boolean) =>
        g3.indicateStyle().trigger((v, metrics) => lit(v, metrics) ? 1 : 0).append(
            g3.put().class(cls).append(
                g3.gaugeLabel(text, {x, y, size: 3.6}).class('kt76c-segment'),
            )
        );

    const keypadButton = (label: string, x: number, width: number, onPress: (e: Event, g: GaugeComponent) => void) =>
        g3.put().x(x).y(20).scale(0.16).append(
            buttonFactory(undefined, label, { shape: 'rect', width, height: 56, onPress })
        );

    const digitPositions = [-86, -69, -52, -35, -18, 4, 21, 38];

    return g3.gauge()
        .class('kt76c')
        .append(
            init,
            // rack bezel and recessed faceplate
            g3.element('rect', {x: -100, y: -32, width: 200, height: 64, rx: 3}).class('kt76c-bezel'),
            g3.element('rect', {x: -97, y: -29, width: 194, height: 40, rx: 2}).class('kt76c-face'),
            g3.gaugeLabel('BENDIX/KING', {x: -76, y: -23.5, size: 4.1}).class('kt76c-silkscreen'),
            g3.gaugeLabel('XPDR', {x: 52, y: -23.5, size: 4.1}).class('kt76c-silkscreen'),
            g3.gaugeLabel('KT 76C TSO', {x: 80, y: -23.5, size: 3.7}).class('kt76c-silkscreen'),

            g3.put().x(-76).y(-8).scale(0.2).append(
                buttonFactory(undefined, 'IDT', { shape: 'rect', width: 92, height: 52, mode: 'trigger', event: ident })
            ),

            // display window
            g3.element('rect', {x: -55, y: -24, width: 98, height: 29, rx: 1.5}).class('kt76c-window'),
            g3.element('rect', {x: -53, y: -22, width: 94, height: 25, rx: 1}).class('kt76c-window-inner'),

            // flight level, shown in ALT and TST
            g3.gauge().metric(altitude, mode).unit('ft').fake(g3.forceSeries(1000, 18000)).append(
                g3.indicateStyle().trigger((_v, metrics) => isMode(metrics?.[mode], 'ALT', 'TST') ? 1 : 0).append(
                    g3.gaugeLabel('FL', {x: -47, y: -3, size: 4.2}).class('kt76c-segment'),
                    g3.put().x(-30).y(-9).class('kt76c-fl').append(
                        g3.indicateText().size(12.5).class('kt76c-digits')
                            .format((v, metrics) => isMode(metrics?.[mode], 'TST')
                                ? '888'
                                : d3.format('03d')(Math.max(0, Math.round((Number(v) || 0) / 100))))
                    ),
                )
            ),

            // mode annunciators, and R while replying to an ident (or in TST)
            g3.gauge().metric(mode, ident).append(
                annunciator('ALT', 'kt76c-alt', -11, -15.5, v => isMode(v, 'ALT', 'TST')),
                annunciator('ON', 'kt76c-on', -2, -15.5, v => isMode(v, 'ON', 'ALT', 'TST')),
                annunciator('SBY', 'kt76c-sby', -7, -3, v => isMode(v, 'SBY', 'TST')),
                annunciator('R', 'kt76c-reply', 5, -15.5,
                    (v, metrics) => isMode(v, 'TST') || (!!metrics?.[ident] && isMode(v, 'ON', 'ALT'))),
            ),

            // squawk code, shown unless OFF
            g3.gauge().metric(code, mode).fake('1200').append(
                g3.indicateStyle().trigger((_v, metrics) => isMode(metrics?.[mode], 'OFF') ? 0 : 1).append(
                    g3.put().x(22).y(-9).class('kt76c-code').append(codeReadout),
                )
            ),

            g3.put().x(76).y(-4).scale(0.24).append(
                selectorFactory(mode, '', [...KT76C_MODES], { range: [-135, -20] }).fake(KT76C_MODES.indexOf('ALT'))
            ),

            // keypad: octal digits, ambient light sensor, CLR backs up one digit, VFR sets 1200
            ...digitPositions.map((x, digit) =>
                keypadButton(String(digit), x, 82, enter(entry => entry + digit))
            ),
            g3.element('circle', {cx: -7, cy: 20, r: 2.2}).class('kt76c-photocell'),
            keypadButton('CLR', 61, 96, enter(entry => entry.slice(0, -1))),
            keypadButton('VFR', 83, 96, enter(entry => entry, '1200')),
        );
}
