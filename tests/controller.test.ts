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

    it('should record fake declarations, keeping the first for each metric', () => {
        const controller = g3.gaugeController();
        const warn = vi.spyOn(console, 'log').mockImplementation(() => {});
        controller.fake('sw', 0, 'deg');
        controller.fake('sw', 1);
        expect(controller.fakes()).toEqual({ sw: { fake: 0, unit: 'deg' } });
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    describe('multi-metric registration', () => {
        it('should redraw with the primary value when only a secondary metric changes', () => {
            const controller = g3.gaugeController();
            const updater = vi.fn();
            controller.register(updater, ['code', 'mode']);

            controller({ metrics: { code: 7000, mode: 'ALT' } });
            expect(updater).toHaveBeenCalledTimes(1);

            controller({ metrics: { mode: 'OFF' } });
            expect(updater).toHaveBeenCalledTimes(2);
            expect(updater).toHaveBeenLastCalledWith(7000, undefined, { code: 7000, mode: 'OFF' }, '');
        });

        it('should not redraw until the primary metric resolves', () => {
            const controller = g3.gaugeController();
            const updater = vi.fn();
            controller.register(updater, ['code', 'mode']);
            controller({ metrics: { mode: 'ALT' } });
            expect(updater).not.toHaveBeenCalled();
        });

        it('should list secondary keys among indicators', () => {
            const controller = g3.gaugeController();
            controller.register(() => {}, ['code', 'mode']);
            expect(controller.indicators().sort()).toEqual(['code', 'mode']);
        });
    });

    describe('metric key resolution', () => {
        it('should pick up a metric that first appears in a later message', () => {
            const controller = g3.gaugeController();
            const updater = vi.fn();
            controller.register(updater, 'x');
            controller({ metrics: { y: 1 } });
            controller({ metrics: { x: 5 } });
            expect(updater).toHaveBeenCalledWith(5, undefined, { x: 5, y: 1 }, '');
        });

        it('should switch to a more specific metric when it appears, without double updates', () => {
            const controller = g3.gaugeController();
            const updater = vi.fn();
            controller.register(updater, 'fuel.left');

            controller({ metrics: { fuel: 10 } });
            expect(updater).toHaveBeenLastCalledWith(10, undefined, expect.anything(), '');

            controller({ metrics: { fuel: 11, 'fuel.left': 4 } });
            expect(updater).toHaveBeenCalledTimes(2);
            expect(updater).toHaveBeenLastCalledWith(4, undefined, expect.anything(), '');

            // fuel.left now resolves to itself, so changes to fuel are irrelevant
            controller({ metrics: { fuel: 12 } });
            expect(updater).toHaveBeenCalledTimes(2);
        });

        it('should serve updaters registered after the first message', () => {
            const controller = g3.gaugeController();
            controller({ metrics: { a: 1 } });
            const updater = vi.fn();
            controller.register(updater, 'a');
            controller({ metrics: { a: 2 } });
            expect(updater).toHaveBeenCalledWith(2, undefined, { a: 2 }, '');
        });

        it('should keep declared units across messages', () => {
            const controller = g3.gaugeController();
            const updater = vi.fn();
            controller.register(updater, 'speed', 'mph');
            controller({ metrics: { speed: 100 }, units: { speed: 'km/h' } });
            controller({ metrics: { speed: 50 } });
            expect(updater).toHaveBeenLastCalledWith(expect.closeTo(31.0686), undefined, expect.anything(), 'mph');
        });
    });

    describe('sending actions', () => {
        it('should pass each batch of actions to the sink', () => {
            const controller = g3.gaugeController();
            const sink = vi.fn();
            controller.sink(sink);
            controller.send({ op: 'set', metric: 'a', value: 1 }, { op: 'trigger', event: 'b' });
            expect(sink).toHaveBeenCalledWith([
                { op: 'set', metric: 'a', value: 1 },
                { op: 'trigger', event: 'b' },
            ]);
        });

        it('should log and drop actions when there is no sink', () => {
            const controller = g3.gaugeController();
            const log = vi.spyOn(console, 'log').mockImplementation(() => {});
            expect(() => controller.send({ op: 'trigger', event: 'b' })).not.toThrow();
            expect(log).toHaveBeenCalled();
            log.mockRestore();
        });
    });
});
