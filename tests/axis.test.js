import * as d3 from 'd3';
import * as g3 from '../src/g3.js';

describe('axis components', () => {
    let svg, gauge;

    beforeEach(() => {
        document.body.innerHTML = '<svg width="500" height="500"></svg>';
        svg = d3.select('svg');
        gauge = g3.gauge().measure(d3.scaleLinear().domain([0, 100]).range([30, 330]));
    });

    describe('g3.axisLine', () => {
        it('should draw a path for the axis', () => {
            const axisLine = g3.axisLine();
            svg.call(axisLine, gauge);
            const path = svg.select('path.g3-axis-line');
            expect(path.empty()).toBe(false);
            expect(path.attr('d')).not.toBeNull();
        });
    });

    describe('g3.axisTicks', () => {
        it('should draw ticks', () => {
            const ticks = g3.axisTicks().step(10);
            svg.call(ticks, gauge);
            const tickGroups = svg.selectAll('g.g3-axis-ticks > g');
            expect(tickGroups.size()).toBe(11); // 0, 10, ..., 100
        });

        it('should drop the last tick on a full circle', () => {
            const fullCircleGauge = g3.gauge().measure(d3.scaleLinear().domain([0, 100]).range([0, 360]));
            const ticks = g3.axisTicks().step(10);
            svg.call(ticks, fullCircleGauge);
            const tickGroups = svg.selectAll('g.g3-axis-ticks > g');
            expect(tickGroups.size()).toBe(10); // 0, 10, ..., 90 (100 is dropped)
        });
    });

    describe('g3.axisLabels', () => {
        it('should draw labels', () => {
            const labels = g3.axisLabels().step(25);
            svg.call(labels, gauge);
            const labelGroups = svg.selectAll('g.g3-axis-labels > g');
            expect(labelGroups.size()).toBe(5); // 0, 25, 50, 75, 100
            expect(d3.select(labelGroups.nodes()[1]).select('text').text()).toBe('25');
        });

        it('should drop the last label on a full circle', () => {
            const fullCircleGauge = g3.gauge().measure(d3.scaleLinear().domain([0, 100]).range([0, 360]));
            const labels = g3.axisLabels().step(25);
            svg.call(labels, fullCircleGauge);
            const labelGroups = svg.selectAll('g.g3-axis-labels > g');
            expect(labelGroups.size()).toBe(4); // 0, 25, 50, 75 (100 is dropped)
        });
    });

    describe('g3.axisSector', () => {
        it('should draw a sector', () => {
            const sector = g3.axisSector([20, 80]).size(10);
            svg.call(sector, gauge);
            const path = svg.select('path.g3-axis-sector');
            expect(path.empty()).toBe(false);
            expect(path.attr('d')).toContain('A'); // arc command for circular gauges
        });
    });
});