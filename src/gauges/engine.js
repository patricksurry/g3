import * as d3 from 'd3';

import { css } from '@emotion/css';

import {gauge, registerGauges} from '../gauge.js';
import {axis, axisFace, axisMarks, tick, label} from '../axis.js';
import {indicatorNeedle} from '../indicator.js';
import {text} from '../svg.js';

const gauges = {
    suction:  gauge({
        axis: axis({
            metric: "suctionPressure",
            unit: "inHg",
            measure: d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]),
        }),
        layers: [
            axisFace(),
            axisMarks({values: d3.range(0, 10.1, 1), marker: tick({length: 20})}),
            axisMarks({values: d3.range(0, 10.1, 0.2), marker: tick({length: 10})}),
            axisMarks({values: [4.5, 5.4], marker: tick({length: 20}), class: css('path {stroke: red}')}),
            axisMarks({values: d3.range(0, 10.1, 2), inset: 33, marker: label()}),
            text("SUCTION", {y: -30}),
            text("INCHES OF MERCURY", {y: 30, scale: 0.5}),
    //            {kind: 'screw', style: 'slotted', r: 50, scale: 0.8},
    //            {kind: 'screw', style: 'phillips', r: -50, scale: 0.8},
            indicatorNeedle(),
        ]
    }),
};


registerGauges('engine', gauges);
