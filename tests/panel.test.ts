import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3';

describe('g3.panel', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="panel-container"></div>';
        // Mock fetch
        (globalThis as any).fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ metrics: {} }),
            })
        );
        // Mock setInterval
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
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

        expect((globalThis as any).fetch).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
        expect((globalThis as any).fetch).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/metrics' }));
        vi.advanceTimersByTime(500);
        expect((globalThis as any).fetch).toHaveBeenCalledTimes(2);
    });

    it('should send its metric keys when polling', () => {
        const myGauge = g3.gauge().metric('code', 'mode').append(g3.indicateText());
        g3.panel().url('/metrics').interval(500).append(myGauge)('#panel-container');
        vi.advanceTimersByTime(500);
        const url: URL = (globalThis as any).fetch.mock.calls[0][0];
        expect(url.searchParams.get('keys')!.split(',').sort()).toEqual(['code', 'mode']);
        expect(url.searchParams.get('latest')).toBe('0');
        expect(url.searchParams.get('units')).toBe('true');
    });

    describe('with the local hub', () => {
        it('should draw the starting snapshot immediately, then advance generators each interval', () => {
            let n = 0;
            const myGauge = g3.gauge().metric('n').fake(() => ++n).append(g3.indicateText());
            g3.panel().append(myGauge).interval(500).smooth(false)('#panel-container');
            const text = () => d3.select('#panel-container text.g3-indicate-text').text();
            expect(text()).toBe('1');
            vi.advanceTimersByTime(500);
            expect(text()).toBe('2');
        });

        it('should apply actions and redraw immediately', () => {
            const myGauge = g3.gauge().metric('sw').fake(0).append(g3.indicateText());
            g3.panel().append(myGauge).smooth(false)('#panel-container');
            myGauge.send({ op: 'set', value: 1 });
            expect(d3.select('#panel-container text.g3-indicate-text').text()).toBe('1');
        });
    });

    describe('sending actions to an external hub', () => {
        it('should POST each batch to inputUrl, one at a time', async () => {
            const myGauge = g3.gauge().metric('sw');
            g3.panel().url('/metrics').inputUrl('/inputs').append(myGauge)('#panel-container');
            const fetch = (globalThis as any).fetch;

            myGauge.send({ op: 'set', value: 1 });
            myGauge.send({ op: 'set', value: 0 });
            await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

            const [url, init] = fetch.mock.calls[0];
            expect(url.toString()).toContain('/inputs');
            expect(init.method).toBe('POST');
            expect(JSON.parse(init.body)).toEqual({ actions: [{ op: 'set', metric: 'sw', value: 1 }] });
            expect(JSON.parse(fetch.mock.calls[1][1].body).actions[0].value).toBe(0);
        });

        it('should log and drop actions when there is a url but no inputUrl', () => {
            const log = vi.spyOn(console, 'log').mockImplementation(() => {});
            const myGauge = g3.gauge().metric('sw');
            g3.panel().url('/metrics').append(myGauge)('#panel-container');
            myGauge.send({ op: 'set', value: 1 });
            expect((globalThis as any).fetch).not.toHaveBeenCalled();
            expect(log).toHaveBeenCalledWith(expect.stringContaining('dropped'), expect.anything());
            log.mockRestore();
        });
    });

    it('should allow disabling smooth transitions', () => {
        const myPanel = g3.panel().smooth(false);
        // We just need to ensure it runs without error and sets the flag
        expect(myPanel.smooth()).toBe(false);
        myPanel('#panel-container');
        // If smooth is false, the transition function is identity, difficult to test effect directly
        // without inspecting internal closure, but this covers the line.
    });

    it('should support grid configuration', () => {
        const myPanel = g3.panel().grid(true);
        expect(myPanel.grid()).toBe(true);
        myPanel('#panel-container');
        expect(d3.select('#panel-container .g3-grid').empty()).toBe(false);
    });

    it('should use EventSource with keys query param when interval is 0', () => {
        let capturedUrl: string | undefined, instance: any;
        (globalThis as any).EventSource = vi.fn(function(this: any, url: any) {
            capturedUrl = url.toString();
            instance = this;
        });

        const myGauge = g3.gauge().metric('heading').append(g3.indicatePointer());
        const myPanel = g3.panel().url('http://localhost/sse').interval(0).smooth(false).append(myGauge);
        myPanel('#panel-container');

        expect((globalThis as any).EventSource).toHaveBeenCalledTimes(1);
        expect(capturedUrl).toContain('keys=heading');

        // Simulate receiving an SSE message
        instance.onmessage({ data: JSON.stringify({ metrics: { heading: 0.25 } }) });
        expect(d3.select('#panel-container .g3-indicate-pointer').attr('transform')).toBe('rotate(90)');
        delete (globalThis as any).EventSource;
    });
});
