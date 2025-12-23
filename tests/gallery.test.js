import * as d3 from 'd3';
import { jest } from '@jest/globals';
import * as g3 from '../src/g3-contrib.js';
import { contrib } from '../src/contrib/__index__.js';
import { pointers } from '../src/pointers.js';
import { flatten } from '../src/common.js';


const gaugeDefs = flatten(contrib).filter(([, f]) => typeof f === 'function');
const numGauges = gaugeDefs.length;
const numPointers = Object.keys(pointers).length;


describe('Gallery components', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        // The gallery creates a panel which uses setInterval for fake metrics.
        // We need to mock timers to prevent tests from hanging.
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.removeChild(container);
        container = null;
        jest.useRealTimers();
    });

    describe('g3.gallery.contrib', () => {
        it('should render the contrib gallery without errors', () => {
            expect(() => g3.gallery.contrib(d3.select(container))).not.toThrow();
        });

        it('should contain all contributed gauges', () => {
            g3.gallery.contrib(d3.select(container));
            const svg = d3.select(container).select('svg');
            expect(svg.empty()).toBe(false);

            const gaugeElements = svg.selectAll('.g3-panel > g > g.g3-gauge');
            // The gallery creates one gauge per contribution, plus a label.
            expect(gaugeElements.size()).toBe(numGauges);
        });
    });

    describe('g3.gallery.pointers', () => {
        it('should render the pointers gallery without errors', () => {
            expect(() => g3.gallery.pointers(d3.select(container))).not.toThrow();
        });

        it('should contain all pointer types', () => {
            g3.gallery.pointers(d3.select(container));
            const svg = d3.select(container).select('svg');
            expect(svg.empty()).toBe(false);

            // The pointers gallery creates one gauge for each pointer shape.
            const gaugeElements = svg.selectAll('.g3-panel > g > g.g3-gauge');
            expect(gaugeElements.size()).toBe(numPointers);
        });
    });
});