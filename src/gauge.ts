import * as d3 from 'd3';

import { d3sel } from './common';
import { stylable, transformable, appendable, identity, appendId } from './mixin';
import { activeController, convertUnits, knownUnits } from './controller';
import { indicateStyle } from './indicate';
import { grid } from './grid';
import type {
    SelectorOrSelection,
    RenderFunction,
    TransitionFunction,
    GaugeKind,
    ScrewShape,
    GaugeComponent,
    GaugeFaceComponent,
    GaugeScrewComponent,
    GaugeLabelOptions,
    GaugeLabelComponent,
    StatusLightComponent,
    GaugeController,
    Fake,
    Action,
    SphereBall,
    Drum
} from './types';
import { isFullCircle, isBall } from './scale';
import { sphereBall, sphereTransform, sphereRegion, arcDegrees } from './sphere';
import { drumSurface, drumTransform, drumPath } from './drum';


export function gauge(initialMetric?: string): GaugeComponent {

    let metric: string | undefined = initialMetric,
        others: string[] = [],
        ctrl: GaugeController | undefined,  // the controller active when this gauge was drawn
        rescale = identity as (v: any, metrics?: Record<string, any>, unit?: string) => any,
        unit: string | undefined,
        instance: string | undefined,
        fake: Fake | undefined,
        measure: any = d3.scaleLinear().range([0, 360]),
        kind: GaugeKind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        showgrid = false,
        clip: RenderFunction | undefined;

    const gaugeFn: GaugeComponent = stylable<GaugeComponent>(appendable(Object.assign(
        function(sel: SelectorOrSelection, parent?: GaugeComponent) {
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

            // ball gauges nested inside another share its ball, so all their rotations compose
            gaugeFn._surface = isBall(kind)
                ? (parent && isBall(parent.kind()) && parent._surface ? parent._surface : sphereBall(r))
                : kind == 'drum' ? drumSurface(r) : undefined;

            const m = gaugeFn.metric();

            const selElement = d3sel(sel);
            const outerG = selElement.append('g');
            gaugeFn.stylable(outerG);
            const _ = outerG.append('g');

            if (typeof clip === 'function') {
                const clipId = appendId('gauge-clip');
                clip(_.append('clipPath').attr('id', clipId));
                _.attr('clip-path', `url(#${clipId})`);
            }
            gaugeFn.appendable(_, gaugeFn);

            if (showgrid) grid().x(-r).y(-r).xmajor(50).ymajor(50).width(2 * r).height(2 * r)(_);

            ctrl = activeController;
            if (activeController) {
                if (fake !== undefined && m) activeController.fake(m, fake, unit);

                if (autoindicate && m && gaugeFn._surface) {
                    // turn the ball or drum so the current value faces the viewer, then re-project its marks
                    const surface = gaugeFn._surface,
                        axis = kind == 'ball.pitch' ? 1 : 0,
                        cyclic = kind != 'ball.pitch';
                    let drawn = false;
                    const update = (v: any, transition?: TransitionFunction, metrics?: Record<string, any>, u?: string) => {
                        const target = -measure(rescale(v, metrics, u)),
                            t = drawn && typeof transition === 'function' ? transition(_) : undefined;
                        drawn = true;
                        if (!t || !('tween' in t)) {
                            surface.rotation[axis] = target;
                            surface.redraw();
                            return;
                        }
                        const from = surface.rotation[axis] ?? 0;
                        let delta = target - from;
                        if (cyclic) delta = ((delta % 360) + 540) % 360 - 180;    // the short way round
                        t.tween(`g3-surface-${axis}`, () => (k: number) => {
                            surface.rotation[axis] = from + delta * k;
                            surface.redraw();
                        });
                    };
                    activeController.register(update, gaugeFn.metrics(), unit);
                } else if (autoindicate && m) {
                    const isCyclic = isFullCircle(kind, measure.range());
                    const update = (v: any, transition?: TransitionFunction, metrics?: Record<string, any>, u?: string) => {
                        const xform = gaugeFn.metrictransform(rescale(v, metrics, u), true);
                        const t = typeof transition === 'function' ? transition(_) : _;
                        if (!_.attr('transform')) _.attr('transform', xform);
                        if (!isCyclic && 'attrTween' in t) {
                            t.attrTween('transform', function(this: Element) {
                                const prev = this.getAttribute('transform');
                                return d3.interpolateString(prev || xform, xform);
                            });
                        } else {
                            t.attr('transform', xform);
                        }
                    };

                    _.classed('will-change-transform', true);
                    activeController.register(update, gaugeFn.metrics(), unit);
                }
            }
        },
        {
            _ns: [] as string[],
            metric(_?: string, ...rest: string[]): any {
                // with an argument, sets the primary metric and any secondary metrics,
                // with no argument, returns qualified primary metric, e.g. fuel.copilot.rear
                return arguments.length
                    ? (metric = _, others = rest, gaugeFn)
                    : (metric && [metric].concat(gaugeFn._ns).join('.'));
            },
            metrics(): string[] {
                return (metric ? [metric, ...others] : [])
                    .map(k => [k].concat(gaugeFn._ns).join('.'));
            },
            send(...actions: Action[]) {
                const primary = gaugeFn.metric(),
                    filled = actions.map(a =>
                        a.op === 'trigger' || a.metric !== undefined ? a
                            : { ...a, metric: primary, ...(unit && !a.unit ? { unit } : {}) }
                    );
                if (ctrl) {
                    ctrl.send(...filled);
                } else {
                    console.log('g3: actions dropped, gauge has not been drawn:', filled);
                }
            },
            rescale(_?: (v: any) => any): any {
                return arguments.length ? (rescale = _!, gaugeFn) : rescale;
            },
            unit(_?: string): any {
                if (_ && !(knownUnits as readonly string[]).includes(_)) {
                    console.log(`WARNING: gauge.unit ${_} not a known unit, see https://github.com/convert-units/convert-units`);
                }
                return arguments.length ? (unit = _, gaugeFn) : unit;
            },
            instance(_?: string | null): any {
                return arguments.length ? (instance = _ ?? undefined, gaugeFn) : instance;
            },
            fake(_?: Fake): any {
                return arguments.length ? (fake = _, gaugeFn) : fake;
            },
            redraw(fn: () => void): void {
                if (gaugeFn._surface) gaugeFn._surface.redraws.push(fn);
                fn();
            },
            kind(_?: GaugeKind): any {
                return arguments.length ? (kind = _!, gaugeFn) : kind;
            },
            clip(_?: RenderFunction): any {
                return arguments.length ? (clip = _, gaugeFn) : clip;
            },
            r(_?: number): any {
                return arguments.length ? (r = _!, gaugeFn) : r;
            },
            measure(_?: any): any {
                return arguments.length ? (measure = _, gaugeFn) : measure;
            },
            autoindicate(_?: boolean): any {
                return arguments.length ? (autoindicate = _!, gaugeFn) : autoindicate;
            },
            grid(_?: boolean): any {
                return arguments.length ? (showgrid = !!_, gaugeFn) : showgrid;
            },
            metrictransform(v: any, invert?: boolean): string {
                if (gaugeFn._surface) return '';  // ball and drum gauges indicate by turning their surface
                const
                    circular = kind == 'circular',
                    z = invert ? -measure(v) : measure(v);
                return circular ? `rotate(${z})` : `translate(${z}, 0)`;
            },
            marktransform(v: any, inset?: number): string {
                const surface = gaugeFn._surface;
                if (kind == 'drum') return drumTransform(surface as Drum, measure(v), inset ?? 0);
                if (surface) {
                    const ball = surface as SphereBall,
                        z = measure(v), off = arcDegrees(ball, inset ?? 0);
                    return kind == 'ball.yaw'
                        ? sphereTransform(ball, z, -off)
                        : sphereTransform(ball, off, z, true);
                }
                const
                    circular = kind == 'circular',
                    insetVal = inset ?? 0,
                    z = measure(v),
                    y = insetVal + (circular ? -r : 0);
                return circular ? `rotate(${z}) translate(0, ${y})` : `translate(${z}, ${y})`;
            },
            sectorpath(v0: any, v1: any, _size?: number, _inset?: number): string | null {
                const surface = gaugeFn._surface;
                if (kind == 'drum') {
                    const y0 = _inset ?? 0;
                    return drumPath(surface as Drum, measure(v0), measure(v1), y0, y0 + (_size ?? 0));
                }
                if (surface) {
                    const ball = surface as SphereBall,
                        z0 = measure(v0), z1 = measure(v1),
                        a = arcDegrees(ball, _inset ?? 0), b = arcDegrees(ball, (_inset ?? 0) + (_size ?? 0)),
                        region = kind == 'ball.yaw'
                            ? sphereRegion(z0, z1, -b, -a)    // inset runs south from the equator
                            : sphereRegion(a, b, z0, z1);     // inset runs east from the meridian
                    return d3.geoPath(ball.proj)(region);
                }
                const
                    size = _size ?? 0,
                    inset = _inset ?? 0,
                    rVal = gaugeFn.r(),
                    m = gaugeFn.measure(),
                    z0 = m(v0),
                    z1 = m(v1),
                    path = gaugeFn.kind() == 'circular'
                        ? d3.arc()({
                            innerRadius: rVal - inset - size,
                            outerRadius: rVal - inset,
                            startAngle: convertUnits(z0).from('deg').to('rad'),
                            endAngle: convertUnits(z1).from('deg').to('rad'),
                        })
                        : `M ${z0},${inset} l 0,${size} l ${z1 - z0},0 l 0,${-size} z`;
                return path;
            },
        }
    ))).class('g3-gauge');

    return gaugeFn;
}


export function gaugeFace(): GaugeFaceComponent {
    let r = 100,
        windowFn: RenderFunction | undefined;

    const face: GaugeFaceComponent = stylable<GaugeFaceComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const s = d3sel(sel);
            let maskId: string | undefined;
            if (typeof windowFn === 'function') {
                maskId = appendId('gauge-face-window-');
                const mask = s.append('mask').attr('id', maskId);
                mask.append('circle').attr('r', r).style('fill', 'white');
                const windowGroup = mask.append('g').attr('style', 'fill: black');
                windowFn(windowGroup, g);
            }
            const circle = s.append('circle').attr('r', r);
            face.stylable(circle);
            if (maskId) circle.attr('mask', `url(#${maskId})`);
        },
        {
            r(_?: number): any {
                return arguments.length ? (r = _!, face) : r;
            },
            window(_?: RenderFunction): any {
                return arguments.length ? (windowFn = _, face) : windowFn;
            },
        }
    )).class('g3-gauge-face');

    return face;
}


export function gaugeScrew(): GaugeScrewComponent {
    let r = 8,
        shape: ScrewShape = 'slotted';

    const screw: GaugeScrewComponent = stylable<GaugeScrewComponent>(transformable(Object.assign(
        function(sel: SelectorOrSelection) {
            const rotate = Math.random() * 360;
            const _ = d3sel(sel).append('g').attr('class', 'g3-gauge-screw');
            screw.transformable(_);
            screw.stylable(_);
            _.append('circle').attr('r', r).attr('class', 'g3-gauge-screw-head');
            _.append('circle').attr('r', r).attr('class', 'g3-highlight');
            switch (shape) {
                case 'robertson':
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate})`)
                        .attr('x', -0.4).attr('width', 0.8)
                        .attr('y', -0.4).attr('height', 0.8);
                    break;
                case 'phillips':
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate + 90})`)
                        .attr('x', -1).attr('width', 2)
                        .attr('y', -0.2).attr('height', 0.4);
                    // eslint-disable-next-line no-fallthrough
                default:  // slotted
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate})`)
                        .attr('x', -1).attr('width', 2)
                        .attr('y', -0.2).attr('height', 0.4);
            }
        },
        {
            r(_?: number): any {
                return arguments.length ? (r = _!, screw) : r;
            },
            shape(_?: ScrewShape): any {
                return arguments.length ? (shape = _!, screw) : shape;
            },
        }
    )));

    return screw;
}


export function gaugeLabel(s_?: string, opts?: GaugeLabelOptions): GaugeLabelComponent {
    let s = s_ || '',
        x = 0, y = 0, dx: number | string = 0, dy: number | string = 0, size = 10;

    const label: GaugeLabelComponent = stylable<GaugeLabelComponent>(Object.assign(
        function(sel: SelectorOrSelection) {
            const _ = d3sel(sel).append('text')
                .attr('x', x).attr('y', y)
                .attr('dx', dx).attr('dy', dy)
                .attr('font-size', size)
                .text(s);
            label.stylable(_);
        },
        {
            value(_?: string): any {
                return arguments.length ? (s = _!, label) : s;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, label) : size;
            },
            x(_?: number): any {
                return arguments.length ? (x = _!, label) : x;
            },
            y(_?: number): any {
                return arguments.length ? (y = _!, label) : y;
            },
            dx(_?: number | string): any {
                return arguments.length ? (dx = _!, label) : dx;
            },
            dy(_?: number | string): any {
                return arguments.length ? (dy = _!, label) : dy;
            },
        }
    )).class('g3-gauge-label');

    if (typeof opts === 'object') {
        const setterMap = label as unknown as Record<string, ((v: unknown) => unknown) | undefined>;
        Object.entries(opts).forEach(([k, v]) => {
            const setter = setterMap[k];
            if (typeof setter !== 'function') throw `label: unknown attribute ${k}`;
            setter.call(label, v);
        });
    }
    return label;
}


// shorthand to add a status light of given color
export function statusLight(): StatusLightComponent {
    const g = gauge();
    let trigger = identity as (v: any) => any,
        color = 'red';

    const statusLightFn: StatusLightComponent = Object.assign(
        function(sel: SelectorOrSelection, parent?: GaugeComponent) {
            const _ = gauge()
                .metric(g.metric())
                .instance(g.instance())
                .fake(g.fake())
                .append(
                    indicateStyle().trigger(trigger).append(
                        gaugeFace().style(`fill: ${color}`),
                        gaugeFace().class('g3-highlight'),
                    )
                );
            _(sel, parent);
        },
        {
            metric(_?: string): any {
                return arguments.length ? (g.metric(_), statusLightFn) : g.metric();
            },
            instance(_?: string | null): any {
                return arguments.length ? (g.instance(_), statusLightFn) : g.instance();
            },
            fake(_?: Fake): any {
                return arguments.length ? (g.fake(_), statusLightFn) : g.fake();
            },
            trigger(_?: (v: any) => any): any {
                return arguments.length ? (trigger = _!, statusLightFn) : trigger;
            },
            color(_?: string): any {
                return arguments.length ? (color = _!, statusLightFn) : color;
            },
        }
    );

    return statusLightFn;
}
