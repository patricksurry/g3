import * as d3 from 'd3';
import { css } from '@emotion/css';
import './gauge.css';

import 'dseg/css/dseg.css';

import { pointerShapes } from './pointers.js';



export const
    identity = v => v,
    DEG2RAD = Math.PI/180,
    metricDispatch = d3.dispatch('metric');

var nextId = 0;


function appendId(typ) {
    return typ + (++nextId).toString(36);
}


export var registry = {};

//TODO
window.registry = registry;
window.d3 = d3;


function stylable(f) {
    var kls = [],
        style;

    f.stylable = function (selection) {
        if (kls.length) selection.attr('class', f.class());
        if (style) selection.attr('style', f.style());
    }
    f.css = function(_) {
        return arguments.length ? (kls.push(css(_)), f) : kls.join(' ');
    }
    f.class = function(_) {
        return arguments.length ? (kls = kls.concat(_.split(' ')), f) : kls.join(' ');
    }
    f.style = function(_) {
        return arguments.length ? (style = _, f): style;
    }
    return f;
}


function transformable(f) {
    var x=0, y=0, scalex=1, scaley=1, rotate=0;

    f.transformable = function(selection) {
        selection.attr('transform', `translate(${x}, ${y}) scale(${scalex}, ${scaley}) rotate(${rotate})`);
    }
    f.x = function(_) {
        return arguments.length ? (x = _, f) : x;
    }
    f.y = function(_) {
        return arguments.length ? (y = _, f) : y;
    }
    f.scale = function(_) {
        return arguments.length ? (scalex = _, scaley = _, f) : scalex;
    }
    f.scalex = function(_) {
        return arguments.length ? (scalex = _, f) : scalex;
    }
    f.scaley = function(_) {
        return arguments.length ? (scaley = _, f) : scaley;
    }
    f.rotate = function(_) {
        return arguments.length ? (rotate = _, f) : rotate;
    }
    return f;
}


export function gauge(_name) {
    if (_name in registry) return registry[_name];

    var name = _name,
        metric,
        unit,
        measure = d3.scaleLinear(),
        kind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        clip,
        defs = [],
        kids = [];

    function gauge(selection) {
        if (defs.length) {
            let svg = d3.select(selection.node().ownerSVGElement),
                d = svg.select('defs');
            if (d.empty()) {
                d = svg.append('defs');
            }
            d.selectAll(null)
                .data(defs)
              .enter().each(function(d) { d3.select(this).call(d, gauge)});
        }

        let _ = selection.append('g');
        gauge.stylable(_);
        _ = _.append('g').attr('class', 'gauge-layers');

        if (typeof clip === 'function') {
            let clipId = appendId('gauge-clip');
            clip(_.append('clipPath').attr('id', clipId));
            _.attr('clip-path', `url(#${clipId})`);
        }

        _.selectAll('.gauge-layer')
            .data(kids)
          .enter().each(function(d) { d3.select(this).call(d, gauge); });

        if (autoindicate) {
            function update(metrics) {
                if (metric in metrics) {
                    _.transition().duration(500)
                        .attr('transform', gauge.metrictransform(metrics[metric], true))
                        .ease(d3.easeElastic);
                }
            }

            metricDispatch.on(appendId(`metric.autoindicate-${name}-`), update);
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
    gauge.defs = function(..._) {
        return arguments.length ? (defs = defs.concat(_), gauge) : defs;
    }
    gauge.append = function(..._) {
        return arguments.length ? (kids = kids.concat(_), gauge) : kids;
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
    registry[_name] = gauge;

    return stylable(gauge).class('gauge gauge-' + name);
}


gauge.element = function(elt, attrs) {
    var attrs = attrs || {},
        kids = [];

    function element(sel, g) {
        var _ = sel.append(elt);
        element.stylable(_);
        Object.entries(attrs).forEach(([k, v]) => _.attr(k, v));
        kids.forEach(f => f(_, g));
    }
    element.append = function(..._) {
        return arguments.length ? (kids = kids.concat(_), element) : kids;
    }
    element.attr = function(k, _) {
        return (typeof _ !== 'undefined') ? (attrs[k] = _, element): attrs[k];
    }
    return stylable(element);
}


gauge.put = function(f, xform) {

    function put(sel, g) {
        var _ = sel.append('g');
        put.transformable(_);
        put.stylable(_);
        f(_, g);
    }
    stylable(transformable(put));
    Object.entries(xform || {}).forEach(([k, v]) => {
        if (typeof put[k] !== 'function') throw `put: unknown attribute ${k}`;
        put[k](v);
    });
    return put;
}

gauge.face = function () {
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

gauge.label = function(s, opts) {
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

//TODO screws, add roberston :)
/*
var defs = svg.append('defs');


defs.append('radialGradient')
    .attr('id', 'dimple-gradient')
    .attr('cx', '50%').attr('fx', '25%')
    .attr('cy', '50%').attr('fy', '40%')
    .attr('r', '50%')
    .selectAll('stop')
    .data(['white', 'black'])
  .enter().append('stop')
    .attr('stop-color', v => v)
    .attr('offset', (v, i) => 100*i + '%')

defs.append('g')
    .attr('id', 'dimple')
    .attr('class', 'dimple')
    .selectAll('circle')
    .data(['bg', 'fg'])
  .enter().append('circle')
    .attr('class', (v) => 'dimple-' + v)
    .attr('r', 10);

let screwslots = defs
    .selectAll('.screwslot')
    .data(['slotted', 'phillips'])
  .enter().append('g')
    .attr('class', 'screwslot')
    .attr('id', (v) => 'screwslot-' + v);
screwslots.append('rect')
    .attr('x', -2)
    .attr('y', -10)
    .attr('width', 4)
    .attr('height', 20);
screwslots.filter((v) => v == 'phillips')
    .append('rect')
    .attr('y', -2)
    .attr('x', -10)
    .attr('width', 20)
    .attr('height', 4);



d3.select('#altitude-gauge > .gauge > .gauge-face').attr('mask', 'url(#altimeter-window)');
*/
gauge.axis = {}


gauge.axis.line = function() {
    function line(sel, g) {
        let _ = sel
            .append('path')
            .attr('d', g.sectorpath(...g.measure().domain()));
        line.stylable(_);
    }
    return stylable(line).class('gauge-axis');
}

gauge.axis.sector = function(_) {
    var vs = _.slice(),
        size = 5,
        inset = 0;
    function sector(sel, g) {
        let _ = sel
            .append('path')
            .attr('d', g.sectorpath(...vs, size, inset));
        sector.stylable(_);
    }
    sector.size = function(_) {
        return arguments.length ? (size = _, sector) : size;
    }
    sector.inset = function(_) {
        return arguments.length ? (inset = _, sector) : inset;
    }
    return stylable(sector).class('gauge-sector');
}

function tickvals(vs, step, start, g) {
    if (typeof vs !== 'undefined') return vs;

    var values = vs;

    if (typeof step === 'number') {
        let domain = g.measure().domain();
        const range = g.measure().range();
        domain.sort((a, b) => a - b);
        values = [];
        for (var v = start ?? Math.ceil(domain[0]/step)*step; v <= domain[1]; v += step)
            values.push(v);
        if (
            g.kind() == 'circular'
            && ((range[0] - range[1]) % 360 == 0)
            && values.includes(domain[0])
            && values.includes(domain[1])
        ) values.pop();
    } else {
        values = g.measure().ticks();
    }
    return values;
}


gauge.axis.ticks = function(vs) {
    var kind = 'tick',
        size = 10,
        width = 1,
        inset = 0,
        values = vs && vs.slice(),
        step, start;
    function ticks(sel, g) {
        let vs = tickvals(values, step, start, g);
        let _ = sel.append('g');
        ticks.stylable(_);
        _ = _.selectAll('.gauge-axis-' + kind)
            .data(vs)
          .enter().append('g')
            .attr('class', 'gauge-axis-' + kind)
            .attr('transform', d => g.marktransform(d, inset));

        switch(kind) {
            case 'dot':
                _.append('circle').attr('r', size);
                break;
            case 'wedge':
                _.append('path').attr('d', `M 0,${size} L ${width/2},0 L ${-width/2},0 z`)
                break;
            case 'rect':
                _.append('rect').attr('width', width).attr('height', size).attr('x', -width/2);
                break;
            default:
                _.append('path').attr('d', d3.line()([[0, 0], [0, size]]));
        }
    }
    ticks.step = function(_) {
        return arguments.length ? (step = _, ticks) : step;
    }
    ticks.start = function(_) {
        return arguments.length ? (start = _, ticks) : start;
    }
    ticks.kind = function(_) {
        return arguments.length ? (kind = _, ticks) : kind;
    }
    ticks.size = function(_) {
        return arguments.length ? (size = _, ticks) : size;
    }
    ticks.width = function(_) {
        return arguments.length ? (width = _, ticks) : width;
    }
    ticks.inset = function(_) {
        return arguments.length ? (inset = _, ticks) : inset;
    }
    return stylable(ticks).class('gauge-axis-ticks');
}

gauge.axis.labels = function(vs) {
    const isMap = typeof vs === 'object' && !Array.isArray(vs);

    var orient = 'fixed',  // 'relative', 'cw', 'ccw'
        upright = true,
        size = 20,
        inset = 25,
        rotate = 0,
        values = isMap ? Object.keys(vs) : vs,
        format = isMap ? v => vs[v] : identity,
        step, start;
    function labels(sel, g) {
        const vs = tickvals(values, step, start, g),
            circPath = orient.endsWith('cw'),
            pathId = circPath ? appendId('axis-label-path-') : undefined;

        let _ = sel.append('g');
        labels.stylable(_);
        _ = _.selectAll('.gauge-axis-label')
            .data(vs)
          .enter().append('g')
            .attr('class', 'gauge-axis-label');
        if (circPath) {
            const r = g.r() - inset,
                cw = orient == 'cw' ? 1: 0;
            _.append('path')
                .attr('id', (d, i) => `${pathId}-${i}`)
                .attr('d', `M 0,${r} A ${r},${r},0,1,${cw},0,-${r} A ${r},${r},0,1,${cw},0,${r}`)
                .attr('style', 'visibility: hidden')
                .attr('transform', d => g.metrictransform(d));
        }
        _ = _.append('text')
            .attr('font-size', size);
        if (circPath) {
            _ = _.append('textPath')
                .attr('startOffset', '50%')
                .attr('href', (d, i) => `#${pathId}-${i}`);
        } else {
//TODO upright
            _.attr('transform', d => {
                let xform = g.marktransform(d, inset);
                if (orient == 'fixed' && g.kind() == 'circular') xform += ' ' + g.metrictransform(d, true);
                if (rotate) xform += ` rotate(${rotate})`
                return `${xform}`;
            })
        }
        _.text(format);
    }
    labels.step = function(_) {
        return arguments.length ? (step = _, labels) : step;
    }
    labels.start = function(_) {
        return arguments.length ? (start = _, labels) : start;
    }
    labels.orient = function(_) {
        return arguments.length ? (orient = _, labels) : orient;
    }
    labels.upright = function(_) {
        return arguments.length ? (upright = _, labels) : upright;
    }
    labels.size = function(_) {
        return arguments.length ? (size = _, labels) : size;
    }
    labels.inset = function(_) {
        return arguments.length ? (inset = _, labels) : inset;
    }
    labels.rotate = function(_) {
        return arguments.length ? (rotate = _, labels) : rotate;
    }
    labels.format = function(_) {
        return arguments.length ? (format = _, labels) : format;
    }
    return stylable(labels).class('gauge-axis-labels');
}


gauge.indicator = {};

gauge.indicator.text = function() {
    var format = identity,
        size = 20;

    function text(sel, g) {
        const metric = g.metric();
        let _ = sel.append('text').attr('font-size', size);
        text.stylable(_);
        _ = _.text('');

        function update(metrics) {
            if (metric in metrics) {
                _.text(format(metrics[metric]));
            }
        }

        metricDispatch.on(appendId(`metric.indicator-text-${g.name}-`), update);

    }
    text.format = function(_) {
        return arguments.length ? (format = _, text) : format;
    }
    text.size = function(_) {
        return arguments.length ? (size = _, text) : size;
    }
    return stylable(text).class('gauge-indicator-text');
}

gauge.indicator.pointer = function(_) {
    var f, id, rescale = identity;

    if (typeof _ === 'function') {
        id = 'function';
        f = _;
    } else {
        id = _ in pointerShapes ? _ : 'needle';
        f = pointerShapes[id];
    }

    function pointer(sel, g) {
        const metric = g.metric();
        let _ = sel.append('g');
        pointer.stylable(_);
        f(_, g);

        function update(metrics) {
            if (metric in metrics) {
                _.transition().duration(500)
                    .attr('transform', g.metrictransform(rescale(metrics[metric])))
                    .ease(d3.easeElastic);
            }
        }
        metricDispatch.on(appendId(`metric.indicator-pointer-${id}-${g.name}`), update);
    }
    pointer.rescale = function(_) {
        return arguments.length ? (rescale = _, pointer) : rescale;
    }
    return stylable(pointer).class('gauge-indicator-pointer gauge-indicator-pointer-' + id);
}
