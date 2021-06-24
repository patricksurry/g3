import {gauge} from './gauge.js';

export var panelLayouts = {
    dhc2flight: [
        gauge('altitudeDHC2'),
        gauge('attitudeDHC2'),
        gauge('headingDHC2'),
        gauge('VORDHC2'),
        gauge('vsiDHC2'),
        gauge('turnCoordinatorDHC2'),
        gauge('airspeedDHC2'),
        gauge('ADFDHC2'),
    ].map((g, i) => g.y(320*Math.floor(i/4)+160).x(320*(i%4)+160)), //TODO r(128) doesn't scale internal radii?  .scale instead/
/*
    dhc2engine: [
        suctionPressureDHC2,
        manifoldPressureDHC2
        fuelDHC2
        engineTachometerDHC2
        oilFuelDHC2
    ]
*/
};
