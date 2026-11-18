export interface ForceSeriesOptions {
    fmax?: number;
    damping?: number;
    wrap?: boolean;
}
export declare function forceSeries(min_?: number, max_?: number, opts_?: ForceSeriesOptions): () => number;
export declare function categoricalSeries<T = any>(values: T[]): () => T;
export declare function datetimeSeries(): () => Date;
export declare function midnightSecondsSeries(): () => number;
export declare function elapsedSecondsSeries(): () => number;
