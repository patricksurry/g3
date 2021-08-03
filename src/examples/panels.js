import * as g3 from '../g3.js';

// configure various panels

g3.panel('ClocksPanel').width(640).height(720).append(
    g3.put().x(160).y(160).scale(1.28).append(g3.gauge('clockSimple')),
    g3.put().x(480).y(160).scale(1.28).append(g3.gauge('casioF91W')),
    g3.put().x(320).y(480).scale(1.92).append(g3.gauge('omegaSpeedmaster')),
);

g3.panel('DHC2FlightPanel').width(320*4).height(320*2).append(
    ...[
        'airspeedDHC2', 'attitudeDHC2', 'altitudeDHC2', 'VORDHC2',
        'turnCoordinatorDHC2', 'headingDHC2', 'vsiDHC2', 'ADFDHC2',
    ].map((k, i) => g3.put().x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28).append(g3.gauge(k)))
);

g3.panel('DHC2EnginePanel').width(320*2).height(320*4).append(
    g3.put().x(160).y(160).scale(1.28).append(g3.gauge('manifoldPressureDHC2')),
    g3.put().x(480).y(160).scale(1.28).append(g3.gauge('engineTachometerDHC2')),
    g3.put().x(120).y(420).scale(0.8).append(g3.gauge('suctionPressureDHC2')),
    g3.put().x(320).y(420).scale(0.8).append(g3.gauge('fuelDHC2')),
    g3.put().x(520).y(420).scale(0.8).append(g3.gauge('oilFuelDHC2')),
    g3.put().x(160).y(680).scale(1.28).append(g3.gauge('carbMixtureTempDHC2')),
    g3.put().x(480).y(680).scale(1.28).append(g3.gauge('cylinderHeadTempDHC2')),
    g3.put().x(160).y(1000).scale(1.28).append(g3.gauge('voltmeterDHC2')),
    g3.put().x(480).y(1000).scale(1.28).append(g3.gauge('ammeterDHC2')),
);

// A panel showing all registered gauges with labels, including exploded views of sub-gauges
const ids = Object.keys(g3.gaugeRegistry);
g3.panel('DebugPanel')
    .width(320*4).height(320*Math.floor((ids.length+3)/4) + 40)
    .append(
        ...ids.map(
            (k, i) => g3.put()
                .x(320*(i%4)+160).y(320*Math.floor(i/4)+160).scale(1.28)
                .append(
                    g3.gauge(k),
                    g3.gaugeLabel(k).y(120)
                )
        )
    );

// A panel showing all the pointer shapes
const ks = Object.keys(g3.pointers);
g3.panel('PointerGalleryPanel')
    .width(240*4).height(240*Math.floor((ks.length+4)/4) + 40)
    .append(
        ...ks.map(
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
    );
