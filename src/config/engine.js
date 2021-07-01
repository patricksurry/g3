import * as d3 from 'd3';
import * as g3 from '../g3.js';


g3.gauge('suctionPressureDHC2')
    .metric('suctionPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]))
    .append(
        g3.gaugeFace(),
        g3.axisTicks(d3.range(0, 10.1)).size(20),
        g3.axisTicks(d3.range(0, 10.1, 0.2)).size(10),
        g3.axisTicks([4.5, 5.4]).size(20).class('tick-warning'),
        g3.axisLabels(d3.range(0, 10.1, 2)).inset(33),
        g3.gaugeLabel("SUCTION").y(-33),
        g3.gaugeLabel("INCHES OF MERCURY").y(25),

/*        decorations: [
            {kind: 'screw', style: 'slotted', r: 50, scale: 0.8},
            {kind: 'screw', style: 'phillips', r: -50, scale: 0.8},
        ],
*/
        g3.indicatePointer(),
    );

g3.gauge('manifoldPressureDHC2')
    .metric('manifoldPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]))
    .append(
        g3.gaugeFace(),
        g3.axisSector([30, 35]).size(7).class('sector-green'),  // normal
        g3.axisSector([18, 30]).size(7).class('sector-blue'),     // idle
        g3.axisTicks(d3.range(10,51,5)).size(15),
        g3.axisTicks(d3.range(10,51)).size(10),
        g3.axisTicks([30, 36.5]).size(17).class('tick-warning'),
        g3.axisLabels(d3.range(10,51,10)).inset(30).size(25),
        g3.axisLabels(d3.range(15,51,10)).size(15),
        g3.gaugeLabel("MANIFOLD").size(12).y(-45),
        g3.gaugeLabel("PRESSURE").size(12).y(-30),
        g3.gaugeLabel("INCHES OF MERCURY").size(8).y(50),
        g3.indicatePointer().shape('sword'),
    );

g3.gauge('engineTachometerDHC2')
    .metric('engineTachometer').unit('RPM')
    .measure(d3.scaleLinear().domain([300, 3500]).range([225, 495]))
    .append(
        g3.gaugeFace(),
        g3.axisSector([1600, 2000]).size(7).class('sector-blue'), // idle
        g3.axisSector([2000, 2200]).size(7).class('sector-green'), // normal
        g3.axisTicks().step(500).size(15),
        g3.axisTicks().step(100).size(10),
        g3.axisTicks([2300]).size(17).class('tick-warning'),
        g3.axisLabels().step(500).inset(30).size(20).format(v => v/100),
        g3.axisLabels([300]).format(v => v/100),
        g3.gaugeLabel('RPM').size(12).y(-45),
        g3.gaugeLabel('HUNDREDS').size(12).y(-30),
        g3.indicatePointer().shape('sword'),
    );

g3.gauge('fuelDHC2')
    .append(
        g3.gaugeFace(),
        g3.gaugeLabel('FUEL').size(15).y(75),
        g3.put().scale(0.4).x(-45).y(30*0.866).append(
            g3.gauge('fuelFrontDHC2')
                .metric('fuelFront').unit('USgal')  // 29 gal capacity
                .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
                .append(
                    g3.axisLine(),
                    g3.axisTicks().step(4).size(15),
                    g3.axisTicks([3, 25]).size(15),
                    g3.axisLabels().inset(30).size(25).step(4),
                    g3.axisLabels({2: 'E', 26: 'F'}).inset(10).size(25),
                    g3.gaugeLabel("FRONT").size(25).y(-30),
                    g3.put().y(40).scale(0.1).append(
                        g3.statusLight('fuelIndicatorFront')
                            .metric('fuelSelector').trigger(v => v == 'front' ? 1: 0.1).color('orange')
                    ),
                    g3.indicatePointer().shape('rondel'),
                )
        ),
        g3.put().scale(0.4).x(45).y(30*0.866).append(
            g3.gauge('fuelCenterDHC2')
                .metric('fuelCenter').unit('USgal')  // 29 gal capacity
                .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
                .append(
                    g3.axisLine(),
                    g3.axisTicks().step(4).size(15),
                    g3.axisTicks([3, 25]).size(15),
                    g3.axisLabels().inset(30).size(25).step(4),
                    g3.axisLabels({2: 'E', 26: 'F'}).inset(10).size(25),
                    g3.gaugeLabel("CENTER").size(25).y(-30),
                    g3.put().y(40).scale(0.1).append(
                        g3.statusLight('fuelIndicatorCenter')
                            .metric('fuelSelector').trigger(v => v == 'center' ? 1: 0.1).color('orange')
                    ),
                    g3.indicatePointer().shape('rondel'),
                ),
        ),
        g3.put().scale(0.4).y(-60*0.866).append(
            g3.gauge('fuelRearDHC2')
                .metric('fuelRear').unit('USgal')  // 21 gal capacity
                .measure(d3.scaleLinear().domain([2,19]).range([180+44,360+180-44]))
                .append(
                    g3.axisLine(),
                    g3.axisTicks().step(4).size(15),
                    g3.axisTicks([2, 19]).size(15),
                    g3.axisLabels().inset(30).size(25).step(4),
                    g3.axisLabels({1.25: 'E', 19.75: 'F'}).inset(10).size(25),
                    g3.gaugeLabel("REAR").size(25).y(-30),
                    g3.put().y(40).scale(0.1).append(
                        g3.statusLight('fuelIndicatorRear')
                            .metric('fuelSelector').trigger(v => v == 'rear' ? 1: 0.1).color('orange')
                    ),
                    g3.indicatePointer().shape('rondel'),
                ),
        ),
    );


g3.gauge('oilFuelDHC2')
    .append(
        g3.gaugeFace(),
        g3.gaugeLabel('LBS').y(50),
        g3.gaugeLabel('SQ.IN').size(7).y(60),
        g3.put().scale(0.5).x(-15).y(40).append(
            g3.gauge('oilPressureDHC2').r(90)
                .metric('oilPressure').unit('PSI')
                .measure(d3.scaleLinear().domain([0,200]).range([180, 360]))
                .append(
                    g3.axisLine(),
                    g3.axisSector([70, 90]).inset(-5).class('sector-green'), // normal
                    g3.axisTicks().step(50).inset(-15).size(15),
                    g3.axisTicks().step(10).inset(-10).size(10),
                    g3.axisTicks([50,100]).inset(-15).size(15).class('tick-warning'),
                    g3.axisLabels().step(50),
                    g3.gaugeLabel('OIL').size(20).x(-5).y(-20),
                    g3.indicatePointer().shape('sword'),
                ),
        ),
        g3.put().scale(0.5).x(15).y(40).append(
            g3.gauge('fuelPressureDHC2').r(90)
                .metric('fuelPressure').unit('PSI')
                .measure(d3.scaleLinear().domain([0,10]).range([180, 0]))
                .append(
                    g3.axisLine(),
                    g3.axisSector([4, 5]).inset(-5).class('sector-green'), // normal
                    g3.axisTicks().step(1).inset(-15).size(15),
                    g3.axisTicks([3, 6]).inset(-15).size(15).class('tick-warning'),
                    g3.axisLabels().step(5),
                    g3.gaugeLabel('FUEL').size(20).x(5).y(-20),
                    g3.indicatePointer().shape('sword'),
                ),
        ),
        g3.put().scale(0.9).y(-5).append(
            g3.gauge('oilTemperatureDHC2').r(90)
                .metric('oilTemperature').unit('degreeCelsius')
                .measure(d3.scaleLinear().domain([0, 100]).range([-90, 90]))
                .append(
                    g3.axisLine(),
                    g3.axisSector([60, 75]).inset(-3).size(3).class('sector-green'), // normal
                    g3.axisTicks().step(10).inset(-10).size(10),
                    g3.axisTicks().step(5).inset(-5).size(5),
                    g3.axisTicks([40, 85]).inset(-10).size(10).class('tick-warning'),
                    g3.axisLabels().step(20).inset(20),
                    g3.gaugeLabel('TEMP°C').size(11).y(-45),
                    g3.indicatePointer().shape('sword'),
                ),
        ),
    );
