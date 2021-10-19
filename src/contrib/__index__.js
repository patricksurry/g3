//import './engine.js';
import * as nav from './nav.js';
import * as radionav from './radionav.js';
import * as dhc2nav from './dhc2-nav.js';
import * as dhc2elec from './dhc2-electrical.js';
import * as dhc2engine from './dhc2-engine.js';
import * as jagetype from './jagetype.js';
import * as clocks from './clocks.js';
import * as speedmaster from './speedmaster.js';
import * as test from './test.js';


export var contrib = {
    nav: {
        airspeed: {
            DHC2: dhc2nav.airspeed,
        },
        altitude: {
            generic: nav.altitudeGeneric,
        },
        attitude: {
            generic: nav.attitudeGeneric,
        },
        heading: {
            generic: nav.headingGeneric
        },
        turnCoordinator: {
            generic: nav.turnCoordinatorGeneric
        },
        VSI: {
            generic: nav.VSIGeneric
        },
    },
    radionav: {
        ADF: {
            generic: radionav.ADFGeneric,
        },
        VOR: {
            generic: radionav.VORGeneric,
        },
    },
    engine: {
        tachometer: {
            DHC2: dhc2engine.tachometer,
            jageype: jagetype.tachometer,
        },
        suctionPressure: {
            DHC2: dhc2engine.suctionPressure,
        },
        manifoldPressure: {
            DHC2: dhc2engine.manifoldPressure
        },
        fuel: {
            generic: dhc2engine.tank,  // (lo, hi, arc, instance)
            DHC2: dhc2engine.fuel,
        },
        oilFuelStatus: {
            DHC2: dhc2engine.oilFuelStatus,
        },
        carbMixtureTemp: {
            DHC2: dhc2engine.carbMixtureTemp,
        },
        cylinderHeadTemp: {
            DHC2: dhc2engine.cylinderHeadTemp,
        },
    },
    electrical: {
        ammeter: {
            DHC2: dhc2elec.ammeter,
        },
        voltmeter: {
            DHC2: dhc2elec.voltmeter,
        },
    },
    clocks: {
        simple: clocks.simple,
        casioF91W: clocks.casioF91W,
        omegaSpeedmaster: speedmaster.omegaSpeedmaster,
    },
    test: {
        alignment: test.alignment
    },
};
