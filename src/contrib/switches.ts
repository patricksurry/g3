import * as d3 from 'd3';
import { injectGlobal } from '@emotion/css';
import * as g3 from '../g3';
import type { GaugeComponent, RenderFunction, SelectorOrSelection } from '../types';

/*
Interactive controls follow the hub model (see doc/API.md#where-state-lives):
they only send actions via gauge.send(), and their display follows what the hub reports.
The only state a control keeps is local UI state, like whether a button is being pressed.
*/

injectGlobal`
.g3-switch-control { cursor: pointer; }
.g3-switch-bezel { fill: #555; }
.g3-switch-recess { fill: #141414; }
.g3-switch-cap { fill: #282828; }
.g3-switch-cap-shine { fill: #3a3a3a; }
.g3-switch-cap-down { fill: #181818; }
.g3-switch-cap-down-face { fill: #222; }
.g3-switch-button text { fill: #e0e0e0; font-weight: bold; }
.g3-switch-button .g3-switch-pressed text { fill: #aaa; }
.g3-switch-collar { fill: #999; }
.g3-switch-collar-recess { fill: #333; }
.g3-switch-knurl { fill: #4a4a4a; }
.g3-switch-knob { fill: #1b1b1b; }
.g3-switch-knob-ridge { fill: #2c2c2c; }
`;


// the latest reported value of each control's primary metric, stored on the gauge's DOM node
const reported = d3.local<any>();

/**
 * The DOM element of the gauge being drawn into sel.
 * Child renderers may be called with a d3 enter placeholder rather than a real node,
 * so we find the enclosing gauge element via a temporary marker.
 */
export function gaugeNode(sel: SelectorOrSelection, cls = 'g3-gauge'): Element {
    const marker = g3.d3sel(sel).append('g').node() as Element,
        node = marker.closest('.' + cls) ?? marker.parentElement!;
    marker.remove();
    return node;
}

/** Render function that records the reported value of its gauge's metric, optionally calling back. */
function trackReported(onUpdate?: (node: Element, v: any) => void): RenderFunction {
    return function(sel: SelectorOrSelection, g?: GaugeComponent) {
        const node = gaugeNode(sel);
        if (g3.activeController && g) {
            g3.activeController.register(v => {
                reported.set(node, v);
                if (onUpdate) onUpdate(node, v);
            }, g.metrics(), g.unit());
        }
    };
}


function knurlPath(rOuter: number, rInner: number, teeth = 18): string {
    const pts: string[] = [];
    const total = teeth * 2;
    for (let i = 0; i < total; i++) {
        const a = (i * Math.PI * 2) / total;
        const r = i % 2 === 0 ? rOuter : rInner;
        pts.push(`${i === 0 ? 'M' : 'L'} ${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`);
    }
    return pts.join(' ') + ' Z';
}


/**
 * Two-position linear on/off toggle switch; clicking sets the metric to the opposite of its reported value.
 * @param metric - Metric name to indicate and set (default 'status')
 * @param label - Text label displayed above the switch (defaults to `metric`)
 */
export function toggleFactory(metric?: string, label?: string): GaugeComponent {
    const m = metric || 'status';
    const l = label ?? m;
    return g3.gauge()
        .metric(m)
        .fake(0)
        .measure(d3.scaleLinear().domain([0, 1]).range([-40, 40]))
        .kind('linear')
        .append(
            trackReported(),
            g3.put().rotate(-90).class('g3-switch-control')
                .on('click', (e: Event, g: GaugeComponent) =>
                    g.send({ op: 'set', value: reported.get(e.currentTarget as Element) ? 0 : 1 }))
                .append(
                    g3.element('path', {d: 'M 40,40 a 40,40 0 0 0 0,-80 l -80,0 a 40,40 0 0 0 0,80 z'})
                        .class('g3-fg-stroke g3-bg-fill').style('stroke-width: 7'),
                    g3.axisLabels({0: 'off', 1: 'on'}).inset(60).rotate(90),
                    g3.gaugeLabel(l, {size: 20, y: -60}),
                    g3.indicatePointer().append(
                        g3.element('circle', {r: 30}).class('g3-fg-fill')
                    ),
                )
        );
}


export interface ButtonOptions {
    /** Cap shape (default `'round'`). */
    shape?: 'round' | 'rect';
    /** Cap width and height for `'rect'` buttons (default 84 x 54). */
    width?: number;
    height?: number;
    /**
     * What a press sends (default `'momentary'`):
     * `'momentary'` sets the metric to 1 while pressed and 0 on release,
     * `'latch'` sets it to the opposite of its reported value on each click,
     * and `'trigger'` sends a single `trigger` action for `event` on each press.
     */
    mode?: 'momentary' | 'latch' | 'trigger';
    /** Event name for `'trigger'` mode (defaults to `metric`). */
    event?: string;
    /** Called on each press instead of sending any action, e.g. to update local UI state. */
    onPress?: (e: Event, g: GaugeComponent) => void;
}


/**
 * Push-button (round or rectangular) that looks pressed while held, or while a latched metric is 1.
 * @param metric - Metric name to set (default 'button'; may be omitted for `trigger` or `onPress` buttons)
 * @param label - Text label displayed above a round button or on the cap of a rectangular button (defaults to `metric`)
 * @param opts - Optional `shape`, `width`, `height`, `mode`, `event` and `onPress`
 */
export function buttonFactory(metric?: string, label?: string, opts: ButtonOptions = {}): GaugeComponent {
    const m = metric ?? (opts.onPress || opts.mode === 'trigger' ? undefined : 'button');
    const l = label ?? m ?? '';
    const mode = opts.mode ?? 'momentary';
    const held = d3.local<boolean>();

    const showPressed = (node: Element, on: boolean) =>
        d3.select(node).select('.g3-switch-pressed').style('opacity', on ? 1 : 0);

    function press(e: Event, g: GaugeComponent) {
        if (opts.onPress) {
            opts.onPress(e, g);
        } else if (mode === 'trigger') {
            const event = opts.event ?? g.metric();
            if (event) g.send({ op: 'trigger', event });
        } else if (mode === 'latch') {
            g.send({ op: 'set', value: reported.get(e.currentTarget as Element) ? 0 : 1 });
        } else {
            g.send({ op: 'set', value: 1 });
        }
    }

    function down(e: Event, g: GaugeComponent) {
        const node = e.currentTarget as Element;
        if (held.get(node)) return;
        held.set(node, true);
        showPressed(node, true);
        press(e, g);
    }

    function release(e: Event, g: GaugeComponent) {
        const node = e.currentTarget as Element;
        if (!held.get(node)) return;
        held.set(node, false);
        showPressed(node, false);
        if (mode === 'momentary' && !opts.onPress) g.send({ op: 'set', value: 0 });
    }

    const control = g3.put().class('g3-switch-control');
    if (mode === 'latch' && !opts.onPress) {
        control.on('click', press);
    } else {
        control.on('pointerdown', down)
            .on('pointerup', release)
            .on('pointerleave', release)
            .on('pointercancel', release);
    }

    const g = g3.gauge().class('g3-switch-button');
    if (m) g.metric(m);
    if (m && mode !== 'trigger') g.fake(0);
    // a latched button looks pressed while its reported value is set
    g.append(trackReported(mode === 'latch' ? (node, v) => showPressed(node, !!v) : undefined));

    if (opts.shape === 'rect') {
        const w = opts.width ?? 84,
            h = opts.height ?? 54,
            rx = Math.round(Math.min(w, h) * 0.18),
            fontSize = Math.round(h * 0.48);
        const cap = (inset: number, height: number, r: number, cls: string, dy = 0) =>
            g3.element('rect', {x: -w / 2 + inset, y: -h / 2 + inset + dy, width: w - 2 * inset, height, rx: r}).class(cls);

        return g.append(
            control.append(
                cap(0, h, rx, 'g3-switch-bezel'),
                cap(3, h - 6, rx * 0.8, 'g3-switch-recess'),
                cap(5, h - 10, rx * 0.65, 'g3-switch-cap'),
                g3.element('rect', {x: -w / 2 + 8, y: -h / 2 + 7, width: w - 16, height: (h - 14) * 0.34, rx: rx * 0.45})
                    .class('g3-switch-cap-shine'),
                g3.gaugeLabel(l, {size: fontSize}),
                g3.put().class('g3-switch-pressed').style('opacity: 0').append(
                    cap(5, h - 10, rx * 0.65, 'g3-switch-cap-down'),
                    cap(6, h - 13, rx * 0.55, 'g3-switch-cap-down-face', 1),
                    g3.gaugeLabel(l, {y: 2, size: fontSize}),
                ),
            )
        );
    }

    return g.append(
        g3.gaugeLabel(l, {size: 20, y: -60}),
        control.append(
            g3.element('circle', {r: 45}).class('g3-fg-fill'),
            g3.element('circle', {r: 38}).class('g3-bg-fill'),
            g3.element('circle', {r: 33}).class('g3-switch-recess'),
            g3.element('circle', {r: 28}).class('g3-fg-fill').style('filter: url(#dropShadow2)'),
            g3.put().class('g3-switch-pressed').style('opacity: 0').append(
                g3.element('circle', {r: 29}).class('g3-switch-cap-down'),
                g3.element('circle', {r: 26}).class('g3-switch-bezel'),
            ),
            g3.element('circle', {r: 28}).class('g3-highlight'),
        )
    );
}


export interface RotaryOptions {
    /** Change per click or wheel notch (default 1). */
    step?: number;
    /** Limits passed to the hub as `adjust` hints, e.g. `{min: 0, max: 360, wrap: true}` for a heading bug. */
    min?: number;
    max?: number;
    wrap?: boolean;
    /** Number of steps per full turn of the knob (default 12). */
    detents?: number;
}


/**
 * Rotary encoder knob that sends `adjust` actions (click left/right half, or scroll wheel)
 * and turns to show the reported value of the metric it adjusts.
 * @param metric - Metric name to adjust and indicate (default 'rotary')
 * @param label - Text label displayed above the knob (defaults to `metric`)
 * @param opts - Optional `step`, `min`, `max`, `wrap` and `detents`
 */
export function rotaryFactory(metric?: string, label?: string, opts: RotaryOptions = {}): GaugeComponent {
    const m = metric || 'rotary';
    const l = label ?? m;
    const step = opts.step ?? 1,
        detents = opts.detents ?? 12,
        hints = Object.fromEntries(
            (['min', 'max', 'wrap'] as const).filter(k => opts[k] !== undefined).map(k => [k, opts[k]])
        );
    const turn = (g: GaugeComponent, dir: number) => g.send({ op: 'adjust', by: dir * step, ...hints });

    return g3.gauge()
        .metric(m)
        .fake(opts.min ?? 0)
        .measure(d3.scaleLinear().domain([0, step * detents]).range([0, 360]))
        .append(
            g3.gaugeLabel(l, {size: 20, y: -65}),
            g3.axisSector([-4.2 * step, -1.8 * step]).inset(48).size(0).class('g3-fg-stroke').style('stroke-width: 2'),
            g3.axisSector([1.8 * step, 4.2 * step]).inset(48).size(0).class('g3-fg-stroke').style('stroke-width: 2'),
            g3.gaugeLabel('-', {x: -55, y: 0, size: 24}),
            g3.gaugeLabel('+', {x: 55, y: 0, size: 20}),
            g3.put().class('g3-switch-control')
                .on('click', (e: MouseEvent, g: GaugeComponent) => turn(g, d3.pointer(e)[0] < 0 ? -1 : 1))
                .on('wheel', (e: WheelEvent, g: GaugeComponent) => {
                    e.preventDefault();
                    turn(g, e.deltaY < 0 ? 1 : -1);
                }, { passive: false })
                .append(
                    g3.element('circle', {r: 44}).class('g3-fg-fill'),
                    g3.element('circle', {r: 39}).class('g3-bg-fill'),
                    g3.indicatePointer().append(
                        g3.element('path', {d: knurlPath(35, 31.5, 20)}).class('g3-switch-collar'),
                        g3.element('circle', {r: 29.5}).class('g3-switch-cap-down-face'),
                        g3.element('circle', {r: 28}).class('g3-switch-collar-recess'),
                        g3.element('circle', {cy: -17, r: 5}).class('g3-switch-cap-down'),
                        g3.element('circle', {r: 28}).class('g3-highlight'),
                    ),
                )
        );
}


export interface SelectorOptions {
    /** Angles of the first and last positions (default `[-60, 60]`). */
    range?: [number, number];
    /** Whether stepping past the last position wraps to the first, and vice versa (default `false`). */
    wrap?: boolean;
}


/**
 * Multi-position detented rotary selector switch, e.g. a magneto or mode selector.
 * Positions are evenly spaced; clicking (left/right half) or scrolling sets the next position, stopping at the ends.
 * @param metric - Metric name to indicate and set (default 'selector')
 * @param label - Text label displayed below the switch (defaults to `metric`)
 * @param positions - Position labels, whose values are their indices, or a map of value to label (default `['OFF', 'ON']`)
 * @param opts - Optional angular `range` and `wrap`
 */
export function selectorFactory(
    metric?: string,
    label?: string,
    positions?: string[] | Record<number, string>,
    opts: SelectorOptions = {}
): GaugeComponent {
    const m = metric || 'selector';
    const l = label ?? m;
    const pos = positions || ['OFF', 'ON'];
    const labelMap: Record<number, string> = Array.isArray(pos)
        ? Object.fromEntries(pos.map((s, i) => [i, s]))
        : pos;
    const values = Object.keys(labelMap).map(Number).sort((a, b) => a - b),
        n = values.length,
        index = (v: any) => values.indexOf(Number(v));

    function stepPosition(e: Event, g: GaugeComponent, dir: number) {
        const i = index(reported.get(e.currentTarget as Element));
        let j = i < 0 ? 0 : i + dir;
        if (j < 0 || j >= n) {
            if (!opts.wrap) return;
            j = (j + n) % n;
        }
        g.send({ op: 'set', value: values[j] });
    }

    // the gauge works in position (index) space, so positions are evenly spaced whatever their values
    return g3.gauge()
        .metric(m)
        .fake(values[0])
        .measure(d3.scaleLinear().domain([0, Math.max(1, n - 1)]).range(opts.range || [-60, 60]))
        .append(
            trackReported(),
            g3.axisTicks(d3.range(n)).inset(54).size(6).style('stroke-width: 1.5'),
            g3.axisLabels(Object.fromEntries(values.map((v, i) => [i, labelMap[v]]))).inset(34).size(14),
            g3.gaugeLabel(l, {size: 20, y: 68}),
            g3.put().class('g3-switch-control')
                .on('click', (e: MouseEvent, g: GaugeComponent) => stepPosition(e, g, d3.pointer(e)[0] < 0 ? -1 : 1))
                .on('wheel', (e: WheelEvent, g: GaugeComponent) => {
                    e.preventDefault();
                    stepPosition(e, g, e.deltaY < 0 ? 1 : -1);
                }, { passive: false })
                .append(
                    g3.element('circle', {r: 36}).class('g3-switch-collar'),
                    g3.element('circle', {r: 32}).class('g3-switch-collar-recess'),
                    g3.element('circle', {r: 29}).class('g3-bg-fill'),
                    g3.indicatePointer().rescale((v: any) => Math.max(0, index(v))).append(
                        g3.element('path', {d: knurlPath(27, 24.5, 18)}).class('g3-switch-knurl'),
                        g3.element('circle', {r: 23}).class('g3-switch-knob'),
                        g3.element('path', {d: 'M -5.5,15 L -3.5,-30 L 3.5,-30 L 5.5,15 Z'}).class('g3-switch-knob-ridge'),
                        g3.element('rect', {x: -1.6, y: -30, width: 3.2, height: 16, rx: 0.8}).class('g3-fg-fill'),
                        g3.element('circle', {r: 23}).class('g3-highlight'),
                    ),
                )
        );
}
