import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3';
import { sphereBall, sphereRegion, sphereTransform } from '../src/sphere';

const fraction = (g: d3.GeoPermissibleObjects) => d3.geoArea(g) / (4 * Math.PI);

describe('sphere geometry', () => {
    it('regions enclose the band between their latitudes, not its complement', () => {
        // the band from 20S to 10N covers (sin 10° + sin 20°) / 2 of the sphere
        const expected = (Math.sin(10 * Math.PI / 180) + Math.sin(20 * Math.PI / 180)) / 2;
        expect(fraction(sphereRegion(0, 360, -20, 10))).toBeCloseTo(expected, 4);
        expect(fraction(sphereRegion(360, 0, 10, -20))).toBeCloseTo(expected, 4);
        expect(fraction(sphereRegion(0, 40, -20, 10))).toBeCloseTo(expected * 40 / 360, 4);
    });

    it('hemispheres land on the right side', () => {
        const north = sphereRegion(0, 360, 0, 90), south = sphereRegion(0, 360, -90, 0);
        expect(d3.geoContains(north, [10, 45])).toBe(true);
        expect(d3.geoContains(north, [10, -45])).toBe(false);
        expect(d3.geoContains(south, [10, -45])).toBe(true);
    });

    it('lines enclose no area', () => {
        expect(fraction(sphereRegion(0, 360, 0, 0))).toBe(0);
        expect(fraction(sphereRegion(30, 30, -10, 10))).toBe(0);
    });

    it('places marks tangent to the ball and hides the far side', () => {
        const ball = sphereBall(100);
        // at the centre of the view the frame is the identity
        expect(sphereTransform(ball, 0, 0)).toBe('matrix(1,0,0,1,0,0)');
        // 60° east, the mark is foreshortened horizontally by cos 60°
        const m = sphereTransform(ball, 60, 0).match(/matrix\(([^)]+)\)/)![1].split(',').map(Number);
        expect(m[0]).toBeCloseTo(0.5, 2);
        expect(m[3]).toBeCloseTo(1, 2);
        expect(m[4]).toBeCloseTo(100 * Math.sin(Math.PI / 3), 1);
        expect(sphereTransform(ball, 120, 0)).toBe('scale(0)');
        // the northward frame turns x to point up the screen
        expect(sphereTransform(ball, 0, 0, true)).toBe('matrix(0,-1,1,0,0,0)');
    });
});

describe('spherical gauges', () => {
    let svg: d3.Selection<any, any, any, any>;

    beforeEach(() => {
        document.body.innerHTML = '<svg width="500" height="500"><defs></defs></svg>';
        svg = d3.select('svg');
    });

    const labelX = (text: string) => {
        const node = svg.selectAll<SVGTextElement, unknown>('text').filter(function() { return this.textContent == text; });
        const xform = node.attr('transform');
        return xform == 'scale(0)' ? undefined : Number(xform.match(/matrix\(([^)]+)\)/)![1].split(',')[4]);
    };

    it('autoindicate turns the ball so the current value faces the viewer', () => {
        const controller = g3.gaugeController();
        g3.gauge()
            .kind('longitude').metric('heading')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(g3.axisLabels([0, 90, 180]).inset(0).format(String))(svg);

        controller({ metrics: { heading: 0 } });
        expect(labelX('0')).toBeCloseTo(0, 3);
        expect(labelX('180')).toBeUndefined();

        controller({ metrics: { heading: 60 } });
        expect(labelX('0')).toBeCloseTo(-100 * Math.sin(Math.PI / 3), 1);   // north has turned left
        expect(labelX('90')).toBeCloseTo(100 * Math.sin(Math.PI / 6), 1);
        expect(labelX('180')).toBeUndefined();
    });

    it('nested spherical gauges share one ball, composing their rotations', () => {
        const controller = g3.gaugeController();
        g3.gauge()
            .kind('longitude').metric('heading')
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)
            .append(
                g3.axisLabels([0]).inset(0).format(() => 'H'),
                g3.gauge()
                    .kind('latitude').metric('pitch')
                    .measure(d3.scaleLinear().domain([-90, 90]).range([-90, 90]))
                    .autoindicate(true)
                    .append(g3.axisLabels([30]).inset(0).format(() => 'P')),
            )(svg);

        controller({ metrics: { heading: 0, pitch: 30 } });
        // pitching up 30° brings the 30° latitude mark to the centre and drops the horizon below it
        const p = svg.selectAll('text').filter(function() { return (this as Element).textContent == 'P'; }).attr('transform');
        expect(p).toMatch(/,0,0\)$/);
        const h = svg.selectAll('text').filter(function() { return (this as Element).textContent == 'H'; }).attr('transform');
        expect(Number(h.match(/,([-\d.]+)\)$/)![1])).toBeCloseTo(100 * Math.sin(Math.PI / 6), 1);
    });
});
