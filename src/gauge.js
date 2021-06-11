import * as yup from "yup";
import * as d3 from "d3";

export const DEG2RAD = Math.PI/180;


//TODO
window.yup = yup;

let axisScaleSchema = yup.object().shape({
        domain: yup.object().required(),
        range: yup.object().required(),
        // plus a callable () but not sure how to spec that
    }),
    tickMarksSchema = yup.object().optional().default(undefined).shape({
        dr: yup.number().default(10),
        step: yup.number().default(1),
        start: yup.number(),
        stop: yup.number(),
        values: yup.array().of(yup.number()),
        style: yup.mixed().oneOf(['dash', 'dot']).default('dash'),
    }),
    tickLabelsSchema = yup.object().optional().default(undefined).shape({
        dr: yup.number().default(25),
        step: yup.number().default(1),
        start: yup.number(),
        stop: yup.number(),
        values: yup.array().of(yup.number()),
        orient: yup.mixed().test(
            'label-orient',
            "${path} should be 'fixed', 'radial', 'tangential', or rotation angle",
            (v) => typeof v === 'number' || ['fixed', 'radial', 'tangential'].includes(v)
        ).default('fixed'),
        fmt: yup.object().default(() => (v => v)),
    }),
    decorationSchema = yup.object().shape({
        kind: yup.mixed().oneOf(['label', 'screw', 'use']),
        r: yup.number().default(0),
        angle: yup.number().default(0),
        class: yup.string(),
    }),
    decorationKinds = {
        label: decorationSchema.shape({
            label: yup.string(),
            arcpath: yup.boolean().default(false)
        }),
        screw: decorationSchema.shape({
            style: yup.mixed().oneOf(['phillips', 'slotted']).default('slotted'),
            scale: yup.number().default(1.0),
        }),
        use: decorationSchema.shape({
            scale: yup.number().default(1.0),
            rotate: yup.number().default(0),
            href: yup.string()
        }),
    },
    indicatorSchema = yup.object().shape({
        style: yup.mixed().oneOf(['rotating', 'fixed']).default('rotating'),
        href: yup.string().default('#indicator-sword'),
        scale: axisScaleSchema.optional().default(undefined)
    }),
    gaugeSchema = yup.object().shape({
        metric: yup.string().required(),
        unit: yup.string().optional(),
        cx: yup.number().default(0),
        cy: yup.number().default(0),
        r: yup.number().default(100),
        rotate: yup.number().default(0),  // orientation of gauge, esp for rotating indicator
        underneath: yup.boolean(),      // whether this child gauge should appear underneath parent
        axis: yup.object().required().shape({
            scale: axisScaleSchema.default(() => d3.scaleLinear([0,360])),
            cx: yup.number().default(0),
            cy: yup.number().default(0),
            r: yup.number().default(100),
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
                }))
            }),
            regions: yup.array().of(yup.object().shape({
                name: yup.string().required(),
                start: yup.number().required(),
                stop: yup.number().required(),
                r: yup.number().default(100),
                dr: yup.number().default(5),
                css: yup.object(),
            })),
        }),
        decorations: yup.array().of(yup.lazy(
            (v) => typeof v === "object" && decorationKinds[v.kind] || decorationSchema
        )),
        indicator: yup.mixed().when(
            'indicators', {
                is: v => v.length > 0,
                then: yup.mixed().oneOf([undefined]),
                otherwise: indicatorSchema
            }),
        indicators: yup.array().of(indicatorSchema).default([]),
        childGauges: yup.array().of(yup.lazy(() => gaugeSchema.default(undefined))).default([]),
        style: yup.string(),
        exports: yup.object(),
    });

// console.log(gaugeSchema.describe());

function tickValues(scale, opts) {
    if (opts.values && opts.values.length) return opts.values;
    var step = opts.step,
        start = opts.start === undefined ? scale.domain()[0] : opts.start,
        stop = opts.stop === undefined ? scale.domain()[1] : opts.stop;
    return d3.range(start, stop + step*1e-6, step);
}


function classes(...vs) {
    return vs.filter(v => v).join(' ')
}


export function addGauge(selector, spec) {
    const
        opts = gaugeSchema.cast(spec),
        gauge = d3.select(selector)
            .append('g')
            .attr('class', classes('gauge', 'gauge-' + opts.metric, opts.style))
            .attr('transform', 'translate(' + opts.cx + ',' + opts.cy + ') scale(' + (opts.r/100) + ') rotate(' + opts.rotate + ')'),
        axisScale = opts.axis.scale,
        axisRange = axisScale.range(),
        axisRadius = opts.axis.r;

    // Add sub-gauges underneath then above the face
    var childUpdaters = {};
    gauge.selectAll('.gauge')
        .data(opts.childGauges.filter(v => v.underneath))
      .enter().each((v) => {childUpdaters[v.metric] = addGauge(gauge.node(), v);});

    // Add gauge face, with canonical 100 radius
    var face = gauge.append('g')
        .attr('class', 'gauge-face');

    gauge.selectAll('.gauge')
        .data(opts.childGauges.filter(v => !v.underneath))
      .enter().each((v) => {childUpdaters[v.metric] = addGauge(gauge.node(), v);});

    face.append('circle')
        .attr('r', 100);

    // Add additional decor, before drawing axis etc
    var decorations = face.append('g').attr('class', 'gauge-decorations')
        .selectAll('.gauge-decoration')
        .data(opts.decorations || [])
      .enter().append('g')
        .attr('class', v => classes('gauge-decoration', 'gauge-decoration-' + v.kind, v.class))
        .attr('transform', v => 'rotate(' + (-v.angle) + ') translate(0,' + v.r + ') rotate(' + v.angle + ')');

    decorations.filter(v => v.kind == 'label')
        .append('text')
        .attr('class', v => 'gauge-decoration-label-' + v.label.toLowerCase().replace(/[^a-z0-9]/g, '_'))
        .text(v => v.label);

    var g = decorations.filter(v => v.kind == 'screw')
        .append('g')
        .attr('transform', v => 'scale(' + v.scale + ')');
    g.append('use')
        .attr('href', '#dimple');
    g.append('use')
        .attr('transform', v => 'rotate(' +  d3.randomUniform(0, 360)() + ')')
        .attr('href', v => '#screwslot-' + v.style);

    decorations.filter(v => v.kind == 'use')
        .append('use')
        .attr('transform', v => 'scale(' + v.scale + ') rotate(' + v.rotate + ')')
        .attr('href', v => v.href);

    // Add circular axis line
    face.append('path')
        .attr('class', 'gauge-axis')
        .attr('d', d3.arc()({
            innerRadius: axisRadius,
            outerRadius: axisRadius,
            startAngle: axisRange[0]*DEG2RAD,
            endAngle: axisRange[1]*DEG2RAD
        }));

    // Add annular highlights to axis
    face.append('g')
        .attr('class', 'gauge-regions')
        .selectAll('.gauge-region')
        .data(opts.axis.regions || [])
      .enter().append('path')
        .attr('class', d => classes('gauge-region', 'gauge-region-' + d.name))
        .attr('d', d => d3.arc()({
            outerRadius: d.r ,
            innerRadius: d.r - d.dr,
            startAngle: axisScale(d.start)*DEG2RAD,
            endAngle: axisScale(d.stop)*DEG2RAD,
        }));

    // Add tick marks, special => major => minor
    var marked = [],
        tickMarks = face.append('g')
            .attr('class', 'gauge-tickmarks');

    ['special', 'major', 'minor'].forEach(t => {
        var markOpts = opts.axis.tickMarks[t];
        if (!markOpts) return;
        const vals = tickValues(axisScale, markOpts).filter(v => !marked.includes(v));
        marked = marked.concat(vals);
        let ticks = tickMarks
            .selectAll('.gauge-tickmark-' + t)
            .data(vals)
          .enter().append(markOpts.style == 'dash' ? 'path' : 'circle')
            .attr('class', v => classes('gauge-tickmark-' + t, 'gauge-tickmark-' + t + '-' + v))
            .attr('transform', v => 'rotate(' + axisScale(v) + ')')
        if (markOpts.style == 'dash') {
            ticks.attr('d', d3.line()([[0, -axisRadius], [0, -axisRadius+markOpts.dr]]));
        } else {
            ticks.attr('r', markOpts.dr).attr('cy', -axisRadius)
        }
    });

    // Add tick labels, special, primary, secondary
    var tickLabels = face.append('g')
            .attr('class', 'gauge-ticklabels');

    var labelSpecs = Object.assign({}, opts.axis.tickLabels);
    var keys = ['primary', 'secondary'];
    if (labelSpecs.special) {
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
        const vals = tickValues(axisScale, markOpts).filter(v => !marked.includes(v)),
            typ = t.split('-')[0];
        marked = marked.concat(vals);
        tickLabels
            .append('g')
            .attr('class', classes('gauge-ticklabel-' + typ, markOpts.radial?'gauge-ticklabel-radial':''))
            .selectAll()
            .data(vals)
          .enter().append('g')
            .attr('class', v => classes('gauge-ticklabel-' + typ + '-' + v))
            .attr('transform', v => 'rotate(' + axisScale(v) + ') translate(0,' + (-axisRadius + markOpts.dr) + ')')
            .append('text')

            // #TODO radial
            .attr('transform', v => 'rotate(' + (markOpts.radial ? -90 : -axisScale(v)) + ')')
            .text(markOpts.fmt);
    })

    // add indicator
    let indicators = opts.indicator ? [opts.indicator] : opts.indicators,
        fs = [],
        gs = gauge.append('g').attr('class', 'gauge-indicators')
            .selectAll('.gauge-indicator')
            .data(indicators)
          .enter().append('g')
            .attr('class', 'gauge-indicator')
            .each(function(d) {
                fs.push(
                    (v) => {
                        const fixed = (d.style == 'fixed');
                        (fixed ? face : d3.select(this))
                            .transition().duration(500)
                            .attr('transform', 'rotate(' + (fixed?-1:1)*(d.scale || axisScale)(v) + ')')
                            .ease(d3.easeElastic)
                    }
                );
            }),
        updater = (v) => fs.forEach(f => f(v));

    console.log(opts.metric + ' ' + indicators.length);

    gs.filter(v => v.href)
        .append('use').attr('href', v => v.href);

    updater(d3.randomUniform(... axisScale.domain())());
    return Object.assign(
        {
            node: gauge.node(),
            update: updater,
            gauges: childUpdaters,
        },
        Object.fromEntries(
            Object.entries(opts.exports || {})
            .map(([k,v]) => [k, v.bind(gauge.node())])
        )
    )
}
