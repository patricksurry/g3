import configureMeasurements from 'convert-units';
import allMeasures from 'convert-units/definitions/all';
import type { GaugeController, ControllerData } from './types';

export const
    convertUnits = configureMeasurements(allMeasures),
    knownUnits = convertUnits().possibilities();


export let activeController: GaugeController | undefined;  // hack to provide current context for gauges to register with


function maybeConvert(v: any, fromUnit?: string, toUnit?: string): any {
    let u = v;
    if (fromUnit && toUnit) {
        try {
            u = (convertUnits(v) as any).from(fromUnit).to(toUnit);
        } catch(err: any) {
            console.log('Unit conversion error: ' + err.message);
        }
    } else if (typeof v === 'string' && v.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)) {
        // convert string-serialized date metrics back to JS objects
        u = new Date(v);
    }
    return u;
}


export function gaugeController(): GaugeController {
    /*
    create a gauge controller that we'll use to update values

    `callbacks` is keyed by the panel indicator names,
    which can be more precise than the actual metric name, e.g. fuel.copilot;
    `updaters` is populated after the first call with best match to actual metrics
    */

    const callbacks: Record<string, Record<string, ((v: any, transition?: any) => void)[]>> = {},     // nested dict of metric => (unit || '') => list of update fns
        fakes: Record<string, () => any> = {};         // dict of metric => generator
    let updaters: Record<string, { unit: string; updaters: Record<string, ((v: any, transition?: any) => void)[]> | null }> | null = null;    // dict of metric keys => {metric: {unit: updaters: {unit: fns}}}

    // call the controller to display current metric values
    function gaugeControllerFn(data: ControllerData, transition?: any) {
        /*
        data is a dictionary {latest: 1234, metrics: {}, [units: {}]}
        where metrics is a dictionary
        with keys like: "metric.some.qualification"
        and corresponding values
        */
        if (!updaters) {
            // First call, we establish the mapping from metric keys => callbacks
            updaters = {};
            Object.keys(data.metrics || {}).forEach(m => {
                updaters![m] = {unit: (data.units || {})[m] || '', updaters: null};
            });

            Object.entries(callbacks).forEach(([m, ufs]) => {
                const ks = m.split('.');
                let matched = false;
                while (ks.length && !matched) {
                    const k = ks.join('.');
                    if (k in updaters!) {
                        if (!updaters![k].updaters) updaters![k].updaters = {};
                        Object.entries(ufs).forEach(([u, fs]) => {
                            if (!(u in updaters![k].updaters!)) updaters![k].updaters![u] = [];
                            updaters![k].updaters![u].push(...fs);
                        });
                        matched = true;
                    }
                    ks.pop();
                }
                if (!matched) console.log('Warning: no source metric matching', m);
            });
            Object.entries(updaters).forEach(([m, d]) => {
                if (!d.updaters) {
                    console.log('Warning: unmapped source metric', m);
                    delete updaters![m];
                }
            });
        }

        // Trigger updates for each source metric
        Object.entries(updaters).forEach(([m, d]) => {
            if (data.metrics && m in data.metrics) {
                if (d.updaters) {
                    Object.entries(d.updaters).forEach(([unit, fs]) => {
                        const v = maybeConvert(data.metrics[m], d.unit, unit);
                        if (typeof v === 'undefined') {
                            console.log(`Warning: failed to convert ${data.metrics[m]} from ${d.unit} to ${unit}`);
                        } else {
                            fs.forEach(f => f(v, transition));
                        }
                    });
                }
            }
        });
    }

    (gaugeControllerFn as any).register = function(updater: (v: any, transition?: any) => void, metric?: string, unit?: string) {
        if (!metric) return;
        const u = unit || '';
        if (!(metric in callbacks)) callbacks[metric] = {};
        if (!(u in callbacks[metric])) callbacks[metric][u] = [];
        callbacks[metric][u].push(updater);
    };
    (gaugeControllerFn as any).fake = function(metric: string, generator: () => any) {
        fakes[metric] = generator;
    };
    (gaugeControllerFn as any).fakeMetrics = function() {
        return {
            latest: 0,
            units: {},
            metrics: Object.fromEntries(
                Object.entries(fakes).map(([m, g]) => [m, g()])
            )
        };
    };
    (gaugeControllerFn as any).indicators = function(): string[] {
        // return panel indicator keys, available at startup but possibly more specific than actual metrics
        return Object.keys(callbacks);
    };
    (gaugeControllerFn as any).mappedMetrics = function(): string[] | null {
        // return matched metrics, available after first data update
        return updaters && Object.keys(updaters);
    };

    activeController = gaugeControllerFn as unknown as GaugeController;
    return gaugeControllerFn as unknown as GaugeController;
}
