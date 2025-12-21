import { forceSeries, categoricalSeries, datetimeSeries, midnightSecondsSeries, elapsedSecondsSeries } from '../src/faketimeseries.js';

describe('faketimeseries module', () => {
  describe('forceSeries', () => {
    test('should create a force series generator', () => {
      const series = forceSeries(0, 100);
      expect(typeof series).toBe('function');
    });

    test('forceSeries should return values within range', () => {
      const series = forceSeries(10, 50);
      for (let i = 0; i < 10; i++) {
        const value = series();
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(50);
      }
    });

    test('forceSeries with same min and max should return constant value', () => {
      const series = forceSeries(42, 42);
      expect(series()).toBe(42);
      expect(series()).toBe(42);
    });

    test('forceSeries should use default min and max', () => {
      const series = forceSeries();
      const value = series();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    test('forceSeries should accept custom options', () => {
      const series = forceSeries(0, 100, { fmax: 0.05, damping: 0.95 });
      const value = series();
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  describe('categoricalSeries', () => {
    test('should create a categorical series generator', () => {
      const series = categoricalSeries(['a', 'b', 'c']);
      expect(typeof series).toBe('function');
    });

    test('categoricalSeries should return values from the provided array', () => {
      const values = ['red', 'green', 'blue'];
      const series = categoricalSeries(values);
      for (let i = 0; i < 10; i++) {
        const value = series();
        expect(values).toContain(value);
      }
    });

    test('categoricalSeries should handle single value', () => {
      const series = categoricalSeries(['single']);
      expect(series()).toBe('single');
    });
  });

  describe('datetimeSeries', () => {
    test('should create a datetime series generator', () => {
      const series = datetimeSeries();
      expect(typeof series).toBe('function');
    });

    test('datetimeSeries should return Date objects', () => {
      const series = datetimeSeries();
      const value = series();
      expect(value instanceof Date).toBe(true);
    });

    test('datetimeSeries should return current time', () => {
      const series = datetimeSeries();
      const before = new Date();
      const value = series();
      const after = new Date();
      expect(value.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(value.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('midnightSecondsSeries', () => {
    test('should create a midnight seconds series generator', () => {
      const series = midnightSecondsSeries();
      expect(typeof series).toBe('function');
    });

    test('midnightSecondsSeries should return seconds since midnight', () => {
      const series = midnightSecondsSeries();
      const value = series();
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(86400); // seconds in a day
    });
  });

  describe('elapsedSecondsSeries', () => {
    test('should create an elapsed seconds series generator', () => {
      const series = elapsedSecondsSeries();
      expect(typeof series).toBe('function');
    });

    test('elapsedSecondsSeries should return increasing elapsed time', (done) => {
      const series = elapsedSecondsSeries();
      const value1 = series();
      setTimeout(() => {
        const value2 = series();
        expect(value2).toBeGreaterThan(value1);
        done();
      }, 10);
    });

    test('elapsedSecondsSeries should return non-negative values', () => {
      const series = elapsedSecondsSeries();
      const value = series();
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});
