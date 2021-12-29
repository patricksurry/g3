import configureMeasurements, {allMeasures} from 'convert-units';

export const
    convertUnits = configureMeasurements(allMeasures),
    knownUnits = convertUnits().possibilities();


export var activeController;  // hack to provide current context for gauges to register with


function maybeConvert(v, fromUnit, toUnit) {
    if (fromUnit && toUnit) {
        try {
            v = convertUnits(v).from(fromUnit).to(toUnit);
        } catch(err) {
            console.log('Unit conversion error: ' + err.message);
        }
    }
    return v;
}


export function gaugeController(interval) {
    // create a gauge controller that we'll use to update values
    var callbacks = {},     // nested dict of metric => (unit || '') => list of update fns
        fakes = {},         // dict of metric => generator
        updaters = null;    // dict mapping input metric keys => {metric: unit: updaters: {unit: fns}}

    // call the controller to display current metric values
    function gaugeController(metrics) {
        /*
        metrics is a dictionary
        with keys like: "metric.some.qualification:unit"
        and corresponding values
        */
        if (!updaters) {
            // Establish the mapping from metric keys => callbacks
            updaters = {};
            var sources = {};
            Object.keys(metrics).map(k => {
                const
                    ks = k.split(':'),
                    unit = (ks.length > 1) ? ks.slice(-1): '',
                    // restore any surplus ':' in metric or qualifier
                    m = (ks.length > 1) ? ks.slice(0, -1).join(':'): k;
                updaters[k] = {metric: m, unit: unit, updaters: null};
                sources[m] = k;
            })

            Object.entries(callbacks).map(([m, ufs]) => {
                /*
                for each callback, find best qualified metric from the input values,
                which we'll convert to appropriate units
                e.g. a gauge requesting fuel.copilot.rear will match
                a metric called fuel.copilot.rear,
                or else fuel.copilot or else simply fuel but never fuel.pilot
                */

                var ks = m.split('.');
                while (ks.length) {
                    let k = ks.join('.');
                    if (k in sources) {
                        updaters[sources[k]].updaters = ufs
                        break;
                    }
                    ks.pop();
                }
            });
            Object.entries(updaters).map(([k, d]) => {
                if (!d.updaters) {
                    console.log('Warning: unmapped source metric', k)
                    delete updaters[k];
                }
            });
        }

        // Trigger updates for each source metric
        Object.entries(updaters).map(([k, d]) => {
            Object.entries(d.updaters).map(([unit, fs]) => {
                let v = maybeConvert(metrics[k], d.unit, unit);
                if (typeof v == 'undefined') {
                    console.log(`Warning: failed to convert ${metrics[k]} from ${d.unit} to ${unit}`);
                } else {
                    fs.map(f => f(v));
                }
            });
        });
    }
    gaugeController.register = function(updater, metric, unit) {
        unit = unit || '';
        if (!(metric in callbacks)) callbacks[metric] = {};
        if (!(unit in callbacks[metric])) callbacks[metric][unit] = [];
        callbacks[metric][unit].push(updater);
    }
    gaugeController.fake = function(metric, generator) {
        fakes[metric] = generator;
    }
    gaugeController.fakeMetrics = function() {
        return Object.fromEntries(
            Object.entries(fakes).map(([m, g]) => [m, g()])
        );
    }
    gaugeController.indicators = function() {
        return Object.keys(callbacks);
    }
    activeController = gaugeController;
    return gaugeController;
}
