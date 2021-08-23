import * as d3 from 'd3';
import * as g3 from '../g3.js';


g3.fakeMetrics.register({
    alternatorLoad: g3.forceSeries(-0.1, 1.25),
    alternatorVolts: g3.forceSeries(0, 30),
});


g3.gauge('ammeterDHC2')
    .metric('alternatorLoad').unit('proportion')
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


//TODO these actually have the pointer center offset from the center of the axis,
// needing some kind of weird transformation to indicate properly
g3.gauge('voltmeterDHC2')
    .metric('alternatorVolts').unit('V')
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
