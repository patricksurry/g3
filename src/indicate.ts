import * as d3 from 'd3';

import { d3sel } from './common';
import { stylable, appendable, identity } from './mixin';
import { activeController } from './controller';
import { pointers } from './pointers';
import type {
    SelectorOrSelection,
    GaugeComponent,
    PointerShape,
    TransitionFunction,
    IndicateTextComponent,
    IndicateUnitComponent,
    IndicatePointerComponent,
    IndicateSectorComponent,
    IndicateStyleComponent
} from './types';


export function indicateText(): IndicateTextComponent {
    let format = identity as (v: any, metrics?: Record<string, any>, unit?: string) => any,
        size = 20;

    const text: IndicateTextComponent = stylable<IndicateTextComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            let _ = d3sel(sel).append('text').attr('font-size', size);
            text.stylable(_);
            _ = _.text('');

            if (activeController && g) {
                const update = (v: any, _transition?: TransitionFunction, metrics?: Record<string, any>, unit?: string) => {
                    _.text(format(v, metrics, unit));
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            format(_?: (v: any, metrics?: Record<string, any>, unit?: string) => any): any {
                return arguments.length ? (format = _!, text) : format;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, text) : size;
            },
        }
    )).class('g3-indicate-text');

    return text;
}


export function indicateUnit(): IndicateUnitComponent {
    let format = identity as (u: string, v?: any, metrics?: Record<string, any>) => any,
        size = 20;

    const unit: IndicateUnitComponent = stylable<IndicateUnitComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            let _ = d3sel(sel).append('text').attr('font-size', size);
            unit.stylable(_);
            _ = _.text(g?.unit() ? format(g.unit()!) : '');

            if (activeController && g) {
                const update = (v: any, _transition?: TransitionFunction, metrics?: Record<string, any>, u?: string) => {
                    _.text(format(u || '', v, metrics));
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            format(_?: (u: string, v?: any, metrics?: Record<string, any>) => any): any {
                return arguments.length ? (format = _!, unit) : format;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, unit) : size;
            },
        }
    )).class('g3-indicate-unit');

    return unit;
}


export function indicatePointer(): IndicatePointerComponent {
    let rescale = identity as (v: any, metrics?: Record<string, any>, unit?: string) => any,
        clamp: [number | undefined, number | undefined] = [undefined, undefined],
        shape: PointerShape = 'needle';

    const pointer: IndicatePointerComponent = stylable<IndicatePointerComponent>(appendable(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const _ = d3sel(sel).append('g').classed('will-change-transform', true);

            pointer.stylable(_);
            if (!pointer.append().length) {
                pointer.append(pointers[shape]);
            }
            pointer.appendable(_, g);

            if (activeController && g) {
                const range = g.measure().range();
                const isFullCircle = g.kind() == 'circular' && range[0] !== range[1] && ((range[0] - range[1]) % 360 == 0);
                const isClamped = typeof clamp[0] === 'number' || typeof clamp[1] === 'number';
                const isCyclic = isFullCircle && !isClamped;

                const update = (v: any, transition?: TransitionFunction, metrics?: Record<string, any>, unit?: string) => {
                    let z = rescale(v, metrics, unit);
                    if (typeof clamp[0] === 'number') z = Math.max(z, clamp[0]);
                    if (typeof clamp[1] === 'number') z = Math.min(z, clamp[1]);
                    const xform = g.metrictransform(z);
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
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            rescale(_?: (v: any, metrics?: Record<string, any>, unit?: string) => any): any {
                return arguments.length ? (rescale = _!, pointer) : rescale;
            },
            clamp(_?: [number | undefined | null, number | undefined | null]): any {
                return arguments.length
                    ? (clamp = _ ? [_[0] ?? undefined, _[1] ?? undefined] : [undefined, undefined], pointer)
                    : clamp;
            },
            shape(_?: PointerShape): any {
                if (arguments.length && !(_! in pointers)) throw `pointer: unknown shape ${_}`;
                return arguments.length ? (shape = _!, pointer) : shape;
            },
        }
    ))).class('g3-indicate-pointer');

    return pointer;
}


export function indicateSector(): IndicateSectorComponent {
    let rescale = identity as (v: any, metrics?: Record<string, any>, unit?: string) => any,
        clamp: [number | undefined, number | undefined] = [undefined, undefined],
        anchor = 0,
        size = 10,
        inset = 0;

    const sector: IndicateSectorComponent = stylable<IndicateSectorComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const _ = d3sel(sel).append('path');

            sector.stylable(_);

            if (activeController && g) {
                const update = (v: any, transition?: TransitionFunction, metrics?: Record<string, any>, unit?: string) => {
                    let z = rescale(v, metrics, unit);
                    const z0 = rescale(anchor, metrics, unit),
                        negative = v < anchor;
                    if (typeof clamp[0] === 'number') z = Math.max(z, clamp[0]);
                    if (typeof clamp[1] === 'number') z = Math.min(z, clamp[1]);
                    const t = typeof transition === 'function' ? transition(_) : _;
                    t.attr('d', g.sectorpath(negative ? z : z0, negative ? z0 : z, size, inset));
                    _.classed('g3-indicate-sector-negative', negative);
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            rescale(_?: (v: any, metrics?: Record<string, any>, unit?: string) => any): any {
                return arguments.length ? (rescale = _!, sector) : rescale;
            },
            clamp(_?: [number | undefined | null, number | undefined | null]): any {
                return arguments.length
                    ? (clamp = _ ? [_[0] ?? undefined, _[1] ?? undefined] : [undefined, undefined], sector)
                    : clamp;
            },
            anchor(_?: number): any {
                return arguments.length ? (anchor = _!, sector) : anchor;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, sector) : size;
            },
            inset(_?: number): any {
                return arguments.length ? (inset = _!, sector) : inset;
            },
        }
    )).class('g3-indicate-sector');

    return sector;
}


export function indicateStyle(): IndicateStyleComponent {
    let styleOn: Record<string, any> = { opacity: 1 },
        styleOff: Record<string, any> = { opacity: 0 },
        trigger = identity as (v: any, metrics?: Record<string, any>, unit?: string) => any;

    const style: IndicateStyleComponent = appendable<IndicateStyleComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const tween = d3.interpolate(styleOff, styleOn);
            const _ = d3sel(sel).append('g').attr('class', 'g3-indicate-style');
            style.appendable(_, g);

            if (activeController && g) {
                const update = (v: any, _transition?: TransitionFunction, metrics?: Record<string, any>, unit?: string) => {
                    const s = tween(Number(trigger(v, metrics, unit)));
                    // Nb. ignore transition for style updates, looks weird for light on/off
                    for (const k in s) _.style(k, s[k]);
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            styleOn(_?: Record<string, any>): any {
                return arguments.length ? (styleOn = _!, style) : styleOn;
            },
            styleOff(_?: Record<string, any>): any {
                return arguments.length ? (styleOff = _!, style) : styleOff;
            },
            trigger(_?: (v: any, metrics?: Record<string, any>, unit?: string) => any): any {
                return arguments.length ? (trigger = _!, style) : trigger;
            },
        }
    ));

    return style;
}
