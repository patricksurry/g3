// Shared metric helpers for the controller and local hub (not part of the public g3 namespace)
import configureMeasurements from 'convert-units';
import allMeasures from 'convert-units/definitions/all';

export const
    convertUnits = configureMeasurements(allMeasures),
    knownUnits = convertUnits().possibilities();


/** Convert v between units when both are given, reviving string-serialized dates otherwise. */
export function maybeConvert(v: any, fromUnit?: string, toUnit?: string): any {
    let u = v;
    if (fromUnit && toUnit) {
        try {
            u = convertUnits(v).from(fromUnit).to(toUnit);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.log('Unit conversion error: ' + msg);
        }
    } else if (typeof v === 'string' && v.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)) {
        u = new Date(v);
    }
    return u;
}


/**
 * Resolve a metric key to the longest dot-separated prefix of itself among the known metrics,
 * e.g. `fuel.left` resolves to `fuel.left` if known, otherwise `fuel`, otherwise undefined.
 */
export function resolveKey(key: string, known: Record<string, any>): string | undefined {
    const ks = key.split('.');
    while (ks.length) {
        const k = ks.join('.');
        if (k in known) return k;
        ks.pop();
    }
    return undefined;
}
