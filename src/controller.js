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
    } else if (typeof v === 'string' && v.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)) {
        // convert string-serialized date metrics back to JS objects
        v = new Date(v);
    }
    return v;
}


export function gaugeController() {
    // create a gauge controller that we'll use to update values
    var callbacks = {},     // nested dict of metric => (unit || '') => list of update fns
        fakes = {},         // dict of metric => generator
        updaters = null;    // dict of metric keys => {metric: unit: updaters: {unit: fns}}

    // call the controller to display current metric values
    function gaugeController(data) {
        /*
        data is a dictionary {latest: 1234, metrics: {}, [units: {}]}
        where metrics is a dictionary
        with keys like: "metric.some.qualification"
        and corresponding values
        */
        if (!updaters) {
            // First call, we establish the mapping from metric keys => callbacks
            updaters = {};
            Object.keys(data.metrics).map(m => {
                updaters[m] = {unit: data.units[m] || '', updaters: null};
            })

            Object.entries(callbacks).map(([m, ufs]) => {
                /*
                for each callback, find best qualified metric from the input values,
                which we'll convert to appropriate units
                e.g. a gauge requesting fuel.copilot.rear will match
                a metric called fuel.copilot.rear,
                or else fuel.copilot or else simply fuel but never fuel.pilot
                */
                var ks = m.split('.'),
                    matched = false;
                while (ks.length && !matched) {
                    let k = ks.join('.');
                    if (k in updaters) {
                        updaters[k].updaters = ufs
                        matched = true;
                    }
                    ks.pop();
                }
                if (!matched) console.log('Warning: no source metric matching', m);
            });
            Object.entries(updaters).map(([m, d]) => {
                if (!d.updaters) {
                    console.log('Warning: unmapped source metric', m)
                    delete updaters[m];
                }
            });
        }

        // Trigger updates for each source metric
        Object.entries(updaters).map(([m, d]) => {
            Object.entries(d.updaters).map(([unit, fs]) => {
                let v = maybeConvert(data.metrics[m], d.unit, unit);
                if (typeof v == 'undefined') {
                    console.log(`Warning: failed to convert ${data.metrics[m]} from ${d.unit} to ${unit}`);
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
        return {
            latest: 0,
            units: {},
            metrics: Object.fromEntries(
                Object.entries(fakes).map(([m, g]) => [m, g()])
            )
        }
    }
    gaugeController.indicators = function() {
        return Object.keys(callbacks);
    }
    activeController = gaugeController;
    return gaugeController;
}
