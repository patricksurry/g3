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


function stylable(f) {
    var kls = [];

    f.css = function(_) {
        return arguments.length ? (kls.push(css(_)), f) : kls.join(' ');
    }
    f.class = function(_) {
        return arguments.length ? (kls = kls.concat(_.split(' ')), f) : kls.join(' ');
    }
    return f;
}


function transformable(f) {
    var x=0, y=0, scalex=1, scaley=1, rotate=0;

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

    f.transform = function() {
        return `translate(${x}, ${y}) scale(${scalex}, ${scaley}) rotate(${rotate})`;
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
        r = 100,
        layers = [],
        anchor;

    function gauge(selection) {
        let _ = selection.append('g')
            .attr('class', gauge.class());
        _.append('g')
            .attr('class', 'gauge-layers')
            .attr('transform', gauge.transform())
            .selectAll('.gauge-layer')
            .data(layers)
          .enter().each(function(d) { d3.select(this).call(d, gauge); });

        if (autoindicate) {
            function update(metrics) {
                if (metric in metrics) {
                    _.transition().duration(500)
                        .attr('transform', gauge.metrictransform(metrics[metric], true))
                        .ease(d3.easeElastic);
                }
            }

            metricDispatch.on(appendId('metric.autoindicate-' + name), update);
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
    gauge.r = function(_) {
        return arguments.length ? (r = _, gauge) : r;
    }
    gauge.measure = function(_) {
        return arguments.length ? (measure = _, gauge) : measure;
    }
    gauge.layers = function(_) {
        return arguments.length ? (layers = Array.from(arguments), gauge) : layers;
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
    registry[name] = gauge;

    return stylable(transformable(gauge)).class('gauge gauge-' + name);
}


gauge.face = function () {
    var r = 100,
        window;
    function face(sel, g) {
        var maskId;
        if (typeof window === 'function') {
            maskId = appendId('gauge-face-window');
            let _ = sel.append('mask').attr('id', maskId);
            _.append('circle').attr('r', r).style('fill', 'white');
            window.css('fill: black !important')(_, g);
        }
        let _ = sel.append('circle')
            .attr('class', face.class())
            .attr('r', r);
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
        sel
            .append('path')
            .attr('class', line.class())
            .attr('d', g.sectorpath(...g.measure().domain()));
    }
    return stylable(line).class('gauge-axis');
}

gauge.axis.sector = function(_) {
    var vs = _.slice(),
        size = 5,
        inset = 0;
    function sector(sel, g) {
        sel
            .append('path')
            .attr('class', sector.class())
            .attr('d', g.sectorpath(...vs, size, inset));
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
    var values = vs;
    if (typeof values === 'undefined') {
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
    }
    return values;
}


gauge.axis.ticks = function(vs) {
    var mark = 'tick',
        size = 10,
        width = 1,
        inset = 0,
        values = vs && vs.slice(),
        step, start;
    function ticks(sel, g) {
        let vs = tickvals(values, step, start, g);
        let _ = sel
            .append('g')
            .attr('class', ticks.class())
            .selectAll('.gauge-axis-' + mark)
            .data(vs)
          .enter().append('g')
            .attr('class', 'gauge-axis-' + mark)
            .attr('transform', d => g.marktransform(d, inset));

        switch(mark) {
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
    ticks.mark = function(_) {
        return arguments.length ? (mark = _, ticks) : mark;
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
    var orient = 'fixed',  // 'relative', 'circular'
        upright = true,
        scale = 1,
        inset = 25,
        rotate = 0,
        format = identity,
        values = vs && vs.slice(),
        step, start;
    function labels(sel, g) {
        let vs = tickvals(values, step, start, g);
        let _ = sel
            .append('g')
            .attr('class', labels.class())
            .selectAll('.gauge-axis-label')
            .data(vs)
          .enter().append('text')
            .attr('class', 'gauge-axis-label')
//TODO upright
//TODO circular
            .attr('transform', d => {
                let xform = g.marktransform(d, inset);
                if (orient == 'fixed' && g.kind() == 'circular') xform += ' ' + g.metrictransform(d, true);
                if (rotate) xform += ` rotate(${rotate})`
                return `${xform} scale(${scale})`;
            })
            .text(format);
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
    labels.scale = function(_) {
        return arguments.length ? (scale = _, labels) : scale;
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
    var format = identity;

    function text(sel, g) {
        const metric = g.metric();
        let _ = sel.append('text')
            .attr('transform', text.transform())
            .attr('class', text.class())
            .text('');

        function update(metrics) {
            if (metric in metrics) {
                _.text(format(metrics[metric]));
            }
        }

        metricDispatch.on(appendId('metric.indicator-text-' + g.name), update);

    }
    text.format = function(_) {
        return arguments.length ? (format = _, text) : format;
    }
    return stylable(transformable(text)).class('gauge-indicator-text');
}


gauge.indicator.pointer = function(_) {
    var kind = _ ?? 'needle',
        rescale = identity;

    function pointer(sel, g) {
        const metric = g.metric();
        let _ = sel.append('g')
            .attr('class', pointer.class());

        pointerShapes[kind](_);

        function update(metrics) {
            if (metric in metrics) {
                _.transition().duration(500)
                    .attr('transform', g.metrictransform(rescale(metrics[metric])))
                    .ease(d3.easeElastic);
            }
        }
        metricDispatch.on(appendId(`metric.indicator-pointer-${kind}-${g.name}`), update);
    }
    pointer.rescale = function(_) {
        return arguments.length ? (rescale = _, pointer) : rescale;
    }
    return stylable(pointer).class('gauge-indicator-pointer gauge-indicator-pointer-' + kind);
}
