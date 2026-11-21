import { describe, it, expect } from 'vitest';
import { odometerDrums } from '../src/contrib/speedometer';

const close = (actual: number[], expected: number[]) =>
    actual.forEach((a, i) => expect(a).toBeCloseTo(expected[i], 6));

describe('odometer drums', () => {
    it('turns the tenths drum continuously and holds the others on their digits', () => {
        close(odometerDrums(1234.56, 5), [5.6, 4, 3, 2, 1]);
    });

    it('rolls each drum on only while the drum to its right passes from 9 to 0', () => {
        // 9.5 tenths: the units drum is half way from 8 to 9, the tens drum waits
        close(odometerDrums(18.95, 3), [9.5, 8.5, 1]);
        // every drum carries together through 89999.95
        close(odometerDrums(89999.95, 6), [9.5, 9.5, 9.5, 9.5, 9.5, 8.5]);
    });

    it('wraps back to zero after the highest digit', () => {
        close(odometerDrums(1000.0, 3), [0, 0, 0]);
    });
});
