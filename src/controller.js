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
    var callbacks = {},
        fakes = {};

    // call the controller to display current metric values
    function gaugeController(values) {

        var units = {}, vs = {};
        Object.entries(values).map(([k, v]) => {
            const
                ks = k.split(':'),
                unit = (ks.length > 1) ? ks.slice(-1): undefined,
                m = (ks.length > 1) ? ks.slice(0, -1).join(':'): k;
            units[m] = unit;
            vs[m] = v;
        })

        // for each callback, find a qualified metric from the input values,
        // returning the best match, converted to appropriate units
        // e.g. fuel.copilot.rear will match fuel.copilot.rear
        // then fuel.copilot then fuel but never fuel.pilot
        function fetch(m, unit) {
            if (!m) return;
            var ks = m.split('.');
            while (ks.length) {
                let k = ks.join('.');
                if (k in vs) return maybeConvert(vs[k], units[k], unit);
                ks.pop();
            }
        }

        Object.entries(callbacks).map(([m, ufs]) => {
            Object.entries(ufs).map(([unit, fs]) => {
                let v = fetch(m, unit);
                if (typeof v == 'undefined') return;
                fs.map(f => f(v));
            })
        })
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
    gaugeController.metrics = function() {
        return Object.keys(callbacks);
    }
    activeController = gaugeController;
    return gaugeController;
}
