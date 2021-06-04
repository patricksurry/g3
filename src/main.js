import * as d3 from 'd3';
import './gauge.css';
import {addGauge, DEG2RAD} from './gauge.js';
import {gaugeDefs} from './config.js';


const width=1400,
    height=768;

var svg = d3.select("body").append("svg")
    .attr("id", "flight-panel")
    .attr("width", width)
    .attr("height", height);

var defs = svg.append('defs');

var mask = defs.append('mask')
    .attr('id', 'altimeter-window');
mask.append('rect').attr('x', -100).attr('y', -100).attr('width', 200).attr('height', 200).attr('fill', 'white');
mask.append('path').attr('d', d3.arc()({
            innerRadius: 64,
            outerRadius: 88,
            startAngle: (90-12)*DEG2RAD,
            endAngle: (90+12)*DEG2RAD,
        })).attr('fill', 'black');

defs.append('radialGradient')
    .attr('id', 'screw-gradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('y', '50%')
    .selectAll('stop')
    .data(['white', 'black'])
  .enter().append('stop')
    .attr('stop-color', v => v)
    .attr('offset', (v, i) => 100*i + '%')

var screw = defs.append('g')
    .attr('id', 'screw-head');
screw.append('circle')
    .attr('r', 10)
    .style('fill', 'url(#screw-gradient)');
screw.append('rect')
    .attr('x', -2)
    .attr('y', -10)
    .attr('width', 4)
    .attr('height', 20)
    .attr('fill', 'black');

svg.append('g')
    .attr('transform', 'translate(160,160) scale(1.28)')
    .attr('id', 'altimeter-gauge');

svg.append('g')
    .attr('transform', 'translate(480,160) scale(1.28)')
    .attr('id', 'airspeed-gauge');

svg.append('g')
    .attr('transform', 'translate(800,160) scale(1.28)')
    .attr('id', 'x-gauge');

svg.append('g')
    .attr('transform', 'translate(1120,160) scale(1.28)')
    .attr('id', 'y-gauge');


svg.append('g')
    .attr('transform', 'translate(160,480) scale(1.28)')
    .attr('id', 'tachometer-gauge');

svg.append('g')
    .attr('transform', 'translate(480,480) scale(1.28)')
    .attr('id', 'manifold-pressure-gauge');

svg.append('g')
    .attr('transform', 'translate(800,480) scale(1.28)')
    .attr('id', 'suction-gauge');

svg.append('g')
    .attr('transform', 'translate(1120,480) scale(1.28)')
    .attr('id', 'z-gauge');

var altimeter = addGauge('#altimeter-gauge', gaugeDefs.altimeter),
    airspeed = addGauge('#airspeed-gauge', gaugeDefs.airspeed),
    tachometer = addGauge('#tachometer-gauge', gaugeDefs.tachometer),
    manifoldpressure = addGauge("#manifold-pressure-gauge", gaugeDefs.manifoldpressure),
    suction = addGauge('#suction-gauge', gaugeDefs.suction);

d3.select('#altimeter-gauge .gauge-face').attr('mask', 'url(#altimeter-window)');

svg.append('use')
    .attr('transform', 'translate(192, 250) rotate(123)')
    .style('opacity', 0.5)
    .attr('xlink:href', '#screw-head');


setTimeout(() => suction(6), 1000);
