export interface ForceSeriesOptions {
    fmax?: number;
    damping?: number;
    wrap?: boolean;
}

export function forceSeries(min_?: number, max_?: number, opts_?: ForceSeriesOptions): (current?: number) => number {
    const min = min_ ?? 0,
        max = max_ ?? 1,
        opts = opts_ ?? {},
        fmax = opts.fmax ?? 0.01,
        damping = opts.damping ?? 0.9,
        wrap = opts.wrap ?? false;
    let x = Math.random(),
        v = 0;

    function next(current?: number): number {
        // continue from the current value if given, e.g. after an action changed it
        if (typeof current === 'number' && isFinite(current) && max > min) {
            x = Math.min(1, Math.max(0, (current - min) / (max - min)));
        }
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


export function categoricalSeries<T = any>(values: T[]): (current?: T) => T {
    const n = values.length,
        vs = forceSeries(0, n, {wrap: true});
    let last: T | undefined;

    function next(current?: T): T {
        // re-seed from the current category only if it changed since we last produced it
        const i = current === undefined || current === last ? -1 : values.indexOf(current);
        last = values[Math.min(Math.floor(vs(i < 0 ? undefined : i + 0.5)), n-1)];
        return last;
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
