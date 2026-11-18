import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3';

describe('indicate components', () => {
    let svg: d3.Selection<any, any, any, any>,
        gauge: g3.GaugeComponent,
        controller: g3.GaugeController;

    beforeEach(() => {
        document.body.innerHTML = '<svg width="500" height="500"></svg>';
        svg = d3.select('svg');
        gauge = g3.gauge()
            .metric('test.metric')
            .measure(d3.scaleLinear().domain([0, 100]).range([0, 360]));
        controller = g3.gaugeController();
    });

    describe('g3.indicateText', () => {
        it('should update text on metric change', () => {
            const indicator = g3.indicateText().format((v: any) => `Value: ${v}`);
            svg.call(indicator, gauge);

            controller({ metrics: { 'test.metric': 50 } });

            const text = svg.select('text.g3-indicate-text');
            expect(text.text()).toBe('Value: 50');
        });

        it('should allow setting the font size', () => {
            const indicator = g3.indicateText().size(30);
            svg.call(indicator, gauge);
            const text = svg.select('text.g3-indicate-text');
            expect(text.attr('font-size')).toBe('30');
        });

        it('should pass metrics and unit to format callback', () => {
            const indicator = g3.indicateText().format((v, metrics, unit) => `${v}/${metrics?.limit} ${unit}`);
            svg.call(indicator, gauge);

            controller({
                metrics: { 'test.metric': 50, limit: 80 },
                units: { 'test.metric': '%' }
            });

            const text = svg.select('text.g3-indicate-text');
            expect(text.text()).toBe('50/80 %');
        });
    });

    describe('g3.indicateUnit', () => {
        it('should display variable unit from controller data', () => {
            const indicator = g3.indicateUnit();
            svg.call(indicator, gauge);

            controller({
                metrics: { 'test.metric': 100 },
                units: { 'test.metric': 'kg' }
            });

            const text = svg.select('text.g3-indicate-unit');
            expect(text.text()).toBe('kg');

            controller({
                metrics: { 'test.metric': 220 },
                units: { 'test.metric': 'lbs' }
            });
            expect(text.text()).toBe('lbs');
        });

        it('should support custom format and size', () => {
            const indicator = g3.indicateUnit().size(14).format(u => u.toUpperCase());
            expect(indicator.size()).toBe(14);
            svg.call(indicator, gauge);

            controller({
                metrics: { 'test.metric': 100 },
                units: { 'test.metric': 'kg' }
            });

            const text = svg.select('text.g3-indicate-unit');
            expect(text.attr('font-size')).toBe('14');
            expect(text.text()).toBe('KG');
        });
    });

    describe('g3.indicatePointer', () => {
        it('should update transform on metric change', () => {
            const indicator = g3.indicatePointer();
            const transition = vi.fn((sel: any) => sel); // mock transition
            svg.call(indicator, gauge);

            controller({ metrics: { 'test.metric': 50 } }, transition);

            const g = svg.select('g.g3-indicate-pointer');
            // 50 on a [0,100] domain maps to 180 on a [0,360] range
            expect(g.attr('transform')).toBe('rotate(180)');
            expect(transition).toHaveBeenCalled();
        });

        it('should clamp values', () => {
            const indicator = g3.indicatePointer().clamp([20, 80]); // clamp metric value
            const transition = vi.fn((sel: any) => sel);
            svg.call(indicator, gauge);
            const g = svg.select('g.g3-indicate-pointer');

            // value 10 is clamped to 20. measure(20) = 72 degrees.
            controller({ metrics: { 'test.metric': 10 } }, transition);
            expect(g.attr('transform')).toBe('rotate(72)');

            // value 50 is not clamped. measure(50) = 180 degrees.
            controller({ metrics: { 'test.metric': 50 } }, transition);
            expect(g.attr('transform')).toBe('rotate(180)');

            // value 90 is clamped to 80. measure(80) = 288 degrees.
            controller({ metrics: { 'test.metric': 90 } }, transition);
            expect(g.attr('transform')).toBe('rotate(288)');
        });

        it('should allow changing the shape', () => {
            const indicator = g3.indicatePointer().shape('needle');
            svg.call(indicator, gauge);
            // The pointer group should have child elements for the shape
            expect(svg.select('g.g3-indicate-pointer *').empty()).toBe(false);
        });

        it('should throw an error for an unknown shape', () => {
            expect(() => g3.indicatePointer().shape('nonexistent-shape')).toThrow();
        });

        it('should apply a rescale function', () => {
            // rescale will add 10 to the value before it's measured
            const indicator = g3.indicatePointer().rescale((v: any) => v + 10);
            const transition = vi.fn((sel: any) => sel);
            svg.call(indicator, gauge);
            const g = svg.select('g.g3-indicate-pointer');
            controller({ metrics: { 'test.metric': 40 } }, transition);
            expect(g.attr('transform')).toBe('rotate(180)');
        });

        it('should not wrap around the discontinuity on non-cyclic gauges during transitions', () => {
            const nonCyclicGauge = g3.gauge()
                .metric('rpm')
                .measure(d3.scaleLinear().domain([0, 6000]).range([-125, 125]));
            const indicator = g3.indicatePointer();
            svg.call(indicator, nonCyclicGauge);

            let tweenFn: ((this: Element) => (t: number) => string) | undefined;
            const mockTransition = (sel: any) => ({
                attr: (k: string, v: string) => sel.attr(k, v),
                attrTween: (_k: string, fn: any) => { tweenFn = fn; },
            });

            // First update at 6000 RPM (+125 deg)
            controller({ metrics: { rpm: 6000 } }, mockTransition as any);
            const gNode = svg.select('g.g3-indicate-pointer').node() as Element;
            expect(gNode.getAttribute('transform')).toBe('rotate(125)');

            // Second update drops to 0 RPM (-125 deg): should pass through 0 deg at midpoint (t=0.5), not 180 deg
            controller({ metrics: { rpm: 0 } }, mockTransition as any);
            expect(tweenFn).toBeDefined();
            const interpolator = tweenFn!.call(gNode);
            expect(interpolator(0)).toBe('rotate(125)');
            expect(interpolator(0.5)).toBe('rotate(0)');
            expect(interpolator(1)).toBe('rotate(-125)');
        });
    });

    describe('g3.indicateStyle', () => {
        it('should update style on metric change', () => {
            const indicator = g3.indicateStyle()
                .trigger((v: any) => v > 50 ? 1 : 0); // default styles are opacity
            svg.call(indicator, gauge);
            const g = svg.select('g.g3-indicate-style');

            controller({ metrics: { 'test.metric': 25 } });
            expect(g.style('opacity')).toBe('0');

            controller({ metrics: { 'test.metric': 75 } });
            expect(g.style('opacity')).toBe('1');
        });

        it('should allow comparing values of two metrics in trigger', () => {
            const indicator = g3.indicateStyle()
                .trigger((v, metrics) => v > metrics?.limit ? 1 : 0)
                .styleOff({ fill: 'green' })
                .styleOn({ fill: 'orange' });
            svg.call(indicator, gauge);
            const group = svg.select('g.g3-indicate-style');

            controller({ metrics: { 'test.metric': 85, limit: 90 } });
            expect(group.style('fill')).toBe('rgb(0, 128, 0)');

            controller({ metrics: { 'test.metric': 95, limit: 90 } });
            expect(group.style('fill')).toBe('rgb(255, 165, 0)');
        });

        it('should allow custom on/off styles', () => {
            const indicator = g3.indicateStyle()
                .trigger((v: any) => v > 50 ? 1 : 0)
                .styleOn({ fill: 'green' })
                .styleOff({ fill: 'red' });

            const child = g3.element('rect', {width: 10, height: 10});
            indicator.append(child);
            svg.call(indicator, gauge);
            const group = svg.select('g.g3-indicate-style');

            controller({ metrics: { 'test.metric': 25 } });
            expect(group.style('fill')).toBe('rgb(255, 0, 0)');

            controller({ metrics: { 'test.metric': 75 } });
            expect(group.style('fill')).toBe('rgb(0, 128, 0)');
        });
    });

    describe('g3.indicateSector', () => {
        it('should draw and update a sector path', () => {
            const indicator = g3.indicateSector().anchor(50).size(20);
            const transition = vi.fn((sel: any) => sel);
            svg.call(indicator, gauge);
            const path = svg.select('path.g3-indicate-sector');

            controller({ metrics: { 'test.metric': 75 } }, transition);
            expect(path.attr('d')).not.toBeNull();
            expect(path.classed('g3-indicate-sector-negative')).toBe(false);
        });

        it('should handle negative values relative to anchor', () => {
            const indicator = g3.indicateSector().anchor(50);
            const transition = vi.fn((sel: any) => sel);
            svg.call(indicator, gauge);
            const path = svg.select('path.g3-indicate-sector');

            controller({ metrics: { 'test.metric': 25 } }, transition);
            expect(path.classed('g3-indicate-sector-negative')).toBe(true);
        });

        it('should clamp values', () => {
            const indicator = g3.indicateSector().anchor(0).clamp([null, 80]);
            const transition = vi.fn((sel: any) => sel);
            svg.call(indicator, gauge);
            const path = svg.select('path.g3-indicate-sector');
            controller({ metrics: { 'test.metric': 90 } }, transition);
            const dClamped = path.attr('d');
            controller({ metrics: { 'test.metric': 80 } }, transition);
            const dMax = path.attr('d');
            expect(dClamped).toEqual(dMax);
        });
    });

    describe('g3.statusLight', () => {
        it('should create a styled gauge that indicates status', () => {
            const light = g3.statusLight().metric('test.metric').trigger((v: any) => v > 50).color('green');
            svg.call(light); // light is a gauge itself

            const indicatorGroup = svg.select('.g3-indicate-style');
            const face = indicatorGroup.select('.g3-gauge-face');
            expect(face.style('fill')).toBe('green');

            controller({ metrics: { 'test.metric': 25 } });
            expect(indicatorGroup.style('opacity')).toBe('0');

            controller({ metrics: { 'test.metric': 75 } });
            expect(indicatorGroup.style('opacity')).toBe('1');
        });
    });
});
