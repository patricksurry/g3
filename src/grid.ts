import * as d3 from 'd3';

import { d3sel } from './common';
import { stylable } from './mixin';
import type { SelectorOrSelection, GridComponent } from './types';

const eps = 1e-6;

export function grid(): GridComponent {
    let x0 = 0, y0 = 0,
        width = 2000, height = 2000,
        xmajor = 100, ymajor = 100, xminor = 10, yminor = 10;

    const gridFn: GridComponent = stylable<GridComponent>(Object.assign(
        function(sel: SelectorOrSelection) {
            const _ = d3sel(sel).append('g').attr('class', 'g3-grid');
            gridFn.stylable(_);

            const xs = d3.range(x0, x0 + width + eps, xmajor),
                  ys = d3.range(y0, y0 + height + eps, ymajor);

            _.selectAll(null)
                .data(d3.range(x0, x0 + width + eps, xminor).filter(x => !xs.includes(x)))
              .enter().append('line').attr('class', 'g3-grid-hairline')
                .attr('transform', (x: number) => 'translate(' + x + ',' + y0 + ')')
                .attr('y2', height);
            _.selectAll(null)
                .data(d3.range(y0, y0 + height + eps, yminor).filter(y => !ys.includes(y)))
              .enter().append('line').attr('class', 'g3-grid-hairline')
                .attr('transform', (y: number) => 'translate(' + x0 + ',' + y + ')')
                .attr('x2', width);

            const vlines = _.selectAll(null)
                .data(xs)
              .enter().append('g').attr('class', 'g3-grid-line')
                .attr('transform', (x: number) => 'translate(' + x + ',' + y0 + ')');
            const hlines = _.selectAll(null)
                .data(ys)
              .enter().append('g').attr('class', 'g3-grid-line')
                .attr('transform', (y: number) => 'translate(' + x0 + ',' + y + ')');

            vlines.append('line').attr('y2', height);
            hlines.append('line').attr('x2', width);

            vlines.selectAll(null)
                .data(ys.slice(0, -1))
              .enter().append('g').attr('class', 'g3-grid-label')
                .attr('transform', (y: number) => 'translate(0,' + (y - y0 + ymajor/2) + ') rotate(-90) ');
            hlines.selectAll(null)
                .data(xs.slice(0, -1))
              .enter().append('g').attr('class', 'g3-grid-label')
                .attr('transform', (x: number) => 'translate(' + (x - x0 + xmajor/2) + ', 0)');

            const labels = _.selectAll('.g3-grid-label');
            labels.append('rect').attr('x', -12).attr('width', 24).attr('y', -4).attr('height', 8).attr('rx', 4);
            labels.append('text').text(function(this: SVGTextElement) {
                return String(d3.select(this.parentNode!.parentNode as Element).datum());
            });
        },
        {
            x(_?: number): any {
                return arguments.length ? (x0 = _!, gridFn) : x0;
            },
            y(_?: number): any {
                return arguments.length ? (y0 = _!, gridFn) : y0;
            },
            width(_?: number): any {
                return arguments.length ? (width = _!, gridFn) : width;
            },
            height(_?: number): any {
                return arguments.length ? (height = _!, gridFn) : height;
            },
            xmajor(_?: number): any {
                return arguments.length ? (xmajor = _!, gridFn) : xmajor;
            },
            ymajor(_?: number): any {
                return arguments.length ? (ymajor = _!, gridFn) : ymajor;
            },
            xminor(_?: number): any {
                return arguments.length ? (xminor = _!, gridFn) : xminor;
            },
            yminor(_?: number): any {
                return arguments.length ? (yminor = _!, gridFn) : yminor;
            },
        }
    ));

    return gridFn;
}
