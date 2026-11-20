import { maybeConvert, resolveKey } from './metrics';
import type { GaugeController, ControllerData, TransitionFunction, MetricUpdater, Fake, Action } from './types';

export { convertUnits, knownUnits } from './metrics';


export let activeController: GaugeController | undefined;  // hack to provide current context for gauges to register with


export function gaugeController(): GaugeController {
    /*
    The controller mirrors the metrics reported by a hub (see doc/API.md#where-state-lives).
    It never compares values: every metric in a message counts as changed,
    and each registered updater whose keys resolve to a changed metric is redrawn
    with the value of its primary key.
    */
    type Registration = { updater: MetricUpdater; keys: string[]; unit: string };

    const registrations: Registration[] = [],
        fakes: Record<string, { fake: Fake; unit?: string }> = {},
        mirror: Record<string, any> = {},       // latest reported value of each metric
        units: Record<string, string> = {},     // reported unit of each metric
        resolved = new Map<string, string | undefined>();   // key => metric, reset when new metrics appear
    let sinkFn: ((actions: Action[]) => void) | undefined,
        checkedKeys = false;

    function resolve(key: string): string | undefined {
        if (!resolved.has(key)) resolved.set(key, resolveKey(key, mirror));
        return resolved.get(key);
    }

    const controller: GaugeController = Object.assign(
        function(data: ControllerData, transition?: TransitionFunction) {
            const changed = data.metrics || {};
            if (Object.keys(changed).some(m => !(m in mirror))) resolved.clear();
            Object.assign(mirror, changed);
            Object.assign(units, data.units || {});

            if (!checkedKeys && Object.keys(changed).length) {
                checkedKeys = true;
                const missing = controller.indicators().filter(k => resolve(k) === undefined);
                if (missing.length) console.log('Warning: no metric matching', missing);
            }

            registrations.forEach(({ updater, keys, unit }) => {
                if (!keys.some(k => { const m = resolve(k); return m !== undefined && m in changed; })) return;
                const m = resolve(keys[0]);
                if (m === undefined) return;
                const from = units[m] || '',
                    v = maybeConvert(mirror[m], from, unit);
                if (typeof v === 'undefined') {
                    console.log(`Warning: failed to convert ${mirror[m]} from ${from} to ${unit}`);
                } else {
                    updater(v, transition, mirror, unit || from);
                }
            });
        },
        {
            register(updater: MetricUpdater, metric?: string | string[], unit?: string) {
                const keys = (Array.isArray(metric) ? metric : [metric]).filter((k): k is string => !!k);
                if (keys.length) registrations.push({ updater, keys, unit: unit || '' });
            },
            fake(metric: string, fake: Fake, unit?: string) {
                if (metric in fakes) {
                    console.log(`Warning: ignoring duplicate fake for ${metric}`);
                } else {
                    fakes[metric] = { fake, unit };
                }
            },
            fakes() {
                return fakes;
            },
            indicators(): string[] {
                return Array.from(new Set(registrations.flatMap(r => r.keys)));
            },
            sink(fn: (actions: Action[]) => void) {
                sinkFn = fn;
                return controller;
            },
            send(...actions: Action[]) {
                if (sinkFn) {
                    sinkFn(actions);
                } else {
                    console.log('g3: actions dropped, no hub input configured:', actions);
                }
            },
        }
    );

    activeController = controller;
    return controller;
}
