import { maybeConvert, resolveKey } from './metrics';
import type { Action, Fake, LocalHub } from './types';


/**
 * The in-browser hub a panel uses when it has no url (see doc/API.md#local-hub).
 * Each fake declares a metric's starting value, either as a constant or as a generator
 * which is then called once per tick with the metric's current value.
 */
export function localHub(fakes: Record<string, { fake: Fake; unit?: string }>): LocalHub {
    const state: Record<string, any> = {},
        units: Record<string, string> = {},
        generators: Record<string, (current?: any) => any> = {};
    let latest = 1;

    Object.entries(fakes).forEach(([m, { fake, unit }]) => {
        if (unit) units[m] = unit;
        if (typeof fake === 'function') {
            generators[m] = fake;
            state[m] = fake(undefined);
        } else {
            state[m] = fake;
        }
    });

    function message(metrics: Record<string, any>) {
        if (Object.keys(metrics).length) latest++;
        return {
            latest,
            metrics,
            units: Object.fromEntries(Object.keys(metrics).filter(m => m in units).map(m => [m, units[m]])),
        };
    }

    function applyOne(a: Action, changes: Record<string, any>) {
        if (a.op === 'trigger') {
            console.log('g3 local hub: ignoring trigger', a.event);
            return;
        }
        const m = a.metric === undefined ? undefined : resolveKey(a.metric, state);
        if (m === undefined) {
            console.log('g3 local hub: ignoring action for unknown metric', a);
            return;
        }
        const hubUnit = units[m];
        let v: any;
        if (a.op === 'set') {
            v = maybeConvert(a.value, a.unit, hubUnit);
        } else if (a.op === 'adjust') {
            // work in the action's unit, so that deltas and limits convert correctly
            const { min, max, wrap } = a;
            let x = Number(maybeConvert(state[m], hubUnit, a.unit)) + a.by;
            if (wrap && min !== undefined && max !== undefined) {
                const span = max - min;
                x = ((x - min) % span + span) % span + min;
            } else {
                if (min !== undefined) x = Math.max(min, x);
                if (max !== undefined) x = Math.min(max, x);
            }
            v = maybeConvert(x, a.unit, hubUnit);
        } else {
            console.log('g3 local hub: ignoring unknown action', a);
            return;
        }
        state[m] = v;
        changes[m] = v;
    }

    return {
        snapshot() {
            return { latest, metrics: { ...state }, units: { ...units } };
        },
        tick() {
            const changes: Record<string, any> = {};
            Object.entries(generators).forEach(([m, gen]) => {
                state[m] = changes[m] = gen(state[m]);
            });
            return message(changes);
        },
        apply(actions: Action[]) {
            const changes: Record<string, any> = {};
            actions.forEach(a => applyOne(a, changes));
            return message(changes);
        },
    };
}
