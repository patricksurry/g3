import * as d3 from "d3";

export const gaugeDefs = {
    altimeter: {
        axis: {
            scale: d3.scaleLinear().domain([0, 1000]).range([0, 360])
        },
        tickMarks: {
            major: {step: 100, dr: 15},
            minor: {step: 20},
        },
        tickLabels: {
            primary: {step: 100, stop: 900, fmt: v => v/100}
        },
        labels: [
            {y: -30, label: "ALTITUDE"},
            {label: "100"},
            {label: "FEET"},
            {label: "1000 FEET"},
            {label: "10000 FEET"},
            {label: "CALIBRATED TO"},
            {label: "20,000 FEET"}
        ]
    },
    airspeed: {
        axis: {
            scale: d3.scaleLinear().domain([40,200]).range([30, 350]),
            regions: [
                {name: "flaps", start: 60, stop: 105, radius: 90},
                {name: "normal", start: 60, stop: 145},
                {name: "maximum", start: 145, stop: 180},
            ]
        },
        tickMarks: {
            major: {step: 10, dr: 20},
            minor: {step: 5, dr: 15},
            special: {values: [180], dr: 20},
        },
        tickLabels: {
            primary: {step: 20, dr: 33}
        },
        labels: [
            {y: -33, label: "AIRSPEED"},
            {y: 33, label: "MPH"},
        ],
    },
    tachometer: {
        axis: {
            scale: d3.scaleLinear().domain([300, 3500]).range([225, 495]),
            regions: [
                {name: "idle", start: 1600, stop: 2000},
                {name: "normal", start: 2000, stop: 2200},
            ]
        },
        tickMarks: {
            major: {start: 500, step: 500, dr: 20},
            minor: {step: 100},
            special: {values: [2300], dr: 20},
        },
        tickLabels: {
            primary: {start: 500, step: 500, fmt: v => v/100},
            secondary: {values: [300], fmt: v => v/100},
        },
        labels: [
            {y: -50, label: "RPM"},
            {y: -33, label: "HUNDREDS"},
        ],
    },
    manifoldpressure: {
        axis: {
            scale: d3.scaleLinear().domain([10,50]).range([-1000/9, 1000/9]),
            regions: [
                {name: "idle", start: 18, stop: 30},
                {name: "normal", start: 30, stop: 35},
            ]
        },
        tickMarks: {
            major: {step: 5},
            minor: {step: 1},
            special: {values: [30, 36.5], dr: 20},
        },
        tickLabels: {
            primary: {step: 10},
            secondary: {step: 5},
        },
        labels: [
            {y: -50, label: "MANIFOLD"},
            {y: -30, label: "PRESSURE"},
            {y: 50, label: "INCHES OF MERCURY"},
        ]
    },
    suction: {
        axis: {
            scale: d3.scaleLinear().domain([0, 10]).range([7*30, 17*30]),
        },
        tickMarks: {
            major: {step: 1, dr: 20},
            minor: {step: 0.2, dr: 10},
            special: {values: [4.5, 5.4], dr: 20}
        },
        tickLabels: {
            primary: {step: 2, dr: 33},
        },
        labels: [
            {y: -33, label: "SUCTION"},
            {y: 25, label: "INCHES OF MERCURY"},
        ]
    },
}
