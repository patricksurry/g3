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
import type { D3Selection, StylableMixin, TransformableMixin, InteractableMixin, AppendableMixin } from './types';

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


export function stylable<T extends object>(f: T): T & StylableMixin<T> {
    let kls: string[] = [],
        style: string | undefined;

    const fn = f as any;
    fn.stylable = function (selection: D3Selection) {
        if (kls.length) selection.attr('class', fn.class());
        if (style) selection.attr('style', fn.style());
    };
    fn.css = function(_?: string | Record<string, any>) {
        return arguments.length ? (kls.push(emotionCss(_!)), fn) : kls.join(' ');
    };
    fn.class = function(_?: string) {
        return arguments.length ? (kls = kls.concat(_!.split(' ')), fn) : kls.join(' ');
    };
    fn.style = function(_?: string) {
        return arguments.length ? (style = _, fn): style;
    };
    return fn;
}


export function transformable<T extends object>(f: T): T & TransformableMixin<T> {
    let x = 0, y = 0, scalex = 1, scaley = 1, rotate = 0;

    const fn = f as any;
    fn.transformable = function(selection: D3Selection) {
        selection.attr('transform', `translate(${x}, ${y}) rotate(${rotate}) scale(${scalex}, ${scaley})`);
    };
    fn.x = function(_?: number) {
        return arguments.length ? (x = _!, fn) : x;
    };
    fn.y = function(_?: number) {
        return arguments.length ? (y = _!, fn) : y;
    };
    fn.scale = function(xVal?: number, yVal?: number) {
        return arguments.length ? (scalex = xVal!, scaley = yVal ?? xVal!, fn) : [scalex, scaley];
    };
    fn.rotate = function(_?: number) {
        return arguments.length ? (rotate = _!, fn) : rotate;
    };
    return fn;
}


export function interactable<T extends object>(f: T): T & InteractableMixin<T> {
    const handlers: Record<string, [(e: any, ...args: any[]) => void, any]> = {};

    const fn = f as any;
    fn.interactable = function(selection: D3Selection, ...args: any[]) {
        Object.entries(handlers).forEach(([_type, v]) => {
            const [handler, opts] = v;
            selection.on(_type, (e: any) => handler(e, ...args), opts);
        });
    };
    fn.on = function(type?: string, handler?: (e: any, ...args: any[]) => void, opts?: any) {
        return arguments.length ? (handlers[type!] = [handler!, opts], fn): handlers;
    };
    return fn;
}


export function appendable<T extends object>(f: T): T & AppendableMixin<T> {
    let defs: any[] = [],
        kids: any[] = [];

    const fn = f as any;
    fn.appendable = function(sel: any, g?: any) {
        const s = d3sel(sel);
        if (defs.length) {
            const node = s.node() as any;
            const owner = node && 'ownerSVGElement' in node ? node.ownerSVGElement : null;
            const _ = d3.select(owner || node).select('defs');
            if (_.empty()) throw "Couldn't find svg defs element";
            _.selectAll(null)
                .data(defs)
              .enter().each(function(d: any) { d3.select(this as any).call(d, g); });
        }
        s.selectAll(null)
            .data(kids)
          .enter().each(function(d: any) { d3.select(this as any).call(d, g); });
    };
    fn.defs = function(..._: any[]) {
        return arguments.length ? (defs = defs.concat(_), fn) : defs;
    };
    fn.append = function(..._: any[]) {
        return arguments.length ? (kids = kids.concat(_), fn) : kids;
    };
    return fn;
}
