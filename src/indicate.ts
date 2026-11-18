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
    IndicatePointerComponent,
    IndicateSectorComponent,
    IndicateStyleComponent
} from './types';


export function indicateText(): IndicateTextComponent {
    let format = identity as (v: any) => any,
        size = 20;

    const text: IndicateTextComponent = stylable<IndicateTextComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            let _ = d3sel(sel).append('text').attr('font-size', size);
            text.stylable(_);
            _ = _.text('');

            if (activeController && g) {
                const update = (v: any) => {
                    _.text(format(v));
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            format(_?: (v: any) => any): any {
                return arguments.length ? (format = _!, text) : format;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, text) : size;
            },
        }
    )).class('g3-indicate-text');

    return text;
}


export function indicatePointer(): IndicatePointerComponent {
    let rescale = identity as (v: any) => any,
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
                const update = (v: any, transition?: TransitionFunction) => {
                    let z = rescale(v);
                    if (typeof clamp[0] === 'number') z = Math.max(z, clamp[0]);
                    if (typeof clamp[1] === 'number') z = Math.min(z, clamp[1]);
                    const t = typeof transition === 'function' ? transition(_) : _;
                    t.attr('transform', g.metrictransform(z));
                };
                activeController.register(update, g.metric(), g.unit());
            }
        },
        {
            rescale(_?: (v: any) => any): any {
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
    let rescale = identity as (v: any) => any,
        clamp: [number | undefined, number | undefined] = [undefined, undefined],
        anchor = 0,
        size = 10,
        inset = 0;

    const sector: IndicateSectorComponent = stylable<IndicateSectorComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const _ = d3sel(sel).append('path');

            sector.stylable(_);

            if (activeController && g) {
                const update = (v: any, transition?: TransitionFunction) => {
                    let z = rescale(v);
                    const z0 = rescale(anchor),
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
            rescale(_?: (v: any) => any): any {
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
        trigger = identity as (v: any) => any;

    const style: IndicateStyleComponent = appendable<IndicateStyleComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const tween = d3.interpolate(styleOff, styleOn);
            const _ = d3sel(sel).append('g').attr('class', 'g3-indicate-style');
            style.appendable(_, g);

            if (activeController && g) {
                const update = (v: any) => {
                    const s = tween(Number(trigger(v)));
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
            trigger(_?: (v: any) => any): any {
                return arguments.length ? (trigger = _!, style) : trigger;
            },
        }
    ));

    return style;
}
