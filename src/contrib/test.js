import * as g3 from '../g3.js';


// Simple gauge with no pointer which is useful in panel layout alignment
export function alignment() {
    return g3.gauge().append(
        g3.gaugeFace().style('fill: #333'),
        g3.element('line', {x1: -100, x2: 100}).style('stroke: #8f8'),
        g3.element('line', {y1: -100, y2: 100}).style('stroke: #8f8'),
        g3.axisLine().style('stroke: #ff8'),
    )
}


