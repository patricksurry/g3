import * as g3 from '../g3';
import type { GaugeComponent } from '../types';


/**
 * Simple alignment reference gauge with crosshairs and outer circle, useful for panel layout positioning.
 */
export function alignment(): GaugeComponent {
    return g3.gauge().append(
        g3.gaugeFace().style('fill: #333'),
        g3.element('line', {x1: -100, x2: 100}).style('stroke: #8f8'),
        g3.element('line', {y1: -100, y2: 100}).style('stroke: #8f8'),
        g3.axisLine().style('stroke: #ff8'),
    );
}
