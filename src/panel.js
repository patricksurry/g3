import {stylable, appendable, element, gaugeController} from './protocol.js';


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
        interval=250,
        url='/metrics/fake.json';

    function panel(sel) {
        // draw and start updating panel
        let controller = gaugeController(interval),  // establish context for gauges
            _ = sel.append('svg')
                .attr('width', width).attr('height', height);
        panel.stylable(_);
        _.append('defs');
        panel.appendable(_);

        console.log('Starting panel expecting metrics:', controller.metrics());

        setInterval(() => {
            fetch(url)
              .then(response => response.json())
              .then(metrics => controller(jsondates(metrics)));
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
    panel.url = function(_) {
        return arguments.length ? (url = _, panel): url;
    }
    panel.interval = function(_) {
        return arguments.length ? (interval = _, panel): interval;
    }
    stylable(appendable(panel)).class('gauge-panel')

    // add global defs here
    panel.append(
        ...[1,2,3].map(d =>
            element('filter', {
                id: 'dropShadow' + d,
                // need userSpaceOnUse for drop-shadow to work on 0-width items
                // but then need explicit extent in target units?
                filterUnits: 'userSpaceOnUse',
                x: -width, width: 2*width,
                y: -height, height: 2*height,
            }).append(element('feDropShadow', {stdDeviation: d, dx: 0, dy: 0}))
        )
    );
    return panel;
}
