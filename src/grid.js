import * as d3 from 'd3';

import {stylable} from "./mixin.js";

const eps = 1e-6;

export function grid() {
    var x0 = 0, y0 = 0,
        width = 2000, height = 2000,
        xmajor=100, ymajor=100, xminor=10, yminor=10;

    function grid(sel) {
        var _ = sel.append('g').attr('class', 'g3-grid');
        grid.stylable(_);

        const xs = d3.range(x0, x0 + width + eps, xmajor),
              ys = d3.range(y0, y0 + height + eps, ymajor);

        _.selectAll(null)
            .data(d3.range(x0, x0 + width + eps, xminor).filter(x => !xs.includes(x)))
          .enter().append('line').attr('class', 'g3-grid-hairline')
            .attr('transform', x => 'translate(' + x + ',' + y0 + ')')
            .attr('y2', height);
        _.selectAll(null)
            .data(d3.range(y0, y0 + height + eps, yminor).filter(y => !ys.includes(y)))
          .enter().append('line').attr('class', 'g3-grid-hairline')
            .attr('transform', y => 'translate(' + x0 + ',' + y + ')')
            .attr('x2', width);

        var vlines = _.selectAll(null)
            .data(xs)
          .enter().append('g').attr('class', 'g3-grid-line')
            .attr('transform', x => 'translate(' + x + ',' + y0 + ')')
        var hlines = _.selectAll(null)
            .data(ys)
          .enter().append('g').attr('class', 'g3-grid-line')
            .attr('transform', y => 'translate(' + x0 + ',' + y + ')')

        vlines.append('line').attr('y2', height);
        hlines.append('line').attr('x2', width);

        vlines.selectAll(null)
            .data(ys.slice(0, -1))
          .enter().append('g').attr('class', 'g3-grid-label')
            .attr('transform', y => 'translate(0,' + (y - y0 + ymajor/2) + ') rotate(-90) ');
        hlines.selectAll(null)
            .data(xs.slice(0, -1))
          .enter().append('g').attr('class', 'g3-grid-label')
            .attr('transform', x => 'translate(' + (x - x0 + xmajor/2) + ', 0)');

        var labels = d3.selectAll('.g3-grid-label');
        labels.append('rect').attr('x', -12).attr('width', 24).attr('y', -4).attr('height', 8).attr('rx', 4);
        labels.append('text').text(function(){ return d3.select(this.parentNode.parentNode).datum()});
    }

    grid.x = function(_) {
        return arguments.length ? (x0 = _, grid) : x0;
    }
    grid.y = function(_) {
        return arguments.length ? (y0 = _, grid) : y0;
    }
    grid.width = function(_) {
        return arguments.length ? (width = _, grid) : width;
    }
    grid.height = function(_) {
        return arguments.length ? (height = _, grid) : height;
    }
    grid.xmajor = function(_) {
        return arguments.length ? (xmajor = _, grid) : xmajor;
    }
    grid.ymajor = function(_) {
        return arguments.length ? (ymajor = _, grid) : ymajor;
    }
    grid.xminor = function(_) {
        return arguments.length ? (xminor = _, grid) : xminor;
    }
    grid.yminor = function(_) {
        return arguments.length ? (yminor = _, grid) : yminor;
    }

    return stylable(grid);
}
