import * as d3 from 'd3';

import { d3sel } from './common';
import { stylable, transformable, appendable, identity, appendId } from './mixin';
import { activeController, convertUnits, knownUnits } from './controller';
import { indicateStyle } from './indicate';
import { grid } from './grid';
import type {
    SelectorOrSelection,
    GaugeComponent,
    GaugeFaceComponent,
    GaugeScrewComponent,
    GaugeLabelOptions,
    GaugeLabelComponent,
    StatusLightComponent
} from './types';


export function gauge(initialMetric?: string): GaugeComponent {

    let metric: string | undefined = initialMetric,
        rescale = identity as (v: any) => any,
        unit: string | undefined,
        instance: string | undefined,
        fake: (() => any) | undefined,
        measure: any = d3.scaleLinear().range([0,360]),
        kind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        showgrid = false,
        clip: ((sel: any, ...args: any[]) => void) | undefined;

    function gaugeFn(sel: SelectorOrSelection, parent?: any) {
        // we namespace the metric using the instance chain at drawing time
        let ns = parent ? parent._ns.slice() : [];
        if (instance) {
            // instances like '...foo' removes two items from parent chain
            if (instance.startsWith('.')) {
                const m = instance.match(/^\.+(.*)/);
                const s = m ? m[1] : '';
                ns = ns.slice(0, -(instance.length - s.length - 1));
                if (s) ns.push(s);
            } else {
                ns.push(instance);
            }
        }
        gaugeFn._ns = ns;

        const m = gaugeFn.metric() as string | undefined;

        const selElement = d3sel(sel);
        const outerG = selElement.append('g');
        (gaugeFn as any).stylable(outerG);
        const _ = outerG.append('g');

        if (typeof clip === 'function') {
            const clipId = appendId('gauge-clip');
            clip(_.append('clipPath').attr('id', clipId));
            _.attr('clip-path', `url(#${clipId})`);
        }
        (gaugeFn as any).appendable(_, gaugeFn);

        if (showgrid) grid().x(-r).y(-r).xmajor(50).ymajor(50).width(2*r).height(2*r)(_);

        if (activeController) {
            if (fake && m) activeController.fake(m, fake);

            if (autoindicate && m) {
                const update = (v: any, transition: any) => {
                    const t = typeof transition === 'function' ? transition(_) : _;
                    t.attr('transform', gaugeFn.metrictransform(rescale(v), true));
                };

                _.classed('will-change-transform', true);
                activeController.register(update, m, unit);
            }
        }
    }
    gaugeFn._ns = [] as string[];

    gaugeFn.metric = function(this: any, _?: string): any {
        // with an argument, sets metric,
        // with no argument, returns qualified metric, e.g. fuel.copilot.rear
        return arguments.length
            ? (metric = _, gaugeFn)
            : (metric && [metric].concat(gaugeFn._ns).join('.'));
    };
    gaugeFn.rescale = function(this: any, _?: (v: any) => any): any {
        return arguments.length ? (rescale = _!, gaugeFn) : rescale;
    };
    gaugeFn.unit = function(this: any, _?: string): any {
        if (_ && !(knownUnits as readonly string[]).includes(_)) {
            console.log(`WARNING: gauge.unit ${_} not a known unit, see https://github.com/convert-units/convert-units`);
        }
        return arguments.length ? (unit = _, gaugeFn) : unit;
    };
    gaugeFn.instance = function(this: any, _?: string): any {
        return arguments.length ? (instance = _, gaugeFn): instance;
    };
    gaugeFn.fake = function(this: any, _?: () => any): any {
        return arguments.length ? (fake = _, gaugeFn): fake;
    };
    gaugeFn.kind = function(this: any, _?: string): any {
        return arguments.length ? (kind = _!, gaugeFn) : kind;
    };
    gaugeFn.clip = function(this: any, _?: (sel: any, ...args: any[]) => void): any {
        return arguments.length ? (clip = _, gaugeFn) : clip;
    };
    gaugeFn.r = function(this: any, _?: number): any {
        return arguments.length ? (r = _!, gaugeFn) : r;
    };
    gaugeFn.measure = function(this: any, _?: any): any {
        return arguments.length ? (measure = _, gaugeFn) : measure;
    };
    gaugeFn.autoindicate = function(this: any, _?: boolean): any {
        return arguments.length ? (autoindicate = _!, gaugeFn) : autoindicate;
    };
    gaugeFn.grid = function(this: any, _?: boolean): any {
        return arguments.length ? (showgrid = !!_, gaugeFn): showgrid;
    };

    gaugeFn.metrictransform = function(v: any, invert?: boolean): string {
        const
            circular = kind == 'circular',
            z = invert ? -measure(v) : measure(v);
        return circular ? `rotate(${z})` : `translate(${z}, 0)`;
    };
    gaugeFn.marktransform = function(v: any, inset?: number): string {
        const
            circular = kind == 'circular',
            insetVal = inset ?? 0,
            z = measure(v),
            y = insetVal + (circular ? -r : 0);
        return circular ? `rotate(${z}) translate(0, ${y})` : `translate(${z}, ${y})`;
    };
    gaugeFn.sectorpath = function(v0: any, v1: any, _size?: number, _inset?: number): string | null {
        const
            size = _size ?? 0,
            inset = _inset ?? 0,
            rVal: number = gaugeFn.r(),
            m = gaugeFn.measure(),
            z0 = m(v0),
            z1 = m(v1),
            path = gaugeFn.kind() == 'circular'
                ? d3.arc()({
                    innerRadius: rVal - inset - size,
                    outerRadius: rVal - inset,
                    startAngle: (convertUnits(z0) as any).from('deg').to('rad'),
                    endAngle: (convertUnits(z1) as any).from('deg').to('rad'),
                })
                : `M ${z0},${inset} l 0,${size} l ${z1-z0},0 l 0,${-size} z`;
        return path;
    };

    return (stylable(appendable(gaugeFn)) as unknown as GaugeComponent).class('g3-gauge');
}


export function gaugeFace(): GaugeFaceComponent {
    let r = 100,
        windowFn: ((sel: any, g?: any) => void) | undefined;
    function face(sel: SelectorOrSelection, g: any) {
        const s = d3sel(sel);
        let maskId: string | undefined;
        if (typeof windowFn === 'function') {
            maskId = appendId('gauge-face-window-');
            const mask = s.append('mask').attr('id', maskId);
            mask.append('circle').attr('r', r).style('fill', 'white');
            const windowGroup = mask.append('g').attr('style', 'fill: black');
            windowFn(windowGroup, g);
        }
        const circle = s.append('circle')
            .attr('r', r);
        (face as any).stylable(circle);
        if (maskId) circle.attr('mask', `url(#${maskId})`);
    }
    (face as any).r = function(_?: number) {
        return arguments.length ? (r = _!, face) : r;
    };
    (face as any).window = function(_?: (sel: any, g?: any) => void) {
        return arguments.length ? (windowFn = _, face): windowFn;
    };
    return (stylable(face) as unknown as GaugeFaceComponent).class('g3-gauge-face');
}


export function gaugeScrew(): GaugeScrewComponent {
    let r = 8,
        shape = 'slotted';  // or phillips, robertson
    function screw(sel: any, /* g */) {
        const rotate = Math.random()*360;
        const _ = sel.append('g').attr('class', 'g3-gauge-screw');
        (screw as any).transformable(_);
        (screw as any).stylable(_);
        _.append('circle').attr('r', r).attr('class', 'g3-gauge-screw-head');
        _.append('circle').attr('r', r) .attr('class', 'g3-highlight');
        switch (shape) {
            case 'robertson':
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate})`)
                    .attr('x', -0.4).attr('width', 0.8)
                    .attr('y', -0.4).attr('height', 0.8);
                break;
            case 'phillips':
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate+90})`)
                    .attr('x', -1).attr('width', 2)
                    .attr('y', -0.2).attr('height', 0.4);
                // eslint-disable-next-line no-fallthrough
            default:  // slotted
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate})`)
                    .attr('x', -1).attr('width', 2)
                    .attr('y', -0.2).attr('height', 0.4);
        }
    }
    (screw as any).r = function(_?: number) {
        return arguments.length ? (r = _!, screw): r;
    };
    (screw as any).shape = function(_?: string) {
        return arguments.length ? (shape = _!, screw): shape;
    };
    return stylable(transformable(screw)) as unknown as GaugeScrewComponent;
}


export function gaugeLabel(s_?: string, opts?: GaugeLabelOptions): GaugeLabelComponent {
    let s = s_ || '',
        x = 0, y = 0, dx: number | string = 0, dy: number | string = 0, size = 10;
    function label(sel: SelectorOrSelection, /* g */) {
        const _ = d3sel(sel).append('text')
            .attr('x', x).attr('y', y)
            .attr('dx', dx).attr('dy', dy)
            .attr('font-size', size)
            .text(s);
        (label as any).stylable(_);
    }
    (label as any).value = function(_?: string) {
        return arguments.length ? (s = _!, label): s;
    };
    (label as any).size = function(_?: number) {
        return arguments.length ? (size = _!, label): size;
    };
    (label as any).x = function(_?: number) {
        return arguments.length ? (x = _!, label): x;
    };
    (label as any).y = function(_?: number) {
        return arguments.length ? (y = _!, label): y;
    };
    (label as any).dx = function(_?: number | string) {
        return arguments.length ? (dx = _!, label): dx;
    };
    (label as any).dy = function(_?: number | string) {
        return arguments.length ? (dy = _!, label): dy;
    };
    stylable(label).class('g3-gauge-label');
    if (typeof opts === 'object') {
        Object.entries(opts).forEach(([k,v]) => {
            if (typeof (label as any)[k] !== 'function') throw `label: unknown attribute ${k}`;
            (label as any)[k](v);
        });
    }
    return label as unknown as GaugeLabelComponent;
}


// shorthand to add a status light of given color
export function statusLight(): StatusLightComponent {
    const g = gauge();
    let trigger = identity as (v: any) => any,
        color = 'red';
    function statusLightFn(sel: SelectorOrSelection, parent?: any) {
        const _ = gauge()
            .metric(g.metric()!)
            .instance(g.instance()!)
            .fake(g.fake()!)
            .append(
                indicateStyle().trigger(trigger).append(
                    gaugeFace().style(`fill: ${color}`),
                    gaugeFace().class('g3-highlight'),
                )
            );
        _(sel, parent);
    }
    (statusLightFn as any).metric = function(_?: string) {
        const v = (g.metric as any)(_);
        return arguments.length ? statusLightFn: v;
    };
    (statusLightFn as any).instance = function(_?: string) {
        const v = (g.instance as any)(_);
        return arguments.length ? statusLightFn: v;
    };
    (statusLightFn as any).fake = function(_?: () => any) {
        const v = (g.fake as any)(_);
        return arguments.length ? statusLightFn: v;
    };
    (statusLightFn as any).trigger = function(_?: (v: any) => any) {
        return arguments.length ? (trigger = _!, statusLightFn): trigger;
    };
    (statusLightFn as any).color = function(_?: string) {
        return arguments.length ? (color = _!, statusLightFn): color;
    };
    return statusLightFn as unknown as StatusLightComponent;
}
