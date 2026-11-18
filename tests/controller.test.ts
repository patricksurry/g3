import { describe, it, expect, vi } from 'vitest';
import * as g3 from '../src/g3';

describe('gaugeController', () => {
    it('should register and call a simple updater', () => {
        const controller = g3.gaugeController();
        const updater = vi.fn();
        const transition = vi.fn();
        controller.register(updater, 'test.metric');

        controller({ metrics: { 'test.metric': 123 } }, transition);
        expect(updater).toHaveBeenCalledWith(123, transition, { 'test.metric': 123 }, '');
    });

    it('should handle unit conversion', () => {
        const controller = g3.gaugeController();
        const updater = vi.fn();
        const transition = vi.fn();
        controller.register(updater, 'speed', 'mph');

        controller({
            metrics: { 'speed': 100 },
            units: { 'speed': 'km/h' }
        }, transition);

        // 100 km/h is approx 62.1371 mph
        expect(updater).toHaveBeenCalledWith(expect.closeTo(62.1371), transition, { 'speed': 100 }, 'mph');
    });

    it('should pass source unit when gauge unit is not specified', () => {
        const controller = g3.gaugeController();
        const updater = vi.fn();
        const transition = vi.fn();
        controller.register(updater, 'fuel');

        controller({
            metrics: { 'fuel': 50 },
            units: { 'fuel': 'kg' }
        }, transition);

        expect(updater).toHaveBeenCalledWith(50, transition, { 'fuel': 50 }, 'kg');
    });

    it('should handle metric qualification', () => {
        const controller = g3.gaugeController();
        const updater1 = vi.fn();
        const updater2 = vi.fn();
        const transition = vi.fn();
        controller.register(updater1, 'test.metric.first');
        controller.register(updater2, 'test.metric.second');

        controller({ metrics: { 'test.metric': 123 } }, transition);
        expect(updater1).toHaveBeenCalledWith(123, transition, { 'test.metric': 123 }, '');
        expect(updater2).toHaveBeenCalledWith(123, transition, { 'test.metric': 123 }, '');
    });

    it('should generate fake metrics', () => {
        const controller = g3.gaugeController();
        controller.fake('fake.metric', () => 42);
        const fakeData = controller.fakeMetrics();
        expect(fakeData.metrics['fake.metric']).toBe(42);
    });
});
