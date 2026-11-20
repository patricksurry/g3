// Helpers for gauge measure scales (not part of the public g3 namespace)
import type { GaugeKind } from './types';

/**
 * First and last values of a scale's domain or range.
 * Scales can be piecewise with more than two points, e.g.
 * d3.scaleLinear().domain([-25, -5, 0, 25]).range([263, 212, 201, 144]),
 * so the extremes are the ends, not the first two values.
 */
export function ends<T>(vs: T[]): [T, T] {
    return [vs[0], vs[vs.length - 1]];
}

/** Whether a circular gauge's range covers a whole number of full turns, so values wrap around. */
export function isFullCircle(kind: GaugeKind, range: number[]): boolean {
    const [r0, r1] = ends(range);
    return kind == 'circular' && r0 !== r1 && (r0 - r1) % 360 == 0;
}
