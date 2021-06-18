import * as d3 from 'd3';
import {gauge} from '../gauge.js';


gauge('altitudeDHC2')
    .metric('altitude').unit('feet')
    .measure(d3.scaleLinear().domain([0, 1000]).range([0, 360]))
    .layers(
        gauge('atmosphericPressure')
            .metric('atmosphericPressure').unit('hPa')
            .measure(d3.scaleLinear().domain([955,1075]).range([0, 360]))
            .autoindicate(true)
            .rotate(90)
            .layers(
                gauge.face().css('fill: #111'),
                gauge.axis.ticks().step(5).size(5).inset(10),
                gauge.axis.ticks().step(1).size(3).inset(10),
                gauge.axis.ticks([1013.25]).size(5).inset(10).css('stroke: red'),
                gauge.axis.labels(d3.range(955, 1075, 5)).scale(0.5).orient('relative').rotate(-90),
            ),
        gauge.face().window(gauge.axis.sector([225,275]).inset(11).size(24)),
        gauge.axis.ticks([250]).mark('wedge').size(10).width(3),
        gauge.axis.ticks().step(100).size(15),
        gauge.axis.ticks().step(20),
        gauge.axis.labels().step(100).format(v => v/100).scale(1.25),
/*
        decorations: [
            {kind: 'label', r: -30, label: "ALTITUDE"},
            {kind: 'label', label: "100"},
            {kind: 'label', label: "FEET"},
            {kind: 'label', label: "1000 FEET"},
            {kind: 'label', label: "10000 FEET"},
            {kind: 'label', label: "CALIBRATED TO"},
            {kind: 'label', label: "20,000 FEET"}
        ],
*/
        gauge.indicator.pointer('dagger').rescale(v => v/100),
        gauge.indicator.pointer('blade').rescale(v => v/10),
        gauge.indicator.pointer('sword'),
/*
.gauge-face { fill: #222; }
.gauge-ticklabel-primary { font-size: 75% };
.gauge-tickmark-special { stroke: white; stroke-width: 1; }`
*/
    );

gauge('headingDHC2')
    .metric('heading').unit('degree')
    .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
    .autoindicate(true)
    .layers(
        gauge.face(),
        gauge.axis.ticks().step(10).size(10),
        gauge.axis.ticks().step(5).size(5),
        gauge.axis.labels().step(30).orient('relative').format((v) => (v%90==0)?'NESW'.charAt(v/90):(v/10)),
        gauge.indicator.pointer('aircraft-heading')
    );

gauge('vsiDHC2')
    .metric('verticalSpeed').unit('feetPerMinute')
    .measure(d3.scaleLinear().domain([-2000, 2000]).range([90, 90+360]))
    .layers(
        gauge.face(),
        gauge.axis.ticks().step(500).size(15),
        gauge.axis.ticks().step(100).size(5),
        gauge.axis.labels().step(1000).format(v => Math.abs(v/100)).scale(1.5),
        gauge.axis.labels().step(1000).start(-1500).format(v => Math.abs(v/100)),
        gauge.indicator.pointer('sword'),
/*
            {kind: "label", r: -20, label: "VERTICAL SPEED",},
            {kind: "label", r: -10, label: "100 FEET PER MIMUTE"},
            {kind: "label", r: 60, angle: -75, label: "UP"},
            {kind: "label", r: 60, angle: -115, label: "DOWN"},
        // TODO arrows
*/
    );

gauge('turnCoordinatorDHC2')
    .metric('turnrate').unit('degreesPerSecond')
    .measure(d3.scaleLinear().domain([-3, 3]).range([-20, 20]))
    .layers(
        gauge.face(),
        gauge.axis.ticks([-16.5, -13.5, 13.5, 16.5]).size(10),
        gauge.indicator.pointer('aircraft-turn'),
    );

gauge('airspeedDHC2')
    .metric('airspeed').unit('knot')
    .measure(d3.scaleLinear().domain([40,200]).range([30, 350]))
    .layers(
        gauge.face(),
        gauge.axis.sector([60, 105]).inset(10).size(5).css('fill: #ccc'),  // flaps
        gauge.axis.sector([60, 145]).size(5).css('fill: green'),  // normal
        gauge.axis.sector([145, 180]).size(5).css('fill: red'),  // max
        gauge.axis.ticks().step(10).size(15),
        gauge.axis.ticks().step(5).size(10),
        gauge.axis.ticks([180]).size(20).css('stroke: red'),  //TODO shared class?
        gauge.axis.labels().step(20).inset(33),
        gauge.indicator.pointer('sword'),
//            {kind: 'label', r: -33, label: "AIRSPEED"},
//            {kind: 'label', r: 33, label: "MPH"},
    );
