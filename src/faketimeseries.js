export function forceSeries(min, max, opts) {
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


export function categoricalSeries(values) {
    var n = values.length,
        vs = forceSeries(0, n, {wrap: true});

    function next() {
        return values[Math.min(Math.floor(vs()), n-1)];
    }
    return next;
}


export function datetimeSeries() {
    function next() {
        return new Date();
    }
    return next;
}


export function midnightSecondsSeries() {
    function next() {
        let dt = new Date(),
            msSinceMidnight = dt.getTime() - dt.setHours(0,0,0,0);
        return msSinceMidnight/1000;
    }
    return next;
}


export function elapsedSecondsSeries() {
    const dt = new Date();
    function next() {
        return (new Date() - dt)/1000;
    }
    return next;
}


function metricsRegistry() {
    var generators = {};

    function metrics() {
        return Object.fromEntries(
            Object.entries(generators).map(([k, f]) => [k, f()])
        );
    }
    metrics.register = function(obj) {
        return arguments.length ? (generators = {...obj, ...generators}, metrics): generators;
    }
    return metrics;
}

export var fakeMetrics = metricsRegistry();
