import {gauge} from './gauge.js';

//TODO add global defs via panel, and get defs first
//TODO gauge => metric registry via  metricDispatch.on wrapper

export var DHC2Flight = gauge.panel().width(320*4).height(320*2).append(
    ...[
        'altitudeDHC2', 'attitudeDHC2', 'headingDHC2', 'VORDHC2',
        'vsiDHC2', 'turnCoordinatorDHC2', 'airspeedDHC2', 'ADFDHC2',
    ].map((s, i) => gauge.put().x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28).append(gauge(s)))
);
