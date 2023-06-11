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


export function panel() {
    var width = 1024,
        height = 768,
        interval = 250,
        showgrid = false,
        smooth = true,
        url;

    function panel(sel) {
        if (typeof sel === 'string') sel = d3.select(sel);
        // draw and start updating panel
        let controller = gaugeController(),  // establish context for gauges
            transition = smooth ?
                (sel => sel.transition().duration(interval || 250).ease(d3.easeLinear)) :
                (sel => sel),
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

        if (!url) {
            // fake metrics
            setInterval(() => {
                controller(controller.fakeMetrics(), transition);
            }, interval || 250);
        } else if (interval) {
            // with non-zero interval, poll an endpoint
            let latest=0;
            setInterval(() => {
                let params = {
                    latest: latest,
                    units: latest == 0,
                };
                // add the matched metrics once we've determined them
                if (latest) params.metrics = controller.mappedMetrics();
                url.search = new URLSearchParams(params).toString();
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        controller(data, transition);
                        latest = data.latest;
                    });
            }, interval);
        } else {
            // set interval to 0 or None to use server-sent event endpoint
            let source = new EventSource(url);
            url.search = new URLSearchParams({
                // server should determine best match metrics
                indicators: controller.indicators()
            }).toString();
            source.onmessage = function(e) {
                controller(JSON.parse(e.data), transition);
            };
        }
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
        return arguments.length ? (url = new URL(_, document.location), panel): url;
    }
    panel.interval = function(_) {
        return arguments.length ? (interval = _, panel): interval;
    }
    panel.smooth = function(_) {
        return arguments.length ? (smooth = _, panel): smooth;
    }
    stylable(appendable(transformable(panel))).class('g3-panel')
    panel.defs = element('defs')
    panel.append(panel.defs);

    return panel;
}
