import * as d3 from 'd3';

import { stylable, appendable, transformable } from './mixin';
import { gaugeController } from './controller';
import { localHub } from './hub';
import { element, d3sel } from './common';
import { grid } from './grid';
import type { SelectorOrSelection, PanelComponent, D3Selection, TransitionFunction } from './types';


// global defs we append to panel's svg element
const globalDefs = (width: number, height: number) => [
    element('radialGradient', {
        id: 'highlightGradient',
        cx: '50%', cy: '50%',
        fx: '25%', fy: '40%',
        r: '50%',
    }).append(
        ...['white', 'black'].map(
            d => element('stop', {'stop-color': d, offset: d == 'white' ? '0%' : '100%'})
        )
    ),
    ...[1, 2, 3].map(d =>
        element('filter', {
            id: 'dropShadow' + d,
            // need userSpaceOnUse for drop-shadow to work on 0-width items
            // but then need explicit extent in target units?
            filterUnits: 'userSpaceOnUse',
            x: -width, width: 2 * width,
            y: -height, height: 2 * height,
        }).append(element('feDropShadow', {stdDeviation: d, dx: 0, dy: 0}))
    ),
    ...[1, 2, 3].map(d =>
        element('filter', {
            id: 'gaussianBlur' + d,
        }).append(element('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: d}))
    ),
];


function absoluteURL(u: string | URL): URL {
    const base = typeof document !== 'undefined' && document.location ? document.location.href : 'http://localhost';
    return new URL(u.toString(), base);
}


export function panel(): PanelComponent {
    let width = 1024,
        height = 768,
        interval = 250,
        showgrid = false,
        smooth = true,
        url: URL | undefined,
        inputUrl: URL | undefined;

    const panelFn: PanelComponent = stylable<PanelComponent>(appendable(transformable(Object.assign(
        function(sel: SelectorOrSelection) {
            const s = d3sel(sel);
            // draw and start updating panel
            const controller = gaugeController(),  // establish context for gauges
                transition: TransitionFunction = smooth ?
                    ((selection: D3Selection) => selection.transition().duration(interval || 250).ease(d3.easeLinear)) :
                    ((selection: D3Selection) => selection),
                svg = s.append('svg')
                    .attr('width', width).attr('height', height),
                defs = svg.append('defs');

            // insert the global defs now that we know the panel size
            globalDefs(width, height).forEach(d => d(defs));

            const _ = svg.append('g');
            panelFn.stylable(_);
            panelFn.transformable(_);
            panelFn.appendable(_);

            if (showgrid) grid().width(width).height(height)(_);

            const keys = controller.indicators();
            console.log('Starting panel expecting metrics for:', keys);

            if (!url) {
                // local hub: draw its starting snapshot, apply actions immediately, and tick each interval
                const hub = localHub(controller.fakes());
                controller.sink(actions => controller(hub.apply(actions), transition));
                controller(hub.snapshot());
                setInterval(() => controller(hub.tick(), transition), interval || 250);
                return;
            }

            if (inputUrl) {
                // send each batch of actions in order, one request at a time
                let pending: Promise<unknown> = Promise.resolve();
                controller.sink(actions => {
                    pending = pending
                        .then(() => fetch(inputUrl!, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ actions }),
                        }))
                        .then(response => {
                            if (response && response.ok === false) console.log('g3: hub rejected actions', response.status, actions);
                        })
                        .catch(err => console.log('g3: failed to send actions', err, actions));
                });
            }

            if (interval) {
                // with non-zero interval, poll the hub for changes since the latest response
                let latest = 0;
                setInterval(() => {
                    url!.search = new URLSearchParams({
                        latest: String(latest),
                        units: String(latest == 0),
                        keys: keys.join(','),
                    }).toString();
                    fetch(url!)
                        .then(response => response.json())
                        .then(data => {
                            controller(data, transition);
                            latest = data.latest ?? 0;
                        })
                        .catch(err => {
                            // ask for a full snapshot once we reconnect
                            console.log('g3: failed to poll metrics', err);
                            latest = 0;
                        });
                }, interval);
            } else {
                // set interval to 0 to subscribe to a server-sent event stream
                url.search = new URLSearchParams({ keys: keys.join(',') }).toString();
                const source = new EventSource(url);
                source.onmessage = function(e: MessageEvent) {
                    controller(JSON.parse(e.data), transition);
                };
            }
        },
        {
            width(_?: number): any {
                return arguments.length ? (width = _!, panelFn) : width;
            },
            height(_?: number): any {
                return arguments.length ? (height = _!, panelFn) : height;
            },
            grid(_?: boolean): any {
                return arguments.length ? (showgrid = !!_, panelFn) : showgrid;
            },
            url(_?: string | URL): any {
                return arguments.length ? (url = absoluteURL(_!), panelFn) : url;
            },
            inputUrl(_?: string | URL): any {
                return arguments.length ? (inputUrl = absoluteURL(_!), panelFn) : inputUrl;
            },
            interval(_?: number): any {
                return arguments.length ? (interval = _!, panelFn) : interval;
            },
            smooth(_?: boolean): any {
                return arguments.length ? (smooth = _!, panelFn) : smooth;
            },
        }
    )))).class('g3-panel');

    return panelFn;
}
