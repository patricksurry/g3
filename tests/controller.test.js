import { jest } from '@jest/globals';
import * as g3 from '../src/g3.js';

describe('gaugeController', () => {
    it('should register and call a simple updater', () => {
        const controller = g3.gaugeController();
        const updater = jest.fn();
        const transition = jest.fn();
        controller.register(updater, 'test.metric');

        controller({ metrics: { 'test.metric': 123 } }, transition);
        expect(updater).toHaveBeenCalledWith(123, transition);
    });

    it('should handle unit conversion', () => {
        const controller = g3.gaugeController();
        const updater = jest.fn();
        const transition = jest.fn();
        controller.register(updater, 'speed', 'mph');

        controller({
            metrics: { 'speed': 100 },
            units: { 'speed': 'km/h' }
        }, transition);

        // 100 km/h is approx 62.1371 mph
        expect(updater).toHaveBeenCalledWith(expect.closeTo(62.1371), transition);
    });

    it('should handle metric qualification', () => {
        const controller = g3.gaugeController();
        const updater = jest.fn();
        const transition = jest.fn();
        controller.register(updater, 'test.metric.specific');

        controller({ metrics: { 'test.metric': 123 } }, transition);
        expect(updater).toHaveBeenCalledWith(123, transition);
    });

    it('should generate fake metrics', () => {
        const controller = g3.gaugeController();
        controller.fake('fake.metric', () => 42);
        const fakeData = controller.fakeMetrics();
        expect(fakeData.metrics['fake.metric']).toBe(42);
    });
});