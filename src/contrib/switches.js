import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function toggleFactory(metric, label) {
    metric = metric || 'status';
    label = label || metric;
    return g3.gauge()
        .metric(metric)
        .fake(g3.categoricalSeries([0, 1]))
        .measure(d3.scaleLinear().domain([0, 1]).range([-40, 40]))
        .kind('linear')
        .append(
            g3.put().rotate(-90).on('click', () => alert('clicked')).append(
                g3.element('path', {d: 'M 40,40 a 40,40 0 0 0 0,-80 l -80,0 a 40,40 0 0 0 0,80 z'})
                    .class('g3-fg-stroke').style('stroke-width: 7'),
                g3.axisLabels({0: 'off', 1: 'on'}).inset(60).rotate(90),
                g3.gaugeLabel(label, {size: 20, y: -60}),
                g3.indicatePointer().append(
                    g3.element('circle', {r: 30}).class('g3-fg-fill')
                ),
            )
        );
}

