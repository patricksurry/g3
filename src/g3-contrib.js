import * as g3 from './g3.js';
// register contributed gauge definitions
import {contrib} from './contrib/__index__.js';


function flatten(o, ks) {
    ks ??= [];
    return [].concat(
        ...Object.entries(o).map(([k, v]) => {
            const kks = ks.concat([k]);
            return (v !== null && typeof(v) == 'object')
                ? flatten(v, kks) : [[kks, v]];
      })
    )
}

const gauges = flatten(contrib).map(([ks, f]) => [ks.join('.'), f()]),
    pointers = Object.keys(g3.pointers);


export var gallery = {
    contrib: g3.panel()
        .width(320*4).height(320*Math.floor((gauges.length+3)/4) + 40)
        .append(
            ...gauges.map(
                ([k, g], i) => g3.put()
                    .x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28)
                    .append(g, g3.gaugeLabel(k).y(120))
            )
        ),
    pointers: g3.panel()
        .width(240*4).height(240*Math.floor((pointers.length+4)/4) + 40)
        .append(
            ...pointers.map(
                (k, i) => g3.put()
                    .x(240*(i%4) + 120).y(240*Math.floor(i/4) + 120)
                    .append(
                        g3.gauge('pointer-' + k).append(
                            g3.axisLine().style('stroke: #333'),
                            g3.indicatePointer().shape(k),
                        ),
                        g3.gaugeLabel(k).y(110).size(15)
                    )
            )
        ),
};

export * from './g3.js';
export * from './contrib/__index__.js';
