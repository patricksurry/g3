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
export declare const contrib: {
    nav: {
        airspeed: {
            DHC2: typeof dhc2nav.airspeed;
        };
        altitude: {
            generic: typeof nav.altitudeGeneric;
        };
        attitude: {
            generic: typeof nav.attitudeGeneric;
        };
        heading: {
            generic: typeof nav.headingGeneric;
        };
        turnCoordinator: {
            generic: typeof nav.turnCoordinatorGeneric;
        };
        VSI: {
            generic: typeof nav.VSIGeneric;
        };
    };
    radionav: {
        ADF: {
            generic: typeof radionav.ADFGeneric;
        };
        VOR: {
            generic: typeof radionav.VORGeneric;
        };
    };
    engine: {
        tachometer: {
            DHC2: typeof dhc2engine.tachometer;
            jageype: typeof jagetype.tachometer;
        };
        speedometer: {
            BMW: typeof speedometer.speedometerBMW;
        };
        suctionPressure: {
            DHC2: typeof dhc2engine.suctionPressure;
        };
        manifoldPressure: {
            DHC2: typeof dhc2engine.manifoldPressure;
        };
        fuel: {
            generic: typeof dhc2engine.tank;
            DHC2: typeof dhc2engine.fuel;
        };
        oilFuelStatus: {
            DHC2: typeof dhc2engine.oilFuelStatus;
        };
        carbMixtureTemp: {
            DHC2: typeof dhc2engine.carbMixtureTemp;
        };
        cylinderHeadTemp: {
            DHC2: typeof dhc2engine.cylinderHeadTemp;
        };
    };
    electrical: {
        ammeter: {
            DHC2: typeof dhc2elec.ammeter;
        };
        voltmeter: {
            DHC2: typeof dhc2elec.voltmeter;
        };
    };
    clocks: {
        simple: typeof clocks.simple;
        casioF91W: typeof clocks.casioF91W;
        omegaSpeedmaster: typeof speedmaster.omegaSpeedmaster;
    };
    switches: {
        toggle: typeof switches.toggleFactory;
    };
    debug: {
        alignment: typeof debug.alignment;
    };
};
//# sourceMappingURL=__index__.d.ts.map