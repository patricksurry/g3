import * as d3 from 'd3';
import { stylable, appendable, identity, appendId, metricDispatch } from './protocol.js';
import { pointerShapes } from './pointers.js';


export var indicator = {};


indicator.text = function() {
    var format = identity,
        size = 20;

    function text(sel, g) {
        const metric = g.metric();
        let _ = sel.append('text').attr('font-size', size);
        text.stylable(_);
        _ = _.text('');

        function update(metrics) {
            if (metric in metrics) {
                _.text(format(metrics[metric]));
            }
        }

        metricDispatch.on(appendId(`metric.indicator-text-${g.name}-`), update);

    }
    text.format = function(_) {
        return arguments.length ? (format = _, text) : format;
    }
    text.size = function(_) {
        return arguments.length ? (size = _, text) : size;
    }
    return stylable(text).class('gauge-indicator-text');
}


indicator.pointer = function() {
    var rescale = identity;

    function pointer(sel, g) {
        const metric = g.metric();
        let _ = sel.append('g');
        if (!pointer.append().length) pointer.append(pointerShapes.needle);

        pointer.stylable(_);
        pointer.appendable(_, g);

        function update(metrics) {
            if (metric in metrics) {
                _.transition().duration(500)
                    .attr('transform', g.metrictransform(rescale(metrics[metric])))
                    .ease(d3.easeElastic);
            }
        }
        metricDispatch.on(appendId(`metric.indicator-pointer-${g.name}`), update);
    }
    pointer.rescale = function(_) {
        return arguments.length ? (rescale = _, pointer) : rescale;
    }
    pointer.shape = function(_) {
        if (arguments.length && !(_ in pointerShapes)) throw 'pointer: unknown shape ${_}';
        return arguments.length ? pointer.append(pointerShapes[_]) : pointer.append();
    }
    return stylable(appendable(pointer)).class('gauge-indicator-pointer');
}


indicator.peekaboo = function(_) {
    var metric,
        trigger = identity;     // f: v => [0, 1]

    function peekaboo(sel, g) {
        const m = metric || g.metric();
        let _ = sel.append('g');
        peekaboo.stylable(_);
        peekaboo.appendable(_);

        function update(metrics) {
            if (metric in metrics) {
                _.transition().duration(500)
                    .attr('opacity', trigger(metrics[metric]));
            }
        }
        metricDispatch.on(appendId(`metric.indicator-peekaboo-${g.name}`), update);
    }
    peekaboo.metric = function(_) {
        return arguments.length ? (metric = _, peekaboo): metric;
    }
    peekaboo.trigger = function(_) {
        return arguments.length ? (trigger = _, peekaboo): trigger;
    }

    return stylable(appendable(peekaboo)).class('gauge-indicator-peekaboo');
}
