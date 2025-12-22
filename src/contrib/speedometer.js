import * as d3 from 'd3';
import * as g3 from '../g3.js';


export function speedometerBMW() {
    return g3.gauge()
        .metric('speed').unit('mph').fake(g3.forceSeries(9, 160))
        .measure(d3.scaleLinear().domain([0,160]).range([-120,120]))
        .append(
            g3.gaugeFace(),
            g3.axisSector([-3,163]).size(1).inset(-1).class('g3-axis-line'),
            g3.axisSector([-3,163]).inset(2).size(5).style('fill: #333'),
            g3.axisTicks().step(10).inset(2).size(5),
            g3.axisLabels().step(20).size(14).inset(20).format(v => v.toString().padEnd(3, '\u00A0')),
            g3.axisLabels({'-3': 'mph'}).inset(24).size(6),
            g3.gauge().metric('speed').unit('kph')
                .measure(d3.scaleLinear().domain([0,1.60934*160]).range([-120,120]))
                .r(66)
                .append(
                    g3.axisTicks(d3.range(0,261,10)).step(10).size(3),
                    g3.axisLabels(d3.range(0,261,20)).size(8).inset(12).format(v => v.toString().padEnd(3, '\u00A0')),
                    g3.axisLabels({'-5': '\u00A0km/h'}).inset(16).size(5),
                ),
            g3.indicatePointer(),
            g3.gauge().metric('range').unit('mi').fake(g3.forceSeries(0, 500))
                .measure(d3.scaleLinear().domain([-100,600]).range([240,120]))
                .r(90)
                .append(
                    g3.axisSector([-50,550]).size(1).inset(-3).class('g3-axis-line'),
                    g3.axisTicks(d3.range(0,500,10)).style('stroke: #800').size(5),
                    g3.axisLabels(d3.range(0,500,200)).size(10).inset(15),
                    g3.indicateSector().size(5).style('fill: red'),
                    g3.axisTicks(d3.range(0,501,100)).size(8).style('stroke-width: 2'),
                    g3.axisLabels({500: 'miles'}).orient('counterclockwise').size(6).inset(-7),
                ),
            g3.gauge().metric('destination').unit('mi').fake(g3.forceSeries(0, 500))
                .measure(d3.scaleLinear().domain([-100,600]).range([240,120]))
                .append(
                    g3.indicatePointer().append(g3.element('circle', {cy: -85, r: 4})).style('fill: white; stroke: black; filter: none;')
                ),
        );
}
