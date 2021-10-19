import * as d3 from 'd3';
import configureMeasurements, {allMeasures} from 'convert-units';
import { appendId } from './mixin.js';

export const
    metricDispatch = d3.dispatch('metric'),
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
    var id = appendId('controller-'),
        dispatch = d3.dispatch(id),
        metrics = new Set(),
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
        // call updaters with an accessor that
        // will fetch a qualified metric from the input values,
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
        dispatch.call(id, null, fetch)
    }
    gaugeController.register = function(updater, metric, name) {
        let v = appendId(`${id}.${metric}-${name ?? 'anonymous'}`);
        dispatch.on(v, updater);
        metrics.add(metric);
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
        return Array.from(metrics);
    }
    gaugeController.transition = function(sel) {
        return sel.transition().duration(interval).ease(d3.easeLinear);
    }
    activeController = gaugeController;
    return gaugeController;
}
