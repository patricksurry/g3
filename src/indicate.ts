import * as d3 from 'd3';

import { d3sel } from './common';
import { stylable, appendable, identity } from './mixin';
import { activeController } from './controller';
import { pointers } from './pointers';
import type {
    SelectorOrSelection,
    IndicateTextComponent,
    IndicatePointerComponent,
    IndicateSectorComponent,
    IndicateStyleComponent
} from './types';


export function indicateText(): IndicateTextComponent {
    let format = identity as (v: any) => any,
        size = 20;

    function text(sel: SelectorOrSelection, g: any) {
        let _ = d3sel(sel).append('text').attr('font-size', size);
        (text as any).stylable(_);
        _ = _.text('');

        if (activeController) {
            const update = (v: any) => {
                _.text(format(v));
            };
            activeController.register(update, g.metric(), g.unit());
        }
    }
    (text as any).format = function(_?: (v: any) => any) {
        return arguments.length ? (format = _!, text) : format;
    };
    (text as any).size = function(_?: number) {
        return arguments.length ? (size = _!, text) : size;
    };
    return (stylable(text) as unknown as IndicateTextComponent).class('g3-indicate-text');
}


export function indicatePointer(): IndicatePointerComponent {
    let rescale = identity as (v: any) => any,
        clamp: [number | undefined, number | undefined] = [undefined, undefined],
        shape = 'needle';

    function pointer(sel: SelectorOrSelection, g: any) {
        const _ = d3sel(sel).append('g').classed('will-change-transform', true);

        (pointer as any).stylable(_);
        if (!(pointer as any).append().length) {
            (pointer as any).append(pointers[shape]);
        }
        (pointer as any).appendable(_, g);

        if (activeController) {
            const update = (v: any, transition: any) => {
                let z = rescale(v);
                if (typeof(clamp[0]) === 'number') z = Math.max(z, clamp[0]);
                if (typeof(clamp[1]) === 'number') z = Math.min(z, clamp[1]);
                const t = typeof transition === 'function' ? transition(_) : _;
                t.attr('transform', g.metrictransform(z));
            };
            activeController.register(update, g.metric(), g.unit());
        }
    }
    (pointer as any).rescale = function(_?: (v: any) => any) {
        return arguments.length ? (rescale = _!, pointer) : rescale;
    };
    (pointer as any).clamp = function(_?: [number | undefined | null, number | undefined | null]) {
        return arguments.length ? (clamp = _ ? [_[0] ?? undefined, _[1] ?? undefined] : [undefined, undefined], pointer) : clamp;
    };
    (pointer as any).shape = function(_?: string) {
        if (arguments.length && !(_! in pointers)) throw `pointer: unknown shape ${_}`;
        return arguments.length ? (shape = _!, pointer) : shape;
    };
    return (stylable(appendable(pointer)) as unknown as IndicatePointerComponent).class('g3-indicate-pointer');
}


export function indicateSector(): IndicateSectorComponent {
    let rescale = identity as (v: any) => any,
        clamp: [number | undefined, number | undefined] = [undefined, undefined],
        anchor = 0,
        size = 10,
        inset = 0;

    function sector(sel: SelectorOrSelection, g: any) {
        const _ = d3sel(sel).append('path');

        (sector as any).stylable(_);

        if (activeController) {
            const update = (v: any, transition: any) => {
                let z = rescale(v);
                const z0 = rescale(anchor),
                    negative = v < anchor;
                if (typeof(clamp[0]) === 'number') z = Math.max(z, clamp[0]);
                if (typeof(clamp[1]) === 'number') z = Math.min(z, clamp[1]);
                const t = typeof transition === 'function' ? transition(_) : _;
                t.attr('d', g.sectorpath(negative ? z: z0, negative ? z0: z, size, inset));
                _.classed('g3-indicate-sector-negative', negative);
            };
            activeController.register(update, g.metric(), g.unit());
        }
    }
    (sector as any).rescale = function(_?: (v: any) => any) {
        return arguments.length ? (rescale = _!, sector) : rescale;
    };
    (sector as any).clamp = function(_?: [number | undefined | null, number | undefined | null]) {
        return arguments.length ? (clamp = _ ? [_[0] ?? undefined, _[1] ?? undefined] : [undefined, undefined], sector) : clamp;
    };
    (sector as any).anchor = function(_?: number) {
        return arguments.length ? (anchor = _!, sector) : anchor;
    };
    (sector as any).size = function(_?: number) {
        return arguments.length ? (size = _!, sector) : size;
    };
    (sector as any).inset = function(_?: number) {
        return arguments.length ? (inset = _!, sector) : inset;
    };
    return (stylable(sector) as unknown as IndicateSectorComponent).class('g3-indicate-sector');
}


export function indicateStyle(): IndicateStyleComponent {
    let styleOn: Record<string, any> = { opacity: 1 },
        styleOff: Record<string, any> = { opacity: 0 },
        trigger = identity as (v: any) => any;
    function style(sel: SelectorOrSelection, g: any) {
        const tween = d3.interpolate(styleOff, styleOn);
        const _ = d3sel(sel).append('g').attr('class', 'g3-indicate-style');
        (style as any).appendable(_, g);

        if (activeController) {
            const update = (v: any) => {
                const s = tween(trigger(v));
                // Nb. ignore transition for style updates, looks weird for light on/off
                for (const k in s) _.style(k, s[k]);
            };
            activeController.register(update, g.metric(), g.unit());
        }
    }
    (style as any).styleOn = function(_?: Record<string, any>) {
        return arguments.length ? (styleOn = _!, style): styleOn;
    };
    (style as any).styleOff = function(_?: Record<string, any>) {
        return arguments.length ? (styleOff = _!, style): styleOff;
    };
    (style as any).trigger = function(_?: (v: any) => any) {
        return arguments.length ? (trigger = _!, style): trigger;
    };
    return appendable(style) as unknown as IndicateStyleComponent;
}
