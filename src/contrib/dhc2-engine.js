import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function suctionPressure() {
    return g3.gauge()
        .metric('suctionPressure').unit('inHg')
        .fake(g3.forceSeries(0, 10))
        .measure(d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]))
        .append(
            g3.gaugeFace(),
            g3.axisTicks(d3.range(0, 10.1, 0.2)).size(10),
            g3.axisTicks(d3.range(0, 10.1)).size(20).style('stroke-width: 2'),
            g3.axisTicks([4.5, 5.4]).size(20).class('g3-danger-stroke'),
            g3.axisLabels(d3.range(0, 10.1, 2)).inset(33),
            g3.gaugeLabel("SUCTION").size(15).y(-33),
            g3.gaugeLabel("INCHES OF MERCURY").y(25),
            g3.indicatePointer().shape('sword'),
        );
}


export function manifoldPressure() {
    return g3.gauge()
        .metric('manifoldPressure').unit('inHg')
        .fake(g3.forceSeries(10, 50))
        .measure(d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]))
        .append(
            g3.gaugeFace(),
            g3.axisSector([30, 35]).size(7).class('g3-normal-fill'),  // normal
            g3.axisSector([18, 30]).size(7).class('g3-cold-fill'),     // idle
            g3.axisTicks(d3.range(10,51)).size(10),
            g3.axisTicks(d3.range(10,51,5)).size(15).style('stroke-width: 2'),
            g3.axisTicks([30, 36.5]).size(17).class('g3-danger-stroke'),
            g3.axisLabels(d3.range(10,51,10)).inset(30).size(25),
            g3.axisLabels(d3.range(15,51,10)).size(15),
            g3.gaugeLabel("MANIFOLD").size(12).y(-45),
            g3.gaugeLabel("PRESSURE").size(12).y(-30),
            g3.gaugeLabel("INCHES OF MERCURY").size(8).y(50),
            g3.indicatePointer().shape('sword'),
        )
}


export function tachometer() {
    return g3.gauge()
        .metric('engineRPM').unit('rpm')
        .fake(g3.forceSeries(300, 3500))
        .measure(d3.scaleLinear().domain([300, 3500]).range([225, 495]))
        .append(
            g3.gaugeFace(),
            g3.axisSector([1600, 2000]).size(7).class('g3-cold-fill'), // idle
            g3.axisSector([2000, 2200]).size(7).class('g3-normal-fill'), // normal
            g3.axisTicks().step(100).size(10),
            g3.axisTicks().step(500).size(15).style('stroke-width: 2'),
            g3.axisTicks([2300]).size(15).class('g3-danger-stroke'),
            g3.axisLabels().step(500).inset(30).format(v => v/100),
            g3.axisLabels([300]).format(v => v/100),
            g3.gaugeLabel('RPM').size(12).y(-45),
            g3.gaugeLabel('HUNDREDS').size(8).y(-30),
            g3.indicatePointer().shape('rondel'),
        );
}


export function tank(lo, hi, arc, instance) {
    lo ??= 2;
    hi ??= 19;
    arc ??= 96;
    const dx = (hi-lo)*0.05;
    return g3.gauge()
        .metric('fuel').unit('gal').instance(instance)
        .fake(g3.forceSeries(0, hi+2))
        .measure(d3.scaleLinear().domain([lo, hi]).range([180+arc/2,360+180-arc/2]))
        .append(
            g3.axisLine(),
            g3.axisTicks().step(4).size(15),
            g3.axisTicks([lo, hi]).size(15),
            g3.axisLabels().inset(30).size(25).step(4),
            g3.axisLabels({[lo-dx]: 'E', [hi+dx]: 'F'}).inset(10).size(25),
            g3.gaugeLabel((instance ?? '').toUpperCase()).size(25).y(-30),
            g3.put().y(40).scale(0.1).append(
                g3.statusLight()
                    .metric('fuelSelector').instance(instance ? '..':null)
                    //TODO don't want qualified instance here, just generic
                    .fake(g3.categoricalSeries(['front', 'center', 'rear']))
                    .trigger(v => v == instance ? 1: 0.1)
                    .color('orange')
            ),
            g3.indicatePointer().shape('rondel'),
        );
}


export function fuel() {
    return g3.gauge()
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('FUEL').size(15).y(75),
            g3.put().scale(0.4).x(-45).y(30*0.866).append(
                // 29 gal capacity
                tank(3, 25, 96, 'front'),
            ),
            g3.put().scale(0.4).x(45).y(30*0.866).append(
                // 29 gal capacity
                tank(3, 25, 96, 'center'),
            ),
            g3.put().scale(0.4).y(-60*0.866).append(
                // 21 gal capacity
                tank(2, 19, 88, 'rear'),
            ),
        );
}


export function oilFuelStatus() {
    return g3.gauge()
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('LBS').y(50),
            g3.gaugeLabel('SQ.IN').size(7).y(60),
            g3.put().scale(0.5).x(-15).y(40).append(
                g3.gauge().r(90)
                    .metric('oilPressure').unit('psi')
                    .fake(g3.forceSeries(0, 200))
                    .measure(d3.scaleLinear().domain([0,200]).range([180, 360]))
                    .append(
                        g3.axisLine(),
                        g3.axisSector([70, 90]).inset(-5).class('g3-normal-fill'), // normal
                        g3.axisTicks().step(50).inset(-15).size(15),
                        g3.axisTicks().step(10).inset(-10).size(10),
                        g3.axisTicks([50,100]).inset(-15).size(15).class('g3-danger-stroke'),
                        g3.axisLabels().step(50),
                        g3.gaugeLabel('OIL').size(20).x(-5).y(-20),
                        g3.indicatePointer().shape('sword'),
                    ),
            ),
            g3.put().scale(0.5).x(15).y(40).append(
                g3.gauge().r(90)
                    .metric('fuelPressure').unit('psi')
                    .fake(g3.forceSeries(0, 10))
                    .measure(d3.scaleLinear().domain([0,10]).range([180, 0]))
                    .append(
                        g3.axisLine(),
                        g3.axisSector([4, 5]).inset(-5).class('g3-normal-fill'), // normal
                        g3.axisTicks().step(1).inset(-15).size(15),
                        g3.axisTicks([3, 6]).inset(-15).size(15).class('g3-danger-stroke'),
                        g3.axisLabels().step(5),
                        g3.gaugeLabel('FUEL').size(20).x(5).y(-20),
                        g3.indicatePointer().shape('sword'),
                    ),
            ),
            g3.put().scale(0.9).y(-5).append(
                g3.gauge().r(90)
                    .metric('oilTemperature').unit('C')
                    .fake(g3.forceSeries(0, 100))
                    .measure(d3.scaleLinear().domain([0, 100]).range([-90, 90]))
                    .append(
                        g3.axisLine(),
                        g3.axisSector([60, 75]).inset(-3).size(3).class('g3-normal-fill'), // normal
                        g3.axisTicks().step(10).inset(-10).size(10),
                        g3.axisTicks().step(5).inset(-5).size(5),
                        g3.axisTicks([40, 85]).inset(-10).size(10).class('g3-danger-stroke'),
                        g3.axisLabels().step(20).inset(20),
                        g3.gaugeLabel('TEMP°C').size(11).y(-45),
                        g3.indicatePointer().shape('sword'),
                    ),
            ),
        );
}


export function carbMixtureTemp() {
    return g3.gauge()
        .metric('carbMixtureTemp').unit('C')
        .fake(g3.forceSeries(-50, 50))
        .measure(d3.scaleLinear().domain([-50,50]).range([225,315]))
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('°C').size(20).x(-10),
            g3.gaugeScrew().shape('phillips').x(30).y(60),
            g3.gaugeScrew().shape('phillips').x(30).y(-60),
            g3.put().x(50).append(
                g3.axisSector([-10,5]).inset(-10).size(10).class('g3-warning-fill'),
                g3.axisSector([5,15]).inset(-10).size(10).class('g3-normal-fill'),
                g3.axisTicks().step(5).inset(-10).size(10),
                g3.axisTicks().step(10).inset(-20).size(20),
                g3.axisTicks([20]).inset(-20).size(20).class('g3-danger-stroke'),
                g3.axisLabels().step(20).inset(15).size(15).format(v => {let z = Math.abs(v); return z + (z==40 ? (v > 0 ? '+':'-'): '');}),
                g3.indicatePointer().shape('needle'),
            ),
        );
}


export function cylinderHeadTemp() {
    return g3.gauge()
        .metric('cylinderHeadTemp').unit('C')
        .fake(g3.forceSeries(0, 350))
        .measure(d3.scaleLinear().domain([0,350]).range([-70,70]))
        .r(90)
        .append(
            g3.gaugeFace(),
            g3.gaugeLabel('°C').size(12).y(-45),
            g3.gaugeLabel('CYL.TEMP.').size(12).y(-25),
            g3.gaugeScrew().shape('phillips').x(50).y(50),
            g3.gaugeScrew().shape('phillips').x(-50).y(50),
            g3.put().y(30).append(
                g3.axisSector([150,230]).inset(-5).size(5).class('g3-cold-fill'),
                g3.axisSector([230,260]).inset(-5).size(5).class('g3-normal-fill'),
                g3.axisTicks().step(10).size(5).inset(-5),
                g3.axisTicks().step(50).size(10).inset(-10),
                g3.axisTicks([100,260]).size(10).inset(-10).class('g3-danger-stroke'),
                g3.axisLabels().step(100).start(100).inset(-20).size(15).format(v => v/100),
                g3.axisLabels([50,150,250]).inset(-18).size(8),
                g3.axisLabels({'-10': 0, '360': 350}).inset(0).size(10),
                g3.indicatePointer().shape('needle'),
            ),
        )
}
