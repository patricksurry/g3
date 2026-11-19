import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3';

describe('gauge components', () => {
    let svg: d3.Selection<any, any, any, any>;

    beforeEach(() => {
        // Set up a DOM environment
        document.body.innerHTML = '<svg width="500" height="500"></svg>';
        svg = d3.select('svg');
    });

    describe('g3.gauge', () => {
        it('should create a gauge group', () => {
            const myGauge = g3.gauge();
            svg.call(myGauge);
            expect(svg.select('g.g3-gauge').empty()).toBe(false);
        });

        it('should respect metric, unit, and measure', () => {
            const myGauge = g3.gauge()
                .metric('test')
                .unit('rpm')
                .measure(d3.scaleLinear().domain([0, 100]).range([0, 360]));

            expect(myGauge.metric()).toBe('test');
            expect(myGauge.unit()).toBe('rpm');
            expect(myGauge.measure().domain()).toEqual([0, 100]);
        });
    });

    describe('g3.gaugeFace', () => {
        it('should draw a circle', () => {
            const face = g3.gaugeFace().r(50);
            svg.call(face);
            const circle = svg.select('circle.g3-gauge-face');
            expect(circle.empty()).toBe(false);
            expect(circle.attr('r')).toBe('50');
        });
    });

    describe('g3.gaugeLabel', () => {
        it('should draw a text label', () => {
            const label = g3.gaugeLabel('Test', { x: 10, y: 20, size: 15 });
            svg.call(label);
            const text = svg.select('text.g3-gauge-label');
            expect(text.empty()).toBe(false);
            expect(text.text()).toBe('Test');
            expect(text.attr('x')).toBe('10');
            expect(text.attr('y')).toBe('20');
            expect(text.attr('font-size')).toBe('15');
        });
    });

    describe('g3.gaugeScrew', () => {
        it('should draw a screw', () => {
            const screw = g3.gaugeScrew().r(5).shape('phillips');
            svg.call(screw);
            const g = svg.select('g.g3-gauge-screw');
            expect(g.empty()).toBe(false);
            expect(g.select('circle.g3-gauge-screw-head').attr('r')).toBe('5');
            // Phillips has 2 rects
            expect(g.selectAll('rect').size()).toBe(2);
        });
    });

    describe('gauge metrics and actions', () => {
        it('should accept secondary metrics, qualified like the primary', () => {
            const g = g3.gauge().metric('code', 'mode').instance('copilot');
            svg.call(g);
            expect(g.metric()).toBe('code.copilot');
            expect(g.metrics()).toEqual(['code.copilot', 'mode.copilot']);
        });

        it('should redraw its indicators when a secondary metric changes', () => {
            const ctrl = g3.gaugeController();
            svg.call(
                g3.gauge().metric('code', 'mode').append(
                    g3.indicateText().format((v, metrics) => metrics?.mode == 'TST' ? '8888' : String(v))
                )
            );
            ctrl({ metrics: { code: 7000, mode: 'ALT' } });
            expect(svg.select('text.g3-indicate-text').text()).toBe('7000');
            ctrl({ metrics: { mode: 'TST' } });
            expect(svg.select('text.g3-indicate-text').text()).toBe('8888');
        });

        it('should declare a constant fake value with its unit', () => {
            const ctrl = g3.gaugeController();
            svg.call(g3.gauge().metric('sw').unit('deg').fake(0));
            expect(ctrl.fakes()).toEqual({ sw: { fake: 0, unit: 'deg' } });
        });

        it('should send actions defaulting to its primary metric and unit', () => {
            const ctrl = g3.gaugeController();
            const sink = vi.fn();
            ctrl.sink(sink);
            const g = g3.gauge().metric('hdg').unit('deg');
            svg.call(g);
            g.send({ op: 'adjust', by: 5 }, { op: 'trigger', event: 'ident' });
            expect(sink).toHaveBeenCalledWith([
                { op: 'adjust', metric: 'hdg', unit: 'deg', by: 5 },
                { op: 'trigger', event: 'ident' },
            ]);
        });

        it('should send to the controller that was active when it was drawn', () => {
            const ctrl = g3.gaugeController();
            const sink = vi.fn();
            ctrl.sink(sink);
            const g = g3.gauge().metric('sw');
            svg.call(g);
            g3.gaugeController();  // a later controller becomes active
            g.send({ op: 'set', value: 1 });
            expect(sink).toHaveBeenCalledTimes(1);
        });
    });
});
