import * as yup from "yup";
import * as d3 from 'd3';

import {dispatchId, axisProp, classes, metricDispatch} from "./common.js";
import {baseSchema} from "./svg.js";


const indicatorSchema = baseSchema.shape({
    rescale: yup.object().callable().default(() => (v => v)),  // optional rescaling for metric, prior to measure
});


export function indicatorNeedle(config) {
    config = indicatorSchema.cast(config);
    indicatorSchema.noUnknown().validateSync(config);

    function indicator(context) {
        // renders the gauge
        let selection = context.selection ? context.selection() : d3.select(context),
            axis = axisProp.get(selection.node());

        var indicator = selection.append('g')
            .attr('class', classes('gauge-indicator', config.class));
        indicator
            .append('rect')
            .attr('x', -1).attr('width', 2)
            .attr('y', -90).attr('height', 100)
            .style('fill', 'red')
        indicator
            .append('circle')
            .attr('r', 5)
            .style('fill', '#111');

        function update(metrics) {
            if (axis.metric in metrics) {
                indicator
                    .transition().duration(500)
                    .attr('transform', axis.transform(config.rescale(metrics[axis.metric])))
                    .ease(d3.easeElastic);
            }
        }

        metricDispatch.on(dispatchId('metric.indicator'), update);

    }

    return indicator;
}

