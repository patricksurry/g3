export interface ForceSeriesOptions {
    fmax?: number;
    damping?: number;
    wrap?: boolean;
}

export function forceSeries(min_?: number, max_?: number, opts_?: ForceSeriesOptions): () => number {
    const min = min_ ?? 0,
        max = max_ ?? 1,
        opts = opts_ ?? {},
        fmax = opts.fmax ?? 0.01,
        damping = opts.damping ?? 0.9,
        wrap = opts.wrap ?? false;
    let x = Math.random(),
        v = 0;

    function next(): number {
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


export function categoricalSeries<T = any>(values: T[]): () => T {
    const n = values.length,
        vs = forceSeries(0, n, {wrap: true});

    function next(): T {
        return values[Math.min(Math.floor(vs()), n-1)];
    }
    return next;
}


export function datetimeSeries(): () => Date {
    function next(): Date {
        return new Date();
    }
    return next;
}


export function midnightSecondsSeries(): () => number {
    function next(): number {
        const dt = new Date(),
            msSinceMidnight = dt.getTime() - dt.setHours(0,0,0,0);
        return msSinceMidnight/1000;
    }
    return next;
}


export function elapsedSecondsSeries(): () => number {
    const dt = new Date();
    function next(): number {
        return (new Date().getTime() - dt.getTime())/1000;
    }
    return next;
}
