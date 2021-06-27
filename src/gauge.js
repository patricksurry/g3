import * as d3 from 'd3';

import {
    stylable, transformable, appendable,
    element, put,
    metricDispatch, appendId
} from './protocol.js';
export { metricDispatch } from './protocol.js';
import { axis } from './axis.js';
import { indicator } from './indicator.js';

import './gauge.css';
import 'dseg/css/dseg.css';


export var registry = {};

//TODO
window.registry = registry;
window.d3 = d3;


const DEG2RAD = Math.PI/180;


export function gauge(_name) {
    if (_name in registry) return registry[_name];

    var name = _name,
        metric,
        unit,
        measure = d3.scaleLinear(),
        kind = 'circular',
        autoindicate = false,
        r = 100,  // the axis radius, when applicable
        clip;

    function gauge(selection) {
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

    return stylable(appendable(gauge)).class('gauge gauge-' + name);
}


gauge.element = element;

gauge.put = put;

gauge.axis = axis;

gauge.indicator = indicator;

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

gauge.panel = function() {
    var width=1024, height=768;
    function panel(sel) {
        let _ = sel.append('svg')
            .attr('width', width).attr('height', height);
        _.append('defs')
        panel.stylable(_);
        panel.appendable(_);
    }
    panel.width = function(_) {
        return arguments.length ? (width = _, panel): width;
    }
    panel.height = function(_) {
        return arguments.length ? (height = _, panel): height;
    }
    stylable(appendable(panel)).class('gauge-panel')
    panel.append(
        ...[1,2,3].map(d =>
            gauge.element('filter', {
                id: 'dropShadow' + d,
                // need userSpaceOnUse for drop-shadow to work on 0-width items
                // but then need explicit extent in target units?
                filterUnits: 'userSpaceOnUse',
                x: -width, width: 2*width,
                y: -height, height: 2*height,
            }).append(gauge.element('feDropShadow', {stdDeviation: d, dx: 0, dy: 0}))
        )
    );
    return panel;
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



