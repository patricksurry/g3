import * as yup from "yup";
import * as d3 from 'd3';

import {classes, axisProp} from './common.js';
import {transformSchema, transform} from './svg.js';


const gaugeSchema = transformSchema.shape({
    axis: yup.object().callable(),
    layers: yup.array().of(yup.object().callable()),
});


export function gauge(config) {
    // configure a gauge and return a function that renders it
    config = gaugeSchema.cast(config);
    gaugeSchema.noUnknown().validateSync(config);

    function gauge(context) {
        // renders the gauge
        let selection = context.selection ? context.selection() : d3.select(context);

        selection.append('g')
            .attr('class', classes('gauge', config.class))
            .attr('transform', transform(config))
            .property(axisProp, () => config.axis)  // careful setting a property to a function
            .selectAll('.gauge-layer')
            .data(config.layers)
          .enter().append('g')
            .attr('class', 'gauge-layer')
            .each(function(d) { d3.select(this).call(d); });
    }

    return gauge;
}


export var gaugeRegistry = {};


export function registerGauge(id, g) {
    gaugeRegistry[id] = g;
}

export function registerGauges(category, gs) {
    gaugeRegistry[category] = gs;
}
