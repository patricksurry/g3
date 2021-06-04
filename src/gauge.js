import * as yup from "yup";
import * as d3 from "d3";

export const DEG2RAD = Math.PI/180, id = v => v;


let tickMarksSchema = yup.object().optional().default(undefined).shape({
        dr: yup.number().default(10),
        step: yup.number().default(1),
        start: yup.number(),
        stop: yup.number(),
        values: yup.array().of(yup.number()),
        css: yup.object(),
    }),
    tickLabelsSchema = yup.object().optional().default(undefined).shape({
        dr: yup.number().default(33),
        step: yup.number().default(1),
        start: yup.number(),
        stop: yup.number(),
        values: yup.array().of(yup.number()),
        fmt: yup.object(),      // (v) => "v"
        css: yup.object(),
    }),
    gaugeSchema = yup.object().shape({
        axis: yup.object().required().shape({
            scale: yup.object().shape({
                domain: yup.object().required(),
                range: yup.object().required()},
            ).default(() => d3.scaleLinear([0,360])),
            cx: yup.number().default(0),
            cy: yup.number().default(0),
            radius: yup.number().default(100),
            regions: yup.array().of(yup.object().shape({
                name: yup.string().required(),
                start: yup.number().required(),
                stop: yup.number().required(),
                radius: yup.number().default(100),
                dr: yup.number().default(5),
                css: yup.object(),
            })),
            css: yup.object(),
        }),
        tickMarks: yup.object().shape({
            major: tickMarksSchema,
            minor: tickMarksSchema,
            special: tickMarksSchema,
        }),
        tickLabels: yup.object().shape({
            primary: tickLabelsSchema,
            secondary: tickLabelsSchema,
            special: yup.array().of(yup.object().shape({
                dr: yup.number().default(10),
                value: yup.number().required(),
                label: yup.string().required(),
                css: yup.object(),
            }))
        }),
        labels: yup.array().of(yup.object().shape({
            label: yup.string(),
            x: yup.number().default(0),
            y: yup.number().default(0),
            css: yup.object(),
        })),
    });


function tickValues(scale, opts) {
    if (opts.values && opts.values.length) return opts.values;
    var step = opts.step,
        start = opts.start === undefined ? scale.domain()[0] : opts.start,
        stop = opts.stop === undefined ? scale.domain()[1] : opts.stop;
    return d3.range(start, stop + step/2, step);
}


export function addGauge(selector, spec) {
    const opts = gaugeSchema.cast(spec),
        gauge = d3.select(selector).attr('class', 'gauge'),
        axisScale = opts.axis.scale,
        axisRange = axisScale.range(),
        axisRadius = opts.axis.radius;

    // Add gauge face, with canonical 100 radius
    gauge.append('circle')
        .attr('class', 'gauge-face')
        .attr('r', 100);

    // Add circular axis line
    gauge.append('path')
        .attr('class', 'gauge-axis')
        .attr('d', d3.arc()({
            innerRadius: axisRadius,
            outerRadius: axisRadius,
            startAngle: axisRange[0]*DEG2RAD,
            endAngle: axisRange[1]*DEG2RAD
        }));

    // Add annular highlights to axis
    gauge.append('g')
        .attr('class', 'gauge-regions')
        .selectAll('.gauge-region')
        .data(opts.axis.regions || [])
      .enter().append('path')
        .attr('class', d => 'gauge-region gauge-region-' + d.name)
        .attr('d', d => d3.arc()({
            outerRadius: d.radius ,
            innerRadius: d.radius - d.dr,
            startAngle: axisScale(d.start)*DEG2RAD,
            endAngle: axisScale(d.stop)*DEG2RAD,
        }));

    // Add tick marks, special => minor
    var marked = [],
        tickMarks = gauge.append('g')
            .attr('class', 'gauge-tickmarks');

    ['special', 'major', 'minor'].forEach(t => {
        var markOpts = opts.tickMarks[t];
        if (!markOpts) return;
        const vals = tickValues(axisScale, markOpts).filter(v => !marked.includes(v));
        marked = marked.concat(vals);
        tickMarks
            .selectAll('.gauge-tickmark-' + t)
            .data(vals)
          .enter().append('path')
            .attr('class', v => 'gauge-tickmark-' + t + ' gauge-tickmark-' + t + '-' + v)
            .attr('transform', v => 'rotate(' + axisScale(v) + ')')
            .attr('d', d3.line()([[0, -axisRadius], [0, -axisRadius+markOpts.dr]]))
    });

    // Add tick labels, special, primary, secondary
    var tickLabels = gauge.append('g')
            .attr('class', 'gauge-ticklabels');

    var labelSpecs = Object.assign({}, opts.tickLabels);
    var keys = ['primary', 'secondary'];
    if ('special' in labelSpecs) {
        labelSpecs.special.forEach((v, i) => {
            let key = 'special-' + i;
            labelSpecs[key] = {
                values: [v.value],
                fmt: (x) => v.label,
                dr: v.dr,
                css: v.css,
            }
            keys.unshift(key)
        })
        delete labelSpecs.special;
    }
    marked = [];
    keys.forEach(t => {
        var markOpts = labelSpecs[t];
        if (!markOpts) return;
        const vals = tickValues(axisScale, markOpts).filter(v => !marked.includes(v));
        marked = marked.concat(vals);
        tickLabels
            .selectAll('.gauge-ticklabel-' + t)
            .data(vals)
          .enter().append('g')
            .attr('class', v => 'gauge-ticklabel-' + t + ' gauge-ticklabel-' + t + '-' + v)
            .attr('transform', v => 'rotate(' + axisScale(v) + ') translate(0,' + (-axisRadius + markOpts.dr) + ')')
            .append('text')
            .attr('transform', v => 'rotate(' + -axisScale(v) + ')')
            .text(v => (markOpts.fmt || id)(v));
    })

    // Add additional labels
    gauge.append('g').attr('class', 'gauge-labels')
        .selectAll('.gauge-label')
        .data(opts.labels || [])
      .enter().append('text')
        .attr('class', v => 'gauge-label gauge-label-' + v.label.toLowerCase().replace(/[^a-z0-9]/g, '_'))
        .attr('transform', v => 'translate(' + v.x + ', ' + v.y + ')')
        .text(v => v.label);

    // quick hack to add indicator
    let indicator = gauge.append('g').attr('class', 'gauge-indicator');

    indicator
        .append('rect')
        .attr('transform', 'rotate(0)')
        .attr('x', -1).attr('width', 2)
        .attr('y', -90).attr('height', 100)
        .style('fill', 'red');

    function update(v) {
        indicator.transition().duration(500).attr('transform', 'rotate(' + axisScale(v) + ')').ease(d3.easeElastic);
    }
    update(d3.randomUniform(... axisScale.domain())());
    return update;
}
