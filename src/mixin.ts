/*
various mixins that add functionality to an existing object
typically mixin(f) adds a number of setters/getters to f that adjust arguments
as well as a mixin(sel[, ...]) function that renders the mixin into sel based on the current arguments
sample usage:

    obj = ...
    stylable(obj)
    obj.class('some-class')   // add a class argument
    obj.stylable(sel)            // render the style attributes for
*/

import * as d3 from 'd3';
import { css as emotionCss } from '@emotion/css';

import { d3sel } from './common';
import type {
    D3Selection,
    SelectorOrSelection,
    GaugeComponent,
    RenderFunction,
    StylableMixin,
    TransformableMixin,
    InteractableMixin,
    AppendableMixin
} from './types';

export const identity = <T>(v: T): T => v;

interface AppendIdFunction {
    (typ: string): string;
    nextId: number;
}

export const appendId: AppendIdFunction = Object.assign(
    function(typ: string): string {
        return typ + (++appendId.nextId).toString(36);
    },
    { nextId: 0 }
);


export function stylable<R extends object>(f: object): R & StylableMixin<R> {
    let kls: string[] = [],
        style: string | undefined;

    const fn = Object.assign(f, {
        stylable(selection: D3Selection) {
            if (kls.length) selection.attr('class', fn.class());
            if (style) selection.attr('style', fn.style()!);
        },
        css(_?: string | Record<string, any>): any {
            return arguments.length ? (kls.push(emotionCss(_!)), fn) : kls.join(' ');
        },
        class(_?: string): any {
            return arguments.length ? (kls = kls.concat(_!.split(' ')), fn) : kls.join(' ');
        },
        style(_?: string): any {
            return arguments.length ? (style = _, fn) : style;
        },
    });
    return fn as unknown as R & StylableMixin<R>;
}


export function transformable<R extends object>(f: object): R & TransformableMixin<R> {
    let x = 0, y = 0, scalex = 1, scaley = 1, rotate = 0;

    const fn = Object.assign(f, {
        transformable(selection: D3Selection) {
            selection.attr('transform', `translate(${x}, ${y}) rotate(${rotate}) scale(${scalex}, ${scaley})`);
        },
        x(_?: number): any {
            return arguments.length ? (x = _!, fn) : x;
        },
        y(_?: number): any {
            return arguments.length ? (y = _!, fn) : y;
        },
        scale(xVal?: number, yVal?: number): any {
            return arguments.length ? (scalex = xVal!, scaley = yVal ?? xVal!, fn) : [scalex, scaley];
        },
        rotate(_?: number): any {
            return arguments.length ? (rotate = _!, fn) : rotate;
        },
    });
    return fn as unknown as R & TransformableMixin<R>;
}


export function interactable<R extends object>(f: object): R & InteractableMixin<R> {
    const handlers: Record<string, [(e: any, ...args: any[]) => void, any]> = {};

    const fn = Object.assign(f, {
        interactable(selection: D3Selection, ...args: any[]) {
            Object.entries(handlers).forEach(([_type, v]) => {
                const [handler, opts] = v;
                selection.on(_type, (e: any) => handler(e, ...args), opts);
            });
        },
        on(type?: string, handler?: (e: any, ...args: any[]) => void, opts?: any): any {
            return arguments.length ? (handlers[type!] = [handler!, opts], fn) : handlers;
        },
    });
    return fn as unknown as R & InteractableMixin<R>;
}


export function appendable<R extends object>(f: object): R & AppendableMixin<R> {
    let defs: RenderFunction[] = [],
        kids: RenderFunction[] = [];

    const fn = Object.assign(f, {
        appendable(sel: SelectorOrSelection, g?: GaugeComponent) {
            const s = d3sel(sel);
            if (defs.length) {
                const node = s.node() as SVGElement | null;
                const owner = node && 'ownerSVGElement' in node ? node.ownerSVGElement : null;
                const _ = d3.select((owner || node) as Element).select('defs');
                if (_.empty()) throw "Couldn't find svg defs element";
                _.selectAll(null)
                    .data(defs)
                  .enter().each(function(this: d3.EnterElement, d: RenderFunction) { d3.select(this as unknown as Element).call(d, g); });
            }
            s.selectAll(null)
                .data(kids)
              .enter().each(function(this: d3.EnterElement, d: RenderFunction) { d3.select(this as unknown as Element).call(d, g); });
        },
        defs(..._: RenderFunction[]): any {
            return arguments.length ? (defs = defs.concat(_), fn) : defs;
        },
        append(..._: RenderFunction[]): any {
            return arguments.length ? (kids = kids.concat(_), fn) : kids;
        },
    });
    return fn as unknown as R & AppendableMixin<R>;
}
