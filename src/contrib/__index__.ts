//import './engine';
import * as nav from './nav';
import * as radionav from './radionav';
import * as dhc2nav from './dhc2-nav';
import * as dhc2elec from './dhc2-electrical';
import * as dhc2engine from './dhc2-engine';
import * as jagetype from './jagetype';
import * as clocks from './clocks';
import * as speedometer from './speedometer';
import * as speedmaster from './speedmaster';
import * as switches from './switches';
import * as debug from './debug';


export const contrib = {
    nav: {
        airspeed: {
            DHC2: dhc2nav.airspeed,
        },
        altitude: {
            generic: nav.altitudeGeneric,
        },
        attitude: {
            generic: nav.attitudeGeneric,
            ball: nav.attitudeBall,
        },
        compass: {
            wet: nav.wetCompass,
            wetTilting: nav.wetCompassTilting,
        },
        heading: {
            generic: nav.headingGeneric,
        },
        turnCoordinator: {
            generic: nav.turnCoordinatorGeneric,
        },
        VSI: {
            generic: nav.VSIGeneric,
        },
    },
    radionav: {
        ADF: {
            generic: radionav.ADFGeneric,
        },
        VOR: {
            generic: radionav.VORGeneric,
        },
        transponder: {
            KT76C: radionav.transponderKT76C,
        },
    },
    engine: {
        tachometer: {
            DHC2: dhc2engine.tachometer,
            jageype: jagetype.tachometer,
        },
        speedometer: {
            BMW: speedometer.speedometerBMW,
        },
        suctionPressure: {
            DHC2: dhc2engine.suctionPressure,
        },
        manifoldPressure: {
            DHC2: dhc2engine.manifoldPressure,
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
    switches: {
        toggle: switches.toggleFactory,
        button: switches.buttonFactory,
        rotary: switches.rotaryFactory,
        selector: switches.selectorFactory,
    },
    debug: {
        alignment: debug.alignment,
    },
};
