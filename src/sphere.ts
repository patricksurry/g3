/*
Geometry for ball gauges ('ball.yaw' and 'ball.pitch' kinds).

A ball gauge draws onto a ball seen in orthographic projection.
Nested ball gauges share one ball, so a yaw gauge for heading containing a pitch gauge
rotates a single ball by both metrics.  Marks on a yaw gauge are placed by longitude
along the equator, and marks on a pitch gauge by latitude along the prime meridian. Marks are re-projected whenever the ball rotates.

Insets and sizes are SVG units measured along the surface at the centre of the ball,
so a tick or label keeps the size it would have on a flat gauge until it nears the limb.
*/
import * as d3 from 'd3';
import type { SphereBall } from './types';

const DEG = Math.PI / 180;


export function sphereBall(r: number): SphereBall {
    const ball: SphereBall = {
        proj: d3.geoOrthographic().scale(r).translate([0, 0]).clipAngle(90).precision(0.3),
        rotation: [0, 0, 0],
        redraws: [],
        redraw() {
            ball.proj.rotate(ball.rotation);
            ball.redraws.forEach(fn => fn());
        },
    };
    return ball;
}


/** convert a distance along the surface (SVG units) to degrees of arc */
export const arcDegrees = (ball: SphereBall, d: number): number => d / ball.proj.scale() / DEG;


const fmt = (x: number) => +x.toFixed(3);

/**
 * An SVG transform placing a mark tangent to the ball at [lon, lat], using the local Jacobian of the projection,
 * so marks squash and skew as they turn away from the viewer, and vanish on the far side.
 * The local x axis points east and y points south; when `northward` is set,
 * x points north and y east instead, matching a linear gauge rotated by -90.
 */
export function sphereTransform(ball: SphereBall, lon: number, lat: number, northward = false): string {
    const proj = ball.proj,
        centre = proj.invert!([0, 0])!;
    if (d3.geoDistance([lon, lat], centre) >= Math.PI / 2) return 'scale(0)';

    const d = 0.5,
        k = proj.scale() * d * DEG,
        c = Math.max(Math.cos(lat * DEG), 1e-3),
        p = proj([lon, lat])!,
        pe = proj([lon + d, lat])!,
        pn = proj([lon, lat + d])!,
        east = [(pe[0] - p[0]) / (k * c), (pe[1] - p[1]) / (k * c)],
        south = [-(pn[0] - p[0]) / k, -(pn[1] - p[1]) / k],
        [x, y] = northward ? [[-south[0], -south[1]], east] : [east, south];
    return `matrix(${[x[0], x[1], y[0], y[1], p[0], p[1]].map(fmt).join(',')})`;
}


function edge(lon0: number, lon1: number, lat0: number, lat1: number): [number, number][] {
    const n = Math.max(2, Math.ceil(Math.max(Math.abs(lon1 - lon0), Math.abs(lat1 - lat0)) / 2));
    return d3.range(n + 1).map(i => [lon0 + (lon1 - lon0) * i / n, lat0 + (lat1 - lat0) * i / n]);
}

// a line traced out and back along itself, so that like a flat axis line it encloses no area to fill
const outAndBack = (line: [number, number][]): d3.GeoPermissibleObjects =>
    ({ type: 'LineString', coordinates: [...line, ...line.slice(0, -1).reverse()] });

/**
 * GeoJSON for the region between longitudes [lon0, lon1] and latitudes [south, north].
 * A zero-height (or zero-width) region becomes the line along its edge.
 * d3 treats a ring as enclosing the area to its right, so the north edge runs west to east;
 * a full circle of longitude uses two rings, which avoids a seam.
 */
export function sphereRegion(lon0: number, lon1: number, south: number, north: number): d3.GeoPermissibleObjects {
    const [w, e] = lon0 <= lon1 ? [lon0, lon1] : [lon1, lon0],
        [s, n] = south <= north ? [south, north] : [north, south],
        full = e - w >= 360;
    if (s == n) return outAndBack(edge(w, full ? w + 360 : e, n, n));
    if (w == e) return outAndBack(edge(w, w, n, s));
    if (full) return { type: 'Polygon', coordinates: [edge(w, w + 360, n, n), edge(w + 360, w, s, s)] };
    return {
        type: 'Polygon',
        coordinates: [[...edge(w, e, n, n), ...edge(e, e, n, s).slice(1), ...edge(e, w, s, s).slice(1), ...edge(w, w, s, n).slice(1)]],
    };
}
