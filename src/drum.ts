/*
Geometry for drum gauges: a cylinder spinning about its vertical axis, seen side on.

The measure maps metric values to degrees around the drum, with zero facing the viewer
and increasing to the right.  Insets and sizes run down the drum's axis in plain SVG units,
so marks foreshorten horizontally as they turn away, but never bend.
For a horizontal drum, rotate the gauge by 90°, just as you would orient a linear gauge.
*/
import type { Drum } from './types';

const DEG = Math.PI / 180;

const fmt = (x: number) => +x.toFixed(3);


export function drumSurface(r: number): Drum {
    const drum: Drum = {
        r,
        rotation: [0],
        redraws: [],
        redraw() {
            drum.redraws.forEach(fn => fn());
        },
    };
    return drum;
}


/** angle around the drum relative to the viewer, in (-180, 180] */
const facing = (drum: Drum, a: number) => {
    const d = ((a + drum.rotation[0]) % 360 + 360) % 360;
    return d > 180 ? d - 360 : d;
};


/**
 * An SVG transform placing a mark on the drum surface at angle `a`, `y` units down its axis,
 * squashed horizontally by its angle to the viewer, and hidden on the far side.
 */
export function drumTransform(drum: Drum, a: number, y: number): string {
    const t = facing(drum, a) * DEG,
        c = Math.cos(t);
    if (c < 1e-9) return 'scale(0)';     // edge on, or behind
    return `matrix(${[c, 0, 0, 1, drum.r * Math.sin(t), y].map(fmt).join(',')})`;
}


/**
 * SVG path for the visible part of the band between angles [a0, a1] and heights [y0, y1].
 * A zero-height band becomes a line.  The band can wrap, so its front half may come in two pieces.
 */
export function drumPath(drum: Drum, a0: number, a1: number, y0: number, y1: number): string {
    const [lo, hi] = a0 <= a1 ? [a0, a1] : [a1, a0],
        span = Math.min(hi - lo, 360),
        // a full turn always covers the whole front half, in one piece
        start = span >= 360 ? -90 : facing(drum, lo),
        pieces: string[] = [];
    // the band covers [start, start + span] relative to the viewer, which may overlap the front half twice
    for (const k of [-360, 0, 360]) {
        const s = Math.max(start + k, -90), e = Math.min(start + k + span, 90);
        if (s >= e) continue;
        const x0 = fmt(drum.r * Math.sin(s * DEG)), x1 = fmt(drum.r * Math.sin(e * DEG));
        pieces.push(y0 == y1
            ? `M ${x0},${fmt(y0)} L ${x1},${fmt(y0)}`
            : `M ${x0},${fmt(y0)} L ${x1},${fmt(y0)} L ${x1},${fmt(y1)} L ${x0},${fmt(y1)} Z`);
    }
    return pieces.join(' ');
}
