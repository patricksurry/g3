import * as d3 from 'd3';
import * as g3 from '../src/g3.js';

describe('gauge components', () => {
    let svg;

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
});