import * as d3 from 'd3';

import { stylable, appendable, identity } from './mixin.js';
import { activeController } from './controller.js';
import { pointers } from './pointers.js';


export function indicateText() {
    var format = identity,
        size = 20;

    function text(sel, g) {
        let _ = sel.append('text').attr('font-size', size);
        text.stylable(_);
        _ = _.text('');

        function update(v, transition) {    // eslint-disable-line no-unused-vars
            _.text(format(v));
        }
        activeController.register(update, g.metric(), g.unit())
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
        let _ = sel.append('g').classed('will-change-transform', true);

        pointer.stylable(_);
        if (!pointer.append().length) {
            pointer.append(pointers[shape]);
        }
        pointer.appendable(_, g);

        function update(v, transition) {
            let z = rescale(v);
            if (typeof(clamp[0]) == 'number') z = Math.max(z, clamp[0]);
            if (typeof(clamp[1]) == 'number') z = Math.min(z, clamp[1]);
            transition(_).attr('transform', g.metrictransform(z));
        }
        activeController.register(update, g.metric(), g.unit())
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


export function indicateSector() {
    var rescale = identity,
        clamp = [undefined, undefined],
        anchor = 0,
        size = 10,
        inset = 0;

    function sector(sel, g) {
        let _ = sel.append('path');

        sector.stylable(_);

        function update(v, transition) {
            let z = rescale(v), z0 = rescale(anchor), negative = v < anchor;
            if (typeof(clamp[0]) == 'number') z = Math.max(z, clamp[0]);
            if (typeof(clamp[1]) == 'number') z = Math.min(z, clamp[1]);
            transition(_)
                .attr('d', g.sectorpath(negative ? z: z0, negative ? z0: z, size, inset));
            _.classed('g3-indicate-sector-negative', negative);
        }
        activeController.register(update, g.metric(), g.unit());
    }
    sector.rescale = function(_) {
        return arguments.length ? (rescale = _, sector) : rescale;
    }
    sector.clamp = function(_) {
        return arguments.length ? (clamp = _, sector) : clamp;
    }
    sector.anchor = function(_) {
        return arguments.length ? (anchor = _, sector) : anchor;
    }
    sector.size = function(_) {
        return arguments.length ? (size = _, sector) : size;
    }
    sector.inset = function(_) {
        return arguments.length ? (inset = _, sector) : inset;
    }
    return stylable(sector).class('g3-indicate-sector');
}


export function indicateStyle() {
    var styleOn = {opacity: 1},
        styleOff = {opacity: 0},
        trigger = identity;
    function style(sel, g) {
        const tween = d3.interpolate(styleOff, styleOn);
        let _ = sel.append('g').attr('class', 'g3-indicate-style');
        style.appendable(_, g);

        function update(v, transition) {    // eslint-disable-line no-unused-vars
            let s = tween(trigger(v));
            // Nb. ignore transition for style updates, looks weird for light on/off
            for (let k in s) _.style(k, s[k]);
        }
        activeController.register(update, g.metric(), g.unit());
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

