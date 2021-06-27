import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('suctionPressureDHC2')
    .metric('suctionPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]))
    .append(
        gauge.face(),
        gauge.axis.ticks(d3.range(0, 10.1)).size(20),
        gauge.axis.ticks(d3.range(0, 10.1, 0.2)).size(10),
        gauge.axis.ticks([4.5, 5.4]).size(20).css('stroke: red'),
        gauge.axis.labels(d3.range(0, 10.1, 2)).inset(33),
        gauge.label("SUCTION").y(-33),
        gauge.label("INCHES OF MERCURY").y(25),

/*        decorations: [
            {kind: 'screw', style: 'slotted', r: 50, scale: 0.8},
            {kind: 'screw', style: 'phillips', r: -50, scale: 0.8},
        ],
*/
        gauge.indicator.pointer(),
    );

gauge('manifoldPressureDHC2')
    .metric('manifoldPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]))
    .append(
        gauge.face(),
        gauge.axis.sector([30, 35]).inset(5).css('fill: white'),  // normal
        gauge.axis.sector([18, 30]).inset(5).css('fill: blue'),     // idle
        gauge.axis.ticks(d3.range(10,51,5)).size(10),
        gauge.axis.ticks(d3.range(10,51)).size(5),
        gauge.axis.ticks([30, 36.5]).size(20).css('stroke: red'),
        gauge.axis.labels(d3.range(10,51,10)),
        gauge.axis.labels(d3.range(15,51,10)).size(10),
        gauge.label("MANIFOLD").y(-50),
        gauge.label("PRESSURE").y(-30),
        gauge.label("INCHES OF MERCURY").y(50),
        gauge.indicator.pointer(),
    );


gauge('fuelDHC2')
    .append(
        gauge.face(),
        gauge.put().scale(0.4).x(-45).y(30*0.866).append(
            gauge('fuelFrontDHC2')
                .metric('fuelFront').unit('USgal')  // 29 gal capacity
                .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.ticks().step(4).size(20),
                    gauge.axis.ticks([3, 25]).size(20).css('stroke: red'),
                    gauge.axis.labels().step(4),
                    gauge.axis.labels({2: 'E', 26: 'F'}),
                    gauge.label("FRONT"),
                    gauge.indicator.pointer().shape('rondel'),
                    gauge.indicator.peekaboo()
                        .metric('fuelSelector')
                        //.trigger(v => v == 'front')
                        .append(gauge.element('circle', {r: 40, style: 'fill: red'}))
    /*
                    decorations: [
                        {kind: "use", class: "active-status", href: '#dimple', r: 50},
                    ],
    */
    //TODO          active status dimple indicator => orange, or categorical selector
                )
        ),
        gauge.put().scale(0.4).x(45).y(30*0.866).append(
            gauge('fuelCenterDHC2')
                .metric('fuelCenter').unit('USgal')  // 29 gal capacity
                .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.ticks().step(4).size(20),
                    gauge.axis.ticks([3, 25]).size(20).css('stroke: red'),
                    gauge.axis.labels().step(4),
                    gauge.axis.labels({2: 'E', 26: 'F'}),
                    gauge.indicator.pointer().shape('rondel'),
                    gauge.label("CENTER"),
    // status toggle
                ),
        ),
        gauge.put().scale(0.4).y(-60*0.866).append(
            gauge('fuelRearDHC2')
                .metric('fuelRear').unit('USgal')  // 21 gal capacity
                .measure(d3.scaleLinear().domain([2,19]).range([180+44,360+180-44]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.ticks().step(4).size(20),
                    gauge.axis.ticks([2, 19]).size(20).css('stroke: red'),
                    gauge.axis.labels().step(4),
                    gauge.axis.labels({1: 'E', 20: 'F'}),
                    gauge.indicator.pointer().shape('rondel'),
                    gauge.label("REAR"),
    // status toggle
                ),
        ),
    );

gauge('engineTachometerDHC2')
    .metric('engineTachometer').unit('RPM')
    .measure(d3.scaleLinear().domain([300, 3500]).range([225, 495]))
    .append(
        gauge.face(),
        gauge.axis.sector([1600, 2000]).css('fill: blue'), // idle
        gauge.axis.sector([2000, 2200]).css('fill: green'), // normal
        gauge.axis.ticks().step(500).size(20),
        gauge.axis.ticks().step(100).size(5),
        gauge.axis.ticks([2300]).size(20).css('stroke: red'),
        gauge.axis.labels().step(500).format(v => v/100),
        gauge.axis.labels([300]).format(v => v/100),
        gauge.label('RPM').y(-50),
        gauge.label('HUNDREDS').y(-33),
        gauge.indicator.pointer().shape('sword'),
    );

gauge('oilFuelDHC2')
    .append(
        gauge.face(),
        gauge.put().scale(0.5).x(-15).y(40).append(
            gauge('oilPressureDHC2').r(90)
                .metric('oilPressure').unit('PSI')
                .measure(d3.scaleLinear().domain([0,200]).range([180, 360]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.sector([70, 90]).inset(-5), // normal
                    gauge.axis.ticks().step(50).inset(-15).size(15),
                    gauge.axis.ticks().step(10).inset(-10).size(10),
                    gauge.axis.ticks([50,100]).inset(-15).size(15).css('stroke: red'),
                    gauge.axis.labels().step(50),
                    gauge.label('OIL').y(20),
                    gauge.indicator.pointer().shape('sword'),
                ),
        ),
        gauge.put().scale(0.5).x(15).y(40).append(
            gauge('fuelPressureDHC2').r(90)
                .metric('fuelPressure').unit('PSI')
                .measure(d3.scaleLinear().domain([0,10]).range([180, 0]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.sector([4, 5]).inset(-5), // normal
                    gauge.axis.ticks().step(1).inset(-15).size(15),
                    gauge.axis.ticks([3, 6]).inset(-15).size(15).css('stroke: red'),
                    gauge.axis.labels().step(5),
                    gauge.label('FUEL').y(20),
                    gauge.indicator.pointer().shape('sword'),
                ),
        ),
        gauge.put().scale(0.9).y(-5).append(
            gauge('oilTemperatureDHC2').r(90)
                .metric('oilTemperature').unit('degreeCelsius')
                .measure(d3.scaleLinear().domain([0, 100]).range([-90, 90]))
                .append(
                    gauge.axis.line(),
                    gauge.axis.sector([60, 75]).inset(-3), // normal
                    gauge.axis.ticks().step(10).inset(-10).size(10),
                    gauge.axis.ticks().step(5).inset(-10).size(5),
                    gauge.axis.ticks([40, 85]).inset(-10).size(10).css('stroke: red'),
                    gauge.axis.labels().step(20).inset(20),
                    gauge.label('TEMP°C').y(-40),
                    gauge.indicator.pointer().shape('sword'),
                ),
                gauge.label('LBS').y(30),
                gauge.label('SQ.IN').y(40),
        ),
    );

