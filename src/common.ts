// implements deferred element constructors that let us define elements
// and later draw them in the context of a specific selection and parent gauge

import * as d3 from 'd3';

import { stylable, interactable, transformable, appendable } from './mixin';
import type { D3Selection, SelectorOrSelection, ElementComponent, PutComponent, SnapScale } from './types';


export function d3sel(sel: SelectorOrSelection): D3Selection {
    return (typeof sel === 'string') ? d3.select(sel) : sel;
}


export function element(elt: string, attrs_?: Record<string, any>): ElementComponent {
    const attrs: Record<string, any> = attrs_ || {};

    function elementFn(sel: SelectorOrSelection, g?: any) {
        const _ = d3sel(sel).append(elt);
        Object.entries(attrs).forEach(([k, v]) => _.attr(k, v));
        (elementFn as any).stylable(_);
        (elementFn as any).appendable(_, g);
        (elementFn as any).interactable(_, g);
    }
    (elementFn as any).attr = function(k: string, _?: any) {
        return (typeof _ !== 'undefined') ? (attrs[k] = _, elementFn): attrs[k];
    };
    return interactable(stylable(appendable(elementFn))) as unknown as ElementComponent;
}


export function put(): PutComponent {
    function putFn(sel: SelectorOrSelection, g?: any) {
        const _ = d3sel(sel).append('g');
        (putFn as any).transformable(_);
        (putFn as any).stylable(_);
        (putFn as any).appendable(_, g);
        (putFn as any).interactable(_, g);
    }
    interactable(stylable(transformable(appendable(putFn))));
    return putFn as unknown as PutComponent;
}


export function snapScale(): SnapScale {
    let step = 1,
        start = 0,
        strength = 5;

    function snapScaleFn(v: number): number {
        const v0 = Math.round((v - start)/step)*step + start,
            w = step/2,
            dv = (d3.scalePow().domain([-w,w]).range([-w,w]).exponent(strength)(v - v0) as number);

        return v0 + dv;
    }
    (snapScaleFn as any).start = function(_?: number) {
        return arguments.length ? (start = _!, snapScaleFn): start;
    };
    (snapScaleFn as any).step = function(_?: number) {
        return arguments.length ? (step = _!, snapScaleFn): step;
    };
    (snapScaleFn as any).strength = function(_?: number) {
        return arguments.length ? (strength = _!, snapScaleFn): strength;
    };
    return snapScaleFn as unknown as SnapScale;
}


export function flatten(o: Record<string, any>, ks?: string[]): [string[], any][] {
    const prefix = ks || [];
    const result: [string[], any][] = [];
    Object.entries(o).forEach(([k, v]) => {
        const kks = prefix.concat([k]);
        if (v !== null && typeof v === 'object') {
            result.push(...flatten(v, kks));
        } else {
            result.push([kks, v]);
        }
    });
    return result;
}
