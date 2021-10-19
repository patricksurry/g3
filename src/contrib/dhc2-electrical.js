import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function ammeter() {
    return g3.gauge()
        .metric('alternatorLoad').unit('proportion')
        .fake(g3.forceSeries(-0.1, 1.25))
        .measure(d3.scaleLinear().domain([-0.1, 1.2]).range([-45, 45]))
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('ALT. LOAD').size(15).y(-30),
            g3.put().y(50).append(
                g3.axisLine(),
                g3.axisTicks().step(0.1).size(5).inset(-5),
                g3.axisTicks().step(0.5).start(0).size(10).inset(-10),
                g3.axisTicks([1.0]).size(10).inset(-10).class('g3-danger-stroke'),
                g3.axisLabels().start(0).step(0.5).inset(-20).size(15).format(v => v.toFixed(1)),
                g3.axisLabels({'-0.2': 'D', 1.3: 'C'}).size(15).inset(0),
                g3.indicatePointer().shape('rondel'),
            )
        );
}


export function voltmeter() {
    return g3.gauge()
        .metric('alternatorVolts').unit('V')
        .fake(g3.forceSeries(0, 30))
        .measure(d3.scaleLinear().domain([0,30]).range([-45,45]))
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('VOLTS').size(15).y(-35),
            g3.gaugeLabel('DC').size(15).y(-20),
            g3.put().y(50).append(
                g3.axisLine(),
                g3.axisTicks().step(1).inset(-5).size(5),
                g3.axisTicks().step(5).inset(-8).size(8),
                g3.axisTicks().step(10).inset(-10).size(10),
                g3.axisLabels([10,20]).size(15).inset(-20),
                g3.axisLabels([0,30]).size(15).inset(10),
                g3.indicatePointer().shape('rondel'),
            )
        );
}
