import * as d3 from 'd3';

import { stylable, transformable, appendable, identity, appendId } from './mixin.js';
import { activeController, convertUnits, knownUnits } from './controller.js';
import { indicateStyle } from './indicate.js';
import { grid } from './grid.js';


export function gauge() {

    var metric,
        rescale = identity,
        unit,
        instance,
        fake,
        measure = d3.scaleLinear().range([0,360]),
        kind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        showgrid = false,
        clip;

    function gauge(selection, parent) {
        // we namespace the metric using the instance chain at drawing time
        let ns = parent ? parent._ns.slice() : [];
        if (instance) {
            // instances like '...foo' removes two items from parent chain
            if (instance.startsWith('.')) {
                let m = instance.match(/^\.+(.*)/);
                let s = m[1];
                ns = ns.slice(0, -(instance.length - s.length - 1));
                if (s) ns.push(s);
            } else {
                ns.push(instance);
            }
        }
        gauge._ns = ns;

        const m = gauge.metric();

        let _ = selection.append('g');
        gauge.stylable(_);
        _ = _.append('g');

        if (typeof clip === 'function') {
            let clipId = appendId('gauge-clip');
            clip(_.append('clipPath').attr('id', clipId));
            _.attr('clip-path', `url(#${clipId})`);
        }
        gauge.appendable(_, gauge);

        if (showgrid) grid().x(-r).y(-r).xmajor(50).ymajor(50).width(2*r).height(2*r)(_);

        if (fake && m) activeController.fake(m, fake);

        function update(v, transition) {
            transition(_).attr('transform', gauge.metrictransform(rescale(v), true))
        }

        if (autoindicate) {
            _.classed('will-change-transform', true);
            activeController.register(update, m, unit)
        }
    }
    gauge._ns = [];

    gauge.metric = function(_) {
        // with an argument, sets metric,
        // with no argument, returns qualified metric, e.g. fuel.copilot.rear
        return arguments.length
            ? (metric = _, gauge)
            : (metric && [metric].concat(gauge._ns).join('.'));
    }
    gauge.rescale = function(_) {
        return arguments.length ? (rescale = _, gauge) : rescale;
    }
    gauge.unit = function(_) {
        if (_ && !knownUnits.includes(_)) {
            console.log(`WARNING: gauge.unit ${_} not a known unit, see https://github.com/convert-units/convert-units`);
        }
        return arguments.length ? (unit = _, gauge) : unit;
    }
    gauge.instance = function(_) {
        return arguments.length ? (instance = _, gauge): instance;
    }
    gauge.fake = function(_) {
        return arguments.length ? (fake = _, gauge): fake;
    }
    gauge.kind = function(_) {
        return arguments.length ? (kind = _, gauge) : kind;
    }
    gauge.clip = function(_) {
        return arguments.length ? (clip = _, gauge) : clip;
    }
    gauge.r = function(_) {
        return arguments.length ? (r = _, gauge) : r;
    }
    gauge.measure = function(_) {
        return arguments.length ? (measure = _, gauge) : measure;
    }
    gauge.autoindicate = function(_) {
        return arguments.length ? (autoindicate = _, gauge) : autoindicate;
    }
    gauge.grid = function(_) {
        return arguments.length ? (showgrid = !!_, gauge): showgrid;
    }

    gauge.metrictransform = function(v, invert) {
        const
            circular = kind == 'circular',
            z = invert ? -measure(v) : measure(v);
        return circular ? `rotate(${z})` : `translate(${z}, 0)`;
    }
    gauge.marktransform = function(v, inset) {
        const
            circular = kind == 'circular',
            z = measure(v),
            y = inset + (circular ? -r : 0);
        return circular ? `rotate(${z}) translate(0, ${y})` : `translate(${z}, ${y})`;
    }
    gauge.sectorpath = function(v0, v1, _size, _inset) {
        const
            size = _size ?? 0,
            inset = _inset ?? 0,
            r = gauge.r(),
            m = gauge.measure(),
            z0 = m(v0),
            z1 = m(v1),
            path = gauge.kind() == 'circular'
                ? d3.arc()({
                    innerRadius: r - inset - size,
                    outerRadius: r - inset,
                    startAngle: convertUnits(z0).from('deg').to('rad'),
                    endAngle: convertUnits(z1).from('deg').to('rad'),
                })
                : `M ${z0},${inset} l 0,${size} l ${z1-z0},0 l 0,${-size} z`;
        return path;
    }

    return stylable(appendable(gauge)).class('g3-gauge');
}


export function gaugeFace() {
    var r = 100,
        window;
    function face(sel, g) {
        var maskId;
        if (typeof window === 'function') {
            maskId = appendId('gauge-face-window-');
            let _ = sel.append('mask').attr('id', maskId);
            _.append('circle').attr('r', r).style('fill', 'white');
            _ = _.append('g').attr('style', 'fill: black');
            window(_, g);
        }
        let _ = sel.append('circle')
            .attr('r', r);
        face.stylable(_);
        if (maskId) _.attr('mask', `url(#${maskId})`);
    }
    face.r = function(_) {
        return arguments.length ? (r = _, face) : r;
    }
    face.window = function(_) {
        return arguments.length ? (window = _, face): window;
    }
    return stylable(face).class('g3-gauge-face');
}


export function gaugeScrew() {
    var r = 8,
        shape = 'slotted';  // or phillips, robertson
    function screw(_, /* g */) {
        let rotate = Math.random()*360;
        _ = _.append('g').attr('class', 'g3-gauge-screw');
        screw.transformable(_);
        screw.stylable(_);
        _.append('circle').attr('r', r).attr('class', 'g3-gauge-screw-head');
        _.append('circle').attr('r', r) .attr('class', 'g3-highlight');
        switch (shape) {
            case 'robertson':
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate})`)
                    .attr('x', -0.4).attr('width', 0.8)
                    .attr('y', -0.4).attr('height', 0.8);
                break;
            case 'phillips':
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate+90})`)
                    .attr('x', -1).attr('width', 2)
                    .attr('y', -0.2).attr('height', 0.4);
                // eslint-disable-next-line no-fallthrough
            default:  // slotted
                _.append('rect')
                    .attr('transform', `scale(${r}) rotate(${rotate})`)
                    .attr('x', -1).attr('width', 2)
                    .attr('y', -0.2).attr('height', 0.4);
        }
    }
    screw.r = function(_) {
        return arguments.length ? (r = _, screw): r;
    }
    screw.shape = function(_) {
        return arguments.length ? (shape = _, screw): shape;
    }
    return stylable(transformable(screw));
}



export function gaugeLabel(s_, opts) {
    var s = s_ || '',
        x = 0, y = 0, dx = 0, dy = 0, size = 10;
    function label(sel, /* g */) {
        let _ = sel.append('text')
            .attr('x', x).attr('y', y)
            .attr('dx', dx).attr('dy', dy)
            .attr('font-size', size)
            .text(s);
        label.stylable(_);
    }
    label.value = function(_) {
        return arguments.length ? (s = _, label): s;
    }
    label.size = function(_) {
        return arguments.length ? (size = _, label): size;
    }
    label.x = function(_) {
        return arguments.length ? (x = _, label): x;
    }
    label.y = function(_) {
        return arguments.length ? (y = _, label): y;
    }
    label.dx = function(_) {
        return arguments.length ? (dx = _, label): dx;
    }
    label.dy = function(_) {
        return arguments.length ? (dy = _, label): dy;
    }
    stylable(label).class('g3-gauge-label');
    if (typeof opts === 'object') {
        Object.entries(opts).forEach(([k,v]) => {
            if (typeof label[k] !== 'function') throw `label: unknown attribute ${k}`;
            label[k](v);
        });
    }
    return label;
}


// shorthand to add a status light of given color
export function statusLight(_) {
    var g = gauge(_),
        trigger = identity,
        color = 'red';
    function statusLight(sel, parent) {
        g.append(
            indicateStyle().trigger(trigger).append(
                gaugeFace().style(`fill: ${color}`),
                gaugeFace().class('g3-highlight'),
            )
        )
        g(sel, parent);
    }
    statusLight.metric = function(_) {
        const v = g.metric(_);
        return arguments.length ? statusLight: v;
    }
    statusLight.instance = function(_) {
        const v = g.instance(_);
        return arguments.length ? statusLight: v;
    }
    statusLight.fake = function(_) {
        const v = g.fake(_);
        return arguments.length ? statusLight: v;
    }
    statusLight.trigger = function(_) {
        return arguments.length ? (trigger = _, statusLight): trigger;
    }
    statusLight.color = function(_) {
        return arguments.length ? (color = _, statusLight): color;
    }
    return statusLight;
}
