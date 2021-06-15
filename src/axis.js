import * as yup from "yup";
import * as d3 from "d3";

import {axisProp, classes, DEG2RAD} from "./common.js";
import {baseSchema} from "./svg.js";

const
    axisRadius = 100,
    axisSchema = yup.object().shape({
        kind: yup.string().oneOf(['circular', 'linear']).default('circular'),
        metric: yup.string().required(),
        unit: yup.string(),
        measure: yup.object().callable().required().default(() => d3.scaleLinear().domain([0,1]).range([0,360])),
    }),
    axisPathSchema = baseSchema,
    axisFaceSchema = baseSchema.shape({
        r: yup.number().default(axisRadius),
    }),
    axisMarksSchema = baseSchema.shape({
        values: yup.array().of(yup.number()),
        marker: yup.object().callable(),
        inset: yup.number().default(0),
    }),
    tickSchema = yup.object().shape({
        length: yup.number().default(10),
    }),
    dotSchema = yup.object().shape({
        r: yup.number().default(2),
    }),
    labelOrientations = {
        fixed: (a) => ((v) => -v+a),
        relative: (a) => ((v) => a),
        reading: (a) => ((v) => (v+a+450)%360 > 180 ? a+180 : a),
    },
    labelSchema = yup.object().shape({
        orientation: yup.string().oneOf(Object.keys(labelOrientations)).default('fixed'),
        // weirdly validation as object().callable() fails with d3.format() because it has toString method??
        format: yup.mixed().default(() => (v => v)),  // d3.format(...) can be useful here
        angle: yup.number().default(0),
        scale: yup.number().default(1),
    });


export function axis(config) {
    // axis is an extended d3.scale, with a path and transform function
    config = axisSchema.cast(config);
    axisSchema.noUnknown().validateSync(config);

    function axis(v) {
        return config.measure(v);
    }
    function rotation(v) {
        return config.kind == 'circular' ? config.measure(v) : 0;
    }
    function transform(v, invert) {
        const z = invert ? -config.measure(v) : config.measure(v);
        return config.kind == 'circular' ? `rotate(${z})` : `translate(${z},0)`;
    }
    function markTransform(v, inset) {
        const s = transform(v),
            dy = inset + (config.kind == 'circular' ? -axisRadius : 0);
        return s + `translate(0, ${dy})`;
    }
    function path() {
        const range = config.measure.range();
        return config.kind == 'circular'
            ? d3.arc()({
                innerRadius: axisRadius,
                outerRadius: axisRadius,
                startAngle: range[0]*DEG2RAD,
                endAngle: range[1]*DEG2RAD
            })
            : d3.line()([[range[0],0], [range[1],0]]);
    }
    axis.metric = config.metric;
    axis.rotation = rotation;
    axis.transform = transform;
    axis.markTransform = markTransform;
    axis.path = path;
    return axis;
}

export function axisPath(config) {
    config = axisPathSchema.cast(config);
    axisPathSchema.noUnknown().validateSync(config);

    function axisPath(context) {
        let selection = context.selection ? context.selection() : d3.select(context),
            axis = axisProp.get(selection.node());

        selection
            .append('path')
            .attr('class', classes('gauge-axis-path', config.class))
            .attr('d', axis.path());
    }
    return axisPath;
}

export function axisFace(config) {
    config = axisFaceSchema.cast(config);
    axisFaceSchema.noUnknown().validateSync(config);

    function axisFace(context) {
        let selection = context.selection ? context.selection() : d3.select(context);
        selection.append('circle')
            .attr('class', classes('gauge-axis-face', config.class))
            .attr('r', config.r);
    }
    return axisFace;
}

export function axisMarks(config) {
    config = axisMarksSchema.cast(config);
    axisMarksSchema.noUnknown().validateSync(config);

    function axisMarks(context) {
        // draws a set of marks for the current axis
        let selection = context.selection ? context.selection() : d3.select(context),
            axis = axisProp.get(selection.node());

        selection
            .append('g')
            .attr('class', classes('gauge-axis-marks', config.class))
            .selectAll('.gauge-axis-mark')
            .data(config.values)
          .enter().append('g')
            .attr('transform', d => axis.markTransform(d, config.inset))
            .each(function(d) { config.marker(this, d, axis.rotation(d)) });
    }

    return axisMarks;
}

/*
const
    markSchema = yup.object().shape({
        marker: yup.object(),
        values: yup.array().of(yup.number()),

        // todo local vs global coords for rotated labels
        // todo callable() custom test
        style: yup.string().optional(),
    }),
    axisSchema = yup.object().shape({
        x: yup.number().default(0),
        y: yup.number().default(0),
        scale: yup.number().default(1),
        rotate: yup.number().default(0),
        measure: yup.object().default(() => d3.scaleLinear([0,360])),
        kind: yup.string().oneOf(['linear', 'circular']).default('circular'),
        marks: yup.array().of(markSchema).default([])
    }),


export function axis(config) {
    // configure an axis and return a function to render it
    config = axisSchema.cast(config);
    axisSchema.noUnknown().validateSync(config);
    config.marks.forEach(d => markSchema.noUnknown().validateSync(d));

    function axis(context) {
        // renders the gauge and returns a controller to update it
        let selection = context.selection ? context.selection() : context,
            range = config.measure.range();

        let g = selection
            .append('g')
            .attr('class', 'gauge-axis')
            .attr('transform', `translate(${config.x},${config.y}) scale(${config.scale}) rotate(${config.rotate})`);
        g.append('path')
            .attr('d', config.kind == 'circular' ?
                d3.arc()({
                    innerRadius: 100,
                    outerRadius: 100,
                    startAngle: range[0]*DEG2RAD,
                    endAngle: range[1]*DEG2RAD
                })
                : d3.line()([[range[0],0], [range[1],0]])
            );

        const marker = d3.local();

        g.selectAll('.gauge-axis-ticks')
            .data(config.marks)
          .enter().append('g')
            .attr('class', d => classes('gauge-axis-ticks', d.style))
            .property(marker, d => d.marker)
            .selectAll('.gauge-axis-tick')
            .data(d => d.values)
          .enter().append('g')
            .attr('transform', d => {
                const v = config.measure(d);
                return config.kind == 'circular' ? `rotate(${v}) translate(0, -100)` : `translate(${v},0)`;
            })
            .each(function(d) { marker.get(this)(this, d) });
    }
    return axis;
}
*/

export function tick(config) {
    config = tickSchema.cast(config);
    tickSchema.noUnknown().validateSync(config);

    function tick(context) {
        let selection = context.selection ? context.selection() : d3.select(context);
        selection.append('path')
            .attr('d', d3.line()([[0, 0], [0, config.length]]));
    }
    return tick;
}

export function dot(config) {
    config = dotSchema.cast(config);
    dotSchema.noUnknown().validateSync(config);

    function dot(context) {
        let selection = context.selection ? context.selection() : d3.select(context);
        selection.append('circle')
            .attr('r', config.r);
    }
    return dot;
}

export function label(config) {

    console.log(config);

    config = labelSchema.cast(config);
    labelSchema.noUnknown().validateSync(config);

    const orientation = labelOrientations[config.orientation](config.angle);

    function label(context, d, rotation) {
        let selection = context.selection ? context.selection() : d3.select(context);
        selection.append('text')
            .attr('transform', 'rotate(' + orientation(rotation) + ') scale(' + config.scale + ')')
            .text(config.format(d))
    }
    return label;
}
