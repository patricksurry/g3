import * as d3 from 'd3';

import { stylable, appendable, transformable } from './mixin';
import { gaugeController } from './controller';
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


export function panel(): PanelComponent {
    let width = 1024,
        height = 768,
        interval = 250,
        showgrid = false,
        smooth = true,
        url: URL | undefined;

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

            console.log('Starting panel expecting metrics for:', controller.indicators());

            if (!url) {
                // fake metrics
                setInterval(() => {
                    controller(controller.fakeMetrics(), transition);
                }, interval || 250);
            } else if (interval) {
                // with non-zero interval, poll an endpoint
                let latest = 0;
                setInterval(() => {
                    const params: Record<string, string> = {
                        latest: String(latest),
                        units: String(latest == 0),
                    };
                    // add the matched metrics once we've determined them
                    if (latest) {
                        const mapped = controller.mappedMetrics();
                        if (mapped) params.metrics = mapped.join(',');
                    }
                    url!.search = new URLSearchParams(params).toString();
                    fetch(url!)
                        .then(response => response.json())
                        .then(data => {
                            controller(data, transition);
                            latest = data.latest;
                        });
                }, interval);
            } else {
                // set interval to 0 or None to use server-sent event endpoint
                url.search = new URLSearchParams({
                    // server should determine best match metrics
                    indicators: controller.indicators().join(','),
                }).toString();
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
                const base = typeof document !== 'undefined' && document.location ? document.location.href : 'http://localhost';
                return arguments.length ? (url = new URL(_!.toString(), base), panelFn) : url;
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
