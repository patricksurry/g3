import * as d3 from 'd3';

import {stylable, appendable, transformable} from './mixin.js';
import {gaugeController} from './controller.js';
import {element} from './common.js';
import {grid} from './grid.js';


// global defs we append to panel's svg element
const globalDefs = (width, height) => [
    element('radialGradient', {
        id: 'highlightGradient',
        cx: '50%', cy: '50%',
        fx: '25%', fy: '40%',
        r: '50%',
    }).append(
        ...['white', 'black'].map(
            d => element('stop', {'stop-color': d, offset: d == 'white' ? '0%': '100%'})
        )
    ),
    ...[1, 2, 3].map(d =>
        element('filter', {
            id: 'dropShadow' + d,
            // need userSpaceOnUse for drop-shadow to work on 0-width items
            // but then need explicit extent in target units?
            filterUnits: 'userSpaceOnUse',
            x: -width, width: 2*width,
            y: -height, height: 2*height,
        }).append(element('feDropShadow', {stdDeviation: d, dx: 0, dy: 0}))
    ),
    ...[1, 2, 3].map(d =>
        element('filter', {
            id: 'gaussianBlur' + d,
        }).append(element('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: d}))
    ),
];


// helper function to convert string-serialized date metrics back to JS objects
function jsondates(obj) {
    return Object.fromEntries(Object.entries(obj).map(
        ([k,v]) => {
            if (typeof v === 'string' && v.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)) {
                v = new Date(v);
            }
            return [k, v];
        }
    ))
}



export function panel() {
    var width=1024,
        height=768,
        interval=100,
        showgrid=false,
        url;

    function panel(sel) {
        if (typeof sel === 'string') sel = d3.select(sel);
        // draw and start updating panel
        let controller = gaugeController(interval),  // establish context for gauges
            _ = sel.append('svg')
                .attr('width', width).attr('height', height);

        // insert the global defs now that we know the panel size
        panel.defs.append(...globalDefs(width, height));

        _ = _.append('g');
        panel.stylable(_);
        panel.transformable(_);
        panel.appendable(_);

        if (showgrid) grid().width(width).height(height)(_);

        console.log('Starting panel expecting metrics for:', controller.indicators());

        setInterval(() => {
                if (url) {
                    fetch(url)
                      .then(response => response.json())
                      .then(metrics => controller(jsondates(metrics)));
                } else {
                    controller(controller.fakeMetrics());
                }
            },
            interval
        );
    }
    panel.width = function(_) {
        return arguments.length ? (width = _, panel): width;
    }
    panel.height = function(_) {
        return arguments.length ? (height = _, panel): height;
    }
    panel.grid = function(_) {
        return arguments.length ? (showgrid = !!_, panel): showgrid;
    }
    panel.url = function(_) {
        return arguments.length ? (url = _, panel): url;
    }
    panel.interval = function(_) {
        return arguments.length ? (interval = _, panel): interval;
    }
    stylable(appendable(transformable(panel))).class('g3-panel')
    panel.defs = element('defs')
    panel.append(panel.defs);

    return panel;
}
