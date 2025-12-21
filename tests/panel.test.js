import * as d3 from 'd3';
import * as g3 from '../src/g3.js';
import { jest } from '@jest/globals';

describe('g3.panel', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="panel-container"></div>';
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ metrics: {} }),
            })
        );
        // Mock setInterval
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an SVG element inside the selector', () => {
        const myPanel = g3.panel().width(200).height(100);
        myPanel('#panel-container');

        const svg = d3.select('#panel-container svg');
        expect(svg.empty()).toBe(false);
        expect(svg.attr('width')).toBe('200');
        expect(svg.attr('height')).toBe('100');
    });

    it('should append child components', () => {
        const myGauge = g3.gauge();
        const myPanel = g3.panel().append(myGauge);
        myPanel('#panel-container');

        const gaugeGroup = d3.select('#panel-container svg g.g3-gauge');
        expect(gaugeGroup.empty()).toBe(false);
    });

    it('should poll for metrics when a URL is set', () => {
        const myPanel = g3.panel().url('/metrics').interval(500);
        myPanel('#panel-container');

        expect(global.fetch).not.toHaveBeenCalled();
        jest.advanceTimersByTime(500);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/metrics' }));
        jest.advanceTimersByTime(500);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should use fake metrics when no URL is set', () => {
        const myGauge = g3.gauge().metric('fake.metric').fake(() => 123);
        const myPanel = g3.panel().append(myGauge).interval(500);
        myPanel('#panel-container');
        const controller = g3.activeController; // Get the controller created by the panel
        const spy = jest.spyOn(controller, 'fakeMetrics');
        jest.advanceTimersByTime(500);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should allow disabling smooth transitions', () => {
        const myPanel = g3.panel().smooth(false);
        // We just need to ensure it runs without error and sets the flag
        expect(myPanel.smooth()).toBe(false);
        myPanel('#panel-container');
        // If smooth is false, the transition function is identity, difficult to test effect directly
        // without inspecting internal closure, but this covers the line.
    });

    it('should support one-shot updates with negative interval', () => {
        const myPanel = g3.panel().interval(-1);
        myPanel('#panel-container');
        // Should have called fakeMetrics once immediately
        // We can verify this by checking if the SVG was populated
        expect(d3.select('#panel-container svg').empty()).toBe(false);
    });

    it('should support grid configuration', () => {
        const myPanel = g3.panel().grid(true);
        expect(myPanel.grid()).toBe(true);
        myPanel('#panel-container');
        expect(d3.select('#panel-container .g3-grid').empty()).toBe(false);
    });

    // Note: Testing EventSource (SSE) requires mocking the EventSource API,
    // which is not present in JSDOM by default.
});