function forceSeries(min, max, opts) {
    var min = min ?? 0,
        max = max ?? 1,
        opts = opts ?? {},
        fmax = opts.fmax ?? 0.01,
        damping = opts.damping ?? 0.9,
        wrap = opts.wrap ?? false,
        x = Math.random(),
        v = 0;

    function next() {
        x += v;
        v += (2*Math.random()-1)*fmax;
        v *= damping;
        if (x < 0 || x > 1) {
            if (!wrap) {
                v = -v;
                x = x < 0 ? -x : 2-x;
            } else {
                x = x > 1 ? x - 1 : x + 1;
            }
        }
        return x * (max - min) + min;

    }
    return next;
}


function categoricalSeries(values) {
    var n = values.length,
        vs = forceSeries(0, n, {wrap: true});

    function next() {
        return values[Math.min(Math.floor(vs()), n-1)];
    }
    return next;
}


function datetimeSeries() {
    function next() {
        return new Date();
    }
    return next;
}


function midnightSecondsSeries() {
    function next() {
        let dt = new Date(),
            msSinceMidnight = dt.getTime() - dt.setHours(0,0,0,0);
        return msSinceMidnight/1000;
    }
    return next;
}


var metricSeries = {
    time: midnightSecondsSeries(),
    date: datetimeSeries(),
    atmosphericPressure: forceSeries(955, 1075),
    altitude: forceSeries(0, 30000, {fmax: 0.001}),
    pitch: forceSeries(-25, 25),
    roll: forceSeries(-25, 25),
    incline: forceSeries(-20,20),
    heading: forceSeries(0, 360, {wrap: true}),
    radialDeviation: forceSeries(-10, 10),
    radialVOR: forceSeries(0, 360, {wrap: true}),
    toFrVOR: categoricalSeries([true, false]),
    reliabilityVOR: categoricalSeries([true, false]),
    headingADF: forceSeries(0, 360, {wrap: true}),
    relativeADF: forceSeries(0, 360, {wrap: true}),
    verticalSpeed: forceSeries(-1500, 1500),
    turnrate: forceSeries(-3, 3),
    airspeed: forceSeries(40, 200),
    suctionPressure: forceSeries(0, 10),
    manifoldPressure: forceSeries(10, 50),
    fuelFront: forceSeries(0, 26),
    fuelCenter: forceSeries(0, 26),
    fuelRear: forceSeries(0, 20),
    fuelSelector: categoricalSeries(['front', 'center', 'rear']),
    engineTachometer: forceSeries(300, 3500),
    oilPressure: forceSeries(0, 200),
    fuelPressure: forceSeries(0, 10),
    oilTemperature: forceSeries(0, 100),
    carbMixtureTemp: forceSeries(-50, 50),
    cylinderHeadTemp: forceSeries(0, 350),
    alternatorLoad: forceSeries(-0.1, 1.25),
    alternatorVolts: forceSeries(0, 30),
}


export function fakeMetrics() {
    let metrics = {};
    for (var k in metricSeries) {
        metrics[k] = metricSeries[k]();
    }
    return metrics;
}
