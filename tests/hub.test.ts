import { describe, it, expect, vi } from 'vitest';
import * as g3 from '../src/g3';

describe('localHub', () => {
    it('should snapshot constant and generated starting values with their units', () => {
        const hub = g3.localHub({
            sw: { fake: 0 },
            alt: { fake: () => 1000, unit: 'ft' },
        });
        const snap = hub.snapshot();
        expect(snap.metrics).toEqual({ sw: 0, alt: 1000 });
        expect(snap.units).toEqual({ alt: 'ft' });
    });

    it('should advance only generated metrics on each tick, passing the current value', () => {
        const gen = vi.fn((cur?: number) => (cur ?? 0) + 1);
        const hub = g3.localHub({ sw: { fake: 0 }, n: { fake: gen } });
        hub.snapshot();
        const msg = hub.tick();
        expect(msg.metrics).toEqual({ n: 2 });
        expect(gen).toHaveBeenLastCalledWith(1);
    });

    it('should increase latest whenever anything changes', () => {
        const hub = g3.localHub({ n: { fake: (cur?: number) => (cur ?? 0) + 1 } });
        const a = hub.snapshot().latest, b = hub.tick().latest;
        expect(b).toBeGreaterThan(a);
    });

    it('should apply set actions', () => {
        const hub = g3.localHub({ sw: { fake: 0 } });
        const msg = hub.apply([{ op: 'set', metric: 'sw', value: 1 }]);
        expect(msg.metrics).toEqual({ sw: 1 });
        expect(hub.snapshot().metrics.sw).toBe(1);
    });

    it('should apply adjust actions with min/max clamping and wrapping', () => {
        const hub = g3.localHub({ hdg: { fake: 350 }, baro: { fake: 1012 } });
        expect(hub.apply([{ op: 'adjust', metric: 'hdg', by: 20, min: 0, max: 360, wrap: true }]).metrics)
            .toEqual({ hdg: 10 });
        expect(hub.apply([{ op: 'adjust', metric: 'baro', by: 50, min: 950, max: 1050 }]).metrics)
            .toEqual({ baro: 1050 });
        expect(hub.apply([{ op: 'adjust', metric: 'hdg', by: -5 }]).metrics)
            .toEqual({ hdg: 5 });
    });

    it('should apply a batch of actions in order', () => {
        const hub = g3.localHub({ n: { fake: 0 } });
        const msg = hub.apply([
            { op: 'set', metric: 'n', value: 5 },
            { op: 'adjust', metric: 'n', by: 2 },
        ]);
        expect(msg.metrics).toEqual({ n: 7 });
    });

    it('should convert action units to the unit of the declaring gauge', () => {
        const hub = g3.localHub({ alt: { fake: 0, unit: 'ft' }, t: { fake: 50, unit: 'F' } });
        expect(hub.apply([{ op: 'set', metric: 'alt', value: 1, unit: 'm' }]).metrics.alt)
            .toBeCloseTo(3.28084);
        // a temperature *difference* of 10C is 18F, not 50F
        expect(hub.apply([{ op: 'adjust', metric: 't', by: 10, unit: 'C' }]).metrics.t)
            .toBeCloseTo(68);
    });

    it('should resolve action metric keys by longest prefix', () => {
        const hub = g3.localHub({ fuel: { fake: 10 } });
        expect(hub.apply([{ op: 'set', metric: 'fuel.left', value: 3 }]).metrics).toEqual({ fuel: 3 });
    });

    it('should log and ignore triggers and unknown metrics', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const hub = g3.localHub({ sw: { fake: 0 } });
        const msg = hub.apply([
            { op: 'trigger', event: 'ident' },
            { op: 'set', metric: 'nope', value: 1 },
        ]);
        expect(msg.metrics).toEqual({});
        expect(log).toHaveBeenCalledTimes(2);
        log.mockRestore();
    });
});
