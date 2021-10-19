//import './engine.js';
import * as nav from './nav.js';
import * as radionav from './radionav.js';
import * as dhc2nav from './dhc2-nav.js';
import * as dhc2elec from './dhc2-electrical.js';
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
