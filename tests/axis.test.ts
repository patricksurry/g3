import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3';

describe('axis components', () => {
    let svg: d3.Selection<any, any, any, any>,
        gauge: g3.GaugeComponent;

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

        it('should span the whole domain of a piecewise scale (#31)', () => {
            const linear = g3.gauge().kind('linear')
                .measure(d3.scaleLinear().domain([-25, -5, 0, 25]).range([263, 212, 201, 144]));
            svg.call(g3.axisLine(), linear);
            expect(svg.select('path.g3-axis-line').attr('d')).toBe('M 263,0 l 0,0 l -119,0 l 0,0 z');
        });
    });

    describe('piecewise scales', () => {
        it('should step ticks across the whole domain', () => {
            const linear = g3.gauge().kind('linear')
                .measure(d3.scaleLinear().domain([-25, -5, 0, 25]).range([263, 212, 201, 144]));
            svg.call(g3.axisTicks().step(5), linear);
            expect(svg.selectAll('g.g3-axis-ticks > g').size()).toBe(11); // -25, -20, ..., 25
        });

        it('should recognise a full circle from the first and last range values', () => {
            const circular = g3.gauge()
                .measure(d3.scaleLinear().domain([0, 6, 12]).range([0, 90, 360]));
            svg.call(g3.axisTicks().step(1), circular);
            expect(svg.selectAll('g.g3-axis-ticks > g').size()).toBe(12); // 12 coincides with 0
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
            expect(d3.select(labelGroups.nodes()[1] as any).select('text').text()).toBe('25');
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
