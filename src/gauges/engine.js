import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('suctionPressureDHC2')
    .metric('suctionPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]))
    .layers(
        gauge.face(),
        gauge.axis.ticks(d3.range(0, 10.1)).size(20),
        gauge.axis.ticks(d3.range(0, 10.1, 0.2)).size(10),
        gauge.axis.ticks([4.5, 5.4]).size(20).css('stroke: red'),
        gauge.axis.labels(d3.range(0, 10.1, 2)).inset(33),
/*        decorations: [
            {kind: 'label', r: -33, label: "SUCTION"},
            {kind: 'label', r: 25, label: "INCHES OF MERCURY"},
            {kind: 'screw', style: 'slotted', r: 50, scale: 0.8},
            {kind: 'screw', style: 'phillips', r: -50, scale: 0.8},
        ],
        style: css(`
.gauge-ticklabel-primary text { font-size: 150%; }
.gauge-decoration-label-inches_of_mercury { font-size: 50%; }
*/
        gauge.indicator.pointer(),
    );

gauge('manifoldPressureDHC2')
    .metric('manifoldPressure').unit('inHg')
    .measure(d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]))
    .layers(
        gauge.face(),
        gauge.axis.sector([30, 35]).inset(5).css('fill: white'),  // normal
        gauge.axis.sector([18, 30]).inset(5).css('fill: blue'),     // idle
        gauge.axis.ticks(d3.range(10,51,5)).size(10),
        gauge.axis.ticks(d3.range(10,51)).size(5),
        gauge.axis.ticks([30, 36.5]).size(20).css('stroke: red'),
        gauge.axis.labels(d3.range(10,51,10)),
        gauge.axis.labels(d3.range(15,51,10)).scale(0.5),
        gauge.indicator.pointer(),
/*
        decorations: [
            {kind: 'label', r: -50, label: "MANIFOLD"},
            {kind: 'label', r: -30, label: "PRESSURE"},
            {kind: 'label', r: 50, label: "INCHES OF MERCURY"},
        ],
*/
    );


gauge('fuelDHC2')
    .layers(
        gauge.face(),
        gauge('fuelFrontDHC2')
            .metric('fuelFront').unit('USgal')  // 29 gal capacity
            .scale(0.4).x(-45).y(30*0.866)
            .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
            .layers(
                gauge.axis.line(),
                gauge.axis.ticks().step(4).size(20),
                gauge.axis.ticks([3, 25]).size(20).css('stroke: red'),
                gauge.axis.labels().step(4),
                gauge.axis.labels([2, 26]).format(v => v == 2 ? 'E' : 'F'),
                gauge.indicator.pointer('rondel')
/*
                decorations: [
                    {kind: "label", label: "FRONT"},
                    {kind: "use", class: "active-status", href: '#dimple', r: 50},
                ],
*/
//TODO          active status dimple indicator => orange, or categorical selector
            ),
        gauge('fuelCenterDHC2')
            .metric('fuelCenter').unit('USgal')  // 29 gal capacity
            .scale(0.4).x(45).y(30*0.866)
            .measure(d3.scaleLinear().domain([3,25]).range([180+48,360+180-48]))
            .layers(
                gauge.axis.line(),
                gauge.axis.ticks().step(4).size(20),
                gauge.axis.ticks([3, 25]).size(20).css('stroke: red'),
                gauge.axis.labels().step(4),
                gauge.axis.labels([2, 26]).format(v => v == 2 ? 'E' : 'F'),
                gauge.indicator.pointer('rondel'),
//                    {kind: "label", label: "CENTER"},
// status toggle
            ),
        gauge('fuelRearDHC2')
            .metric('fuelRear').unit('USgal')  // 21 gal capacity
            .scale(0.4).y(-60*0.866)
            .measure(d3.scaleLinear().domain([2,19]).range([180+44,360+180-44]))
            .layers(
                gauge.axis.line(),
                gauge.axis.ticks().step(4).size(20),
                gauge.axis.ticks([2, 19]).size(20).css('stroke: red'),
                gauge.axis.labels().step(4),
                gauge.axis.labels([1, 20]).format(v => v == 1 ? 'E' : 'F'),
                gauge.indicator.pointer('rondel'),
//                    {kind: "label", label: "REAR"},
// status toggle
            ),
    );

gauge('engineTachometerDHC2')
    .metric('engineTachometer').unit('RPM')
    .measure(d3.scaleLinear().domain([300, 3500]).range([225, 495]))
    .layers(
        gauge.face(),
        gauge.axis.sector([1600, 2000]).css('fill: blue'), // idle
        gauge.axis.sector([2000, 2200]).css('fill: green'), // normal
        gauge.axis.ticks().step(500).size(20),
        gauge.axis.ticks().step(100).size(5),
        gauge.axis.ticks([2300]).size(20).css('stroke: red'),
        gauge.axis.labels().step(500).format(v => v/100),
        gauge.axis.labels([300]).format(v => v/100),
        gauge.indicator.pointer('sword'),
//            {kind: 'label', r: -50, label: "RPM"},
//            {kind: 'label', r: -33, label: "HUNDREDS"},
    );

gauge('oilFuelDHC2')
    .layers(
        gauge.face(),
        gauge('oilPressureDHC2').scale(0.5).x(-15).y(40).r(90)
            .metric('oilPressure').unit('PSI')
            .measure(d3.scaleLinear().domain([0,200]).range([180, 360]))
            .layers(
                gauge.axis.line(),
                gauge.axis.sector([70, 90]).inset(-5), // normal
                gauge.axis.ticks().step(50).inset(-15).size(15),
                gauge.axis.ticks().step(10).inset(-10).size(10),
                gauge.axis.ticks([50,100]).inset(-15).size(15).css('stroke: red'),
                gauge.axis.labels().step(50),
//                    {kind: "label", r: 20, angle: 0, label: "OIL"}
                gauge.indicator.pointer('sword'),
            ),
        gauge('fuelPressureDHC2').scale(0.5).x(15).y(40).r(90)
            .metric('fuelPressure').unit('PSI')
            .measure(d3.scaleLinear().domain([0,10]).range([180, 0]))
            .layers(
                gauge.axis.line(),
                gauge.axis.sector([4, 5]).inset(-5), // normal
                gauge.axis.ticks().step(1).inset(-15).size(15),
                gauge.axis.ticks([3, 6]).inset(-15).size(15).css('stroke: red'),
                gauge.axis.labels().step(5),
//                    {kind: "label", r: 20, angle: 0, label: "FUEL"}
                gauge.indicator.pointer('sword'),
            ),
        gauge('oilTemperatureDHC2').scale(0.9).y(-5).r(90)
            .metric('oilTemperature').unit('degreeCelsius')
            .measure(d3.scaleLinear().domain([0, 100]).range([-90, 90]))
            .layers(
                gauge.axis.line(),
                gauge.axis.sector([60, 75]).inset(-3), // normal
                gauge.axis.ticks().step(10).inset(-10).size(10),
                gauge.axis.ticks().step(5).inset(-10).size(5),
                gauge.axis.ticks([40, 85]).inset(-10).size(10).css('stroke: red'),
                gauge.axis.labels().step(20).inset(20),
//                    {kind: "label", r: -40, label: "TEMP°C"}
                gauge.indicator.pointer('sword'),
            )
/*
            {kind: "label", r: 30, label: "LBS"},
            {kind: "label", r: 40, label: "SQ.IN"},
*/
    );

