// implements deferred element constructors that let us define elements
// and later draw them in the context of a specific selection and parent gauge

import * as d3 from 'd3';

import { stylable, interactable, transformable, appendable } from './mixin';
import type { D3Selection, SelectorOrSelection, GaugeComponent, ElementComponent, PutComponent, SnapScale } from './types';


export function d3sel(sel: SelectorOrSelection): D3Selection {
    return (typeof sel === 'string') ? d3.select(sel) : sel;
}


export function element(elt: string, attrs_?: Record<string, any>): ElementComponent {
    const attrs: Record<string, any> = attrs_ || {};
    let text: string | number | undefined;

    const elementFn: ElementComponent = interactable<ElementComponent>(stylable(appendable(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const _ = d3sel(sel).append(elt);
            Object.entries(attrs).forEach(([k, v]) => _.attr(k, v));
            if (typeof text !== 'undefined') _.text(text);
            elementFn.stylable(_);
            elementFn.appendable(_, g);
            elementFn.interactable(_, g);
        },
        {
            attr(k: string, _?: any): any {
                return (typeof _ !== 'undefined') ? (attrs[k] = _, elementFn) : attrs[k];
            },
            text(_?: string | number): any {
                return arguments.length ? (text = _, elementFn) : text;
            },
        }
    ))));
    return elementFn;
}


export function put(): PutComponent {
    const putFn: PutComponent = interactable<PutComponent>(stylable(transformable(appendable(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const _ = d3sel(sel).append('g');
            putFn.transformable(_);
            putFn.stylable(_);
            putFn.appendable(_, g);
            putFn.interactable(_, g);
        }
    ))));
    return putFn;
}


export function snapScale(): SnapScale {
    let step = 1,
        start = 0,
        strength = 5;

    const snapScaleFn: SnapScale = Object.assign(
        function(v: number): number {
            const v0 = Math.round((v - start)/step)*step + start,
                w = step/2,
                dv = d3.scalePow().domain([-w, w]).range([-w, w]).exponent(strength)(v - v0);

            return v0 + dv;
        },
        {
            start(_?: number): any {
                return arguments.length ? (start = _!, snapScaleFn) : start;
            },
            step(_?: number): any {
                return arguments.length ? (step = _!, snapScaleFn) : step;
            },
            strength(_?: number): any {
                return arguments.length ? (strength = _!, snapScaleFn) : strength;
            },
        }
    );
    return snapScaleFn;
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
