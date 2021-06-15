import * as yup from "yup";
import {classes} from './common.js';


export const
    baseSchema = yup.object().shape({
        class: yup.string(),
    }),
    transformSchema = baseSchema.shape({
        x: yup.number().default(0),
        y: yup.number().default(0),
        scale: yup.number().default(1),
        scalex: yup.number().default(1),
        scaley: yup.number(),  // use scalex/y if defined, else scale
        rotate: yup.number().default(0),
    }),
    gSchema = transformSchema.shape({
        layers: yup.array().of(yup.object().callable()),
    });


export function transform(config) {
    // return a tranform string directly from config
    config = transformSchema.cast(config);
    transformSchema.validateSync(config);  // unknown is OK here

    var scale = (typeof config.scaley === 'undefined')
        ? config.scale
        : (config.scalex + ',' + config.scaley);

    return `translate(${config.x},${config.y}) scale(${scale}) rotate(${config.rotate})`
}


export function text(v, config) {
    config = transformSchema.cast(config);
    const xform = transform(config);
    function text(context) {
        let selection = context.selection ? context.selection() : d3.select(context);
        selection.append('text')
            .attr('class', classes(config.class))
            .attr('transform', xform)
            .text(v);
    }
    return text;
}

export function g(config) {
    // configure a gauge and return a function that renders it
    config = gSchema.cast(config);
    gSchema.noUnknown().validateSync(config);

    function g(context) {
        let selection = context.selection ? context.selection() : d3.select(context);

        selection.append('g')
            .attr('class', classes(config.class))
            .attr('transform', transform(config))
            .selectAll('foo')
            .data(config.layers)
          .enter().append('g')
            .each(function(d) { d3.select(this).call(d); });
    }

    return g;
}

