import * as d3 from 'd3';

import { stylable, appendable, identity, appendId } from './mixin.js';
import { activeController } from './controller.js';
import { pointers } from './pointers.js';


export function indicateText() {
    var format = identity,
        size = 20;

    function text(sel, g) {
        const metric = g.metric(),
            unit = g.unit();
        let _ = sel.append('text').attr('font-size', size);
        text.stylable(_);
        _ = _.text('');

        function update(fetch) {
            const v = fetch(metric, unit);
            if (typeof v == 'undefined') return;
            _.text(format(v));
        }

        activeController.register(update, metric, `${g.name}-indicate-text`)
    }
    text.format = function(_) {
        return arguments.length ? (format = _, text) : format;
    }
    text.size = function(_) {
        return arguments.length ? (size = _, text) : size;
    }
    return stylable(text).class('g3-indicate-text');
}


export function indicatePointer() {
    var rescale = identity,
        clamp = [undefined, undefined],
        shape = 'needle';

    function pointer(sel, g) {
        const metric = g.metric(),
            unit = g.unit();
        let _ = sel.append('g');

        pointer.stylable(_);
        if (!pointer.append().length) {
            pointer.append(pointers[shape]);
        }
        pointer.appendable(_, g);

        function update(fetch) {
            const v = fetch(metric, unit);
            if (typeof v == 'undefined') return;
            let z = rescale(v);
            if (typeof(clamp[0]) == 'number') z = Math.max(z, clamp[0]);
            if (typeof(clamp[1]) == 'number') z = Math.min(z, clamp[1]);
            activeController.transition(_).attr('transform', g.metrictransform(z));
        }
        activeController.register(update, metric, `${g.name}-indicate-pointer`)
    }
    pointer.rescale = function(_) {
        return arguments.length ? (rescale = _, pointer) : rescale;
    }
    pointer.clamp = function(_) {
        return arguments.length ? (clamp = _, pointer) : clamp;
    }
    pointer.shape = function(_) {
        if (arguments.length && !(_ in pointers)) throw 'pointer: unknown shape ${_}';
        return arguments.length ? (shape = _, pointer) : shape;
    }
    return stylable(appendable(pointer)).class('g3-indicate-pointer');
}


export function indicateStyle() {
    var styleOn = {opacity: 1},
        styleOff = {opacity: 0},
        trigger = identity;
    function style(sel, g) {
        const metric = g.metric(),
            unit = g.unit(),
            tween = d3.interpolate(styleOff, styleOn);
        let _ = sel.append('g').attr('class', 'g3-indicate-style');
        style.appendable(_, g);

        function update(fetch) {
            const v = fetch(metric, unit);
            if (typeof v == 'undefined') return;
            let style = tween(trigger(v));
            // Nb. no transition for style updates, looks weird for light on/off
            for (let k in style) _.style(k, style[k]);
        }
        activeController.register(update, metric, `${g.name}-indicate-style`)
    }
    style.styleOn = function(_) {
        return arguments.length ? (styleOn = _, style): styleOn;
    }
    style.styleOff = function(_) {
        return arguments.length ? (styleOff = _, style): styleOff;
    }
    style.trigger = function(_) {
        return arguments.length ? (trigger = _, style): trigger;
    }
    return appendable(style);
}

