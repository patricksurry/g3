## Cookbook

Short recipes for common gauge-building problems.
See the [API reference](API.md) for details and the [gallery](CONTRIB.md) for complete gauges.
Each snippet defines a `gauge`; to see it, drop it into a page like this:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://unpkg.com/@patricksurry/g3/dist/g3-contrib.min.js"></script>
<script>
  /* snippet here */
  g3.panel().width(240).height(240).append(g3.put().x(120).y(120).append(gauge))('body');
</script>
```

Without a hub, the panel animates each gauge with its `.fake()` metrics.


### The pattern: factory, configure, render

Every G3 component is a factory that returns a renderer function.
Chained getter/setter methods configure the renderer, and calling it with
a target element draws it, in the style of D3's [reusable charts](https://bost.ocks.org/mike/chart/).
Usually the panel makes that final call for you.

```js
const gauge = g3.gauge()                        // factory returns a renderer
    .metric('rpm')                              // setters configure it, and return it for chaining
    .measure(d3.scaleLinear().domain([0, 3500]).range([-135, 135]))
    .fake(g3.forceSeries(500, 3000))
    .append(                                    // children are renderers too
        g3.gaugeFace(),
        g3.axisTicks().step(250).size(5),
        g3.axisTicks().step(500),
        g3.axisLabels().step(500).format(v => v / 100),
        g3.indicatePointer().shape('sword'),
    );
// gauge.metric() with no argument is a getter: 'rpm'
```

Think about how the physical gauge works:
anything that moves is driven by a metric, and everything else is fixed decoration.


### Move the scale, not the pointer

Many instruments hold the pointer still and move the card behind it,
like a heading indicator or the pressure window on an altimeter.
Set `.autoindicate(true)` and the gauge moves its whole contents to track the metric.

```js
const gauge = g3.gauge()
    .append(
        g3.gaugeFace(),
        g3.gauge()
            .metric('heading').unit('deg')
            .fake(g3.forceSeries(0, 360, {wrap: true}))
            .measure(d3.scaleLinear().domain([0, 360]).range([0, 360]))
            .autoindicate(true)                 // the card rotates by -heading
            .append(
                g3.axisTicks().step(10).size(8),
                g3.axisLabels().step(30).format(v => v / 10).inset(18),
            ),
        g3.element('path', {d: 'M 0,-75 l 6,15 l -12,0 z'}).class('g3-highlight-fill'),  // fixed lubber mark
    );
```


### A sector that follows a metric

An `axisSector` is static decoration.
To shade a range whose end moves, such as the region above a variable never-exceed speed,
use `indicateSector`, which draws from a fixed `anchor` to the current value.
Nest it in a sub-gauge with the same `measure` so it can track its own metric.

```js
const measure = d3.scaleLinear().domain([40, 200]).range([-150, 150]);

const gauge = g3.gauge()
    .metric('airspeed').unit('knot')
    .fake(g3.forceSeries(60, 160))
    .measure(measure)
    .append(
        g3.gaugeFace(),
        g3.gauge()
            .metric('vne').unit('knot')         // a second metric on the same axis
            .fake(g3.forceSeries(150, 190))
            .measure(measure)
            .append(g3.indicateSector().anchor(200).size(8).class('g3-danger-fill')),
        g3.axisTicks().step(10),
        g3.axisLabels().step(20).inset(20),
        g3.indicatePointer(),
    );
```


### A heading tape with no seam

A linear tape that scrolls with heading has a seam where 359° wraps to 0°.
Draw the tape twice, with the seam in different places, and cross-fade between them with `indicateStyle`
so the visible copy is always far from its seam.
Clip the result to a window.

```js
const label = d => d % 90 ? String(((d % 360) + 360) % 360 / 10) : 'NESW'.charAt(((d / 90 % 4) + 4) % 4);

function tape(rescale, trigger) {
    return g3.gauge()
        .metric('heading').unit('deg')
        .kind('linear').autoindicate(true)
        .rescale(rescale)
        .measure(d3.scaleLinear().domain([-360, 360]).range([-720, 720]))
        .append(
            g3.indicateStyle().trigger(trigger).append(
                g3.axisTicks().step(10).size(8),
                g3.axisLabels().step(30).format(label).inset(-12).size(14),
            ),
        );
}

const gauge = g3.gauge()
    .clip(g3.element('rect', {x: -100, y: -30, width: 200, height: 60}))
    .append(
        g3.element('rect', {x: -100, y: -30, width: 200, height: 60}).class('g3-bg-fill'),
        g3.put().y(10).append(
            // seam at 0/360, shown near 180
            tape(v => v, v => 1 - Math.abs(v - 180) / 180)
                .fake(g3.forceSeries(0, 360, {wrap: true})),
            // seam at 180, shown near 0
            tape(v => (v + 180) % 360 - 180, v => Math.abs(v - 180) / 180),
        ),
        g3.element('path', {d: 'M 0,-30 l 0,25'}).class('g3-highlight-stroke'),
    );
```

Both tapes read the same `heading` metric, so only one needs a `.fake()`.


### Custom units

You only need `.unit()` if a gauge should convert automatically from whatever units the hub reports,
using the units [convert-units](https://github.com/convert-units/convert-units) knows about.
If you know what units your data arrives in, leave `.unit()` off and convert with `rescale`.
For units that convert-units lacks, the alternative is a small shim in front of G3
that converts the hub's metrics before the panel sees them.

```js
// the hub reports glideslope deviation in dots; the needle swings 12° per dot
const gauge = g3.gauge()
    .metric('glideslope')                       // no .unit(): values are used as reported
    .fake(g3.forceSeries(-2, 2))
    .measure(d3.scaleLinear().domain([-30, 30]).range([-30, 30]))
    .append(
        g3.gaugeFace(),
        g3.axisTicks([-24, -12, 0, 12, 24]).size(10),
        g3.indicatePointer().rescale(dots => dots * 12).clamp([-30, 30]),
    );
```


### LCD and segmented text

G3 declares the [DSEG](https://www.keshikan.net/fonts-e.html) fonts as `DSEG7-Classic` and `DSEG14-Classic`.
Combine them with `indicateText` for radio and transponder displays.
The KT 76C transponder (`g3.contrib.radionav.transponder.KT76C`) in the [gallery](CONTRIB.md) is a complete example.

```js
const gauge = g3.gauge()
    .metric('com1Frequency')
    .fake(g3.categoricalSeries([118.3, 121.5, 124.85]))
    .css('text.lcd {font-family: DSEG7-Classic; fill: #ff2e1f}')
    .append(
        g3.element('rect', {x: -70, y: -20, width: 140, height: 40, rx: 4}).class('g3-bg-fill'),
        g3.indicateText().format(v => v.toFixed(3)).size(26).class('lcd'),
    );
```


### Combine several metrics

Name extra metrics after the primary one.
The gauge redraws when any of them changes, and callbacks receive all current values as `metrics`.
Values in `metrics` are as reported by the hub, without unit conversion.

```js
const gauge = g3.gauge()
    .metric('fuelLeft', 'fuelRight')
    .fake(g3.forceSeries(10, 40))
    .append(
        g3.indicateText().format((left, metrics) => `${Math.round(left + (metrics.fuelRight ?? 0))} gal`),
    );
```


### Further reading

- Bartosz Ciechanowski's [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) shows how real gauge mechanisms move.
- [Human Factors and Gauge Design: A Literature Review](https://backend.production.deepblue-documents.lib.umich.edu/server/api/core/bitstreams/530e47e8-9f1d-46b8-8281-d68990d09d2c/content); the executive summary is a good start.
