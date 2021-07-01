import * as g3 from '../g3.js';

import './clocks.js';
import './flight.js';
import './engine.js';

//TODO  - electrical.js with volt and ammeter p25 milviz

const ids = Object.keys(g3.gaugeRegistry);

export var
    ClockPanel = g3.panel().width(640).height(320).append(
        g3.put().x(160).y(160).scale(1.28).append(g3.gauge('clockSimple')),
        g3.put().x(480).y(160).scale(1.28).append(g3.gauge('casioF91W')),
    ),
    DHC2FlightPanel = g3.panel().width(320*4).height(320*2).append(
        ...[
            'altitudeDHC2', 'attitudeDHC2', 'headingDHC2', 'VORDHC2',
            'vsiDHC2', 'turnCoordinatorDHC2', 'airspeedDHC2', 'ADFDHC2',
        ].map((k, i) => g3.put().x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28).append(g3.gauge(k)))
    ),
    DHC2EnginePanel = g3.panel().width(320*2).height(320*2).append(
        g3.put().x(160).y(160).scale(1.28).append(g3.gauge('manifoldPressureDHC2')),
        g3.put().x(480).y(160).scale(1.28).append(g3.gauge('engineTachometerDHC2')),
        g3.put().x(120).y(420).scale(0.8).append(g3.gauge('suctionPressureDHC2')),
        g3.put().x(320).y(420).scale(0.8).append(g3.gauge('fuelDHC2')),
        g3.put().x(520).y(420).scale(0.8).append(g3.gauge('oilFuelDHC2')),
    ),
    GalleryPanel = g3.panel().width(320*4).height(320*Math.floor((ids.length+3)/4) + 40).append(
        ...ids.map((k, i) => g3.put().x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28).append(
            g3.gauge(k), g3.gaugeLabel(k).y(120)
        ))
    );


