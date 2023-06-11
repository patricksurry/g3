// implements deferred element constructors that let us define elements
// and later draw them in the context of a specific selection and parent gauge

import * as d3 from 'd3';

import {stylable, interactable, transformable, appendable} from "./mixin.js";


export function element(elt, attrs_) {
    var attrs = attrs_ || {};

    function element(sel, g) {
        var _ = sel.append(elt);
        Object.entries(attrs).forEach(([k, v]) => _.attr(k, v));
        element.stylable(_);
        element.appendable(_, g);
        element.interactable(_, g);
    }
    element.attr = function(k, _) {
        return (typeof _ !== 'undefined') ? (attrs[k] = _, element): attrs[k];
    }
    return interactable(stylable(appendable(element)));
}


export function put() {
    function put(sel, g) {
        var _ = sel.append('g');
        put.transformable(_);
        put.stylable(_);
        put.appendable(_, g);
        put.interactable(_, g);
    }
    interactable(stylable(transformable(appendable(put))));
    return put;
}


export function snapScale() {
    var step = 1,
        start = 0,
        strength = 5;

    function snapScale(v) {
        let v0 = Math.round((v - start)/step)*step + start,
            w = step/2,
            dv = d3.scalePow().domain([-w,w]).range([-w,w]).exponent(strength)(v - v0);

        return v0 + dv;
    }
    snapScale.start = function(_) {
        return arguments.length ? (start = _, snapScale): start;
    }
    snapScale.step = function(_) {
        return arguments.length ? (step = _, snapScale): step;
    }
    snapScale.strength = function(_) {
        return arguments.length ? (strength = _, snapScale): strength;
    }
    return snapScale;
}
