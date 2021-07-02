import * as d3 from 'd3';

import { stylable, transformable, appendable, identity, appendId, activeController } from './mixin.js';
import { element } from './common.js';
import { indicateStyle } from './indicate.js';

export var gaugeRegistry = {}; // only for testing

const DEG2RAD = Math.PI/180;


export function gauge(_name) {
    if (!_name) throw "g3.gauge(name) missing required name argument";
    if (_name in gaugeRegistry) return gaugeRegistry[_name];

    var name = _name,
        metric,
        unit,
        measure = d3.scaleLinear(),
        kind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        clip;

    function gauge(selection, parent) {
        let _ = selection.append('g');
        gauge.stylable(_);
        _ = _.append('g').attr('class', 'gauge-layers');

        if (typeof clip === 'function') {
            let clipId = appendId('gauge-clip');
            clip(_.append('clipPath').attr('id', clipId));
            _.attr('clip-path', `url(#${clipId})`);
        }
        gauge.appendable(_, gauge);

        if (autoindicate) {
            function update(metrics) {
                if (!(metric in metrics)) return;

                activeController.transition(_)
                    .attr('transform', gauge.metrictransform(metrics[metric], true))
            }
            activeController.register(update, metric, `${name}-autoindicate`)
        }
    }

    gauge.metric = function(_) {
        return arguments.length ? (metric = _, gauge) : metric;
    }
    gauge.unit = function(_) {
        return arguments.length ? (unit = _, gauge) : unit;
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
                    startAngle: z0*DEG2RAD,
                    endAngle: z1*DEG2RAD
                })
                : `M ${z0},${inset} l 0,${size} l ${z1-z0},0 l 0,${-size} z`;
        return path;
    }

    gauge.metrics
    gauge.children
    gaugeRegistry[_name] = gauge;

    return stylable(appendable(gauge)).class('gauge gauge-' + name);
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
    return stylable(face).class('gauge-face');
}


export function gaugeScrew() {
    var r = 8,
        shape = 'slotted';  // or phillips, robertson
    function screw(_, g) {
        let rotate = Math.random()*360;
        _ = _.append('g').attr('class', 'gauge-screw');
        screw.transformable(_);
        screw.stylable(_);
        _.append('circle').attr('r', r).attr('class', 'gauge-screw-head');
        _.append('circle').attr('r', r) .attr('class', 'gauge-screw-highlight');
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
                // no break
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



export function gaugeLabel(s, opts) {
    var s = s || '',
        x = 0, y = 0, dx = 0, dy = 0, size = 10;
    function label(sel, g) {
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
    stylable(label).class('gauge-label');
    if (typeof opts === 'object') {
        Object.items(opts).forEach(([k,v]) => {
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
            g3.indicateStyle().trigger(trigger).append(
                g3.gaugeFace().style(`fill: ${color}`),
                g3.gaugeFace().style("fill: url('#highlightGradient'); fill-opacity: 0.25"),
            )
        )
        g(sel, parent);
    }
    statusLight.metric = function(_) {
        const v = g.metric(_);
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
