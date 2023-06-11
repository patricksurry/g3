## API reference

### Key concepts

A [panel](#panel) is a container that presents a collection of [gauges](#gauge),
and orchestrates the display of [metrics](#metrics),
normally retrieved by polling some external source.
(G3 can also generate fake time-varying metrics for development purposes.)
A simple gauge displays some metric,
using a [scale](#scale) to transform the raw metric
and [indicate](#indicate) that value on a local [axis](#axis),
usually adorned with [ticks](#axis), [labels](#axis) and other SVG [decorations](#SVG).
Typical "steam gauges" use a circular coordinate system to indicate
metric values using a rotating [pointer](#indicate).
More complex gauges might display the same metric at several scales
(e.g. a clock with a second, minute and hour hand,
or an altimeter displaying hundreds, thousands and ten-thousands of feet);
contain one or more sub-gauges that display different metrics
(like a combined oil and fuel temperature gauge);
or indicate values using [text](#indicate) (such as a digital watch or radio frequency LCD)
or SVG [style](#indicate) such as color rather than a pointer.
Some gauges *auto-indicate*, in that the gauge itself
tracks the metric value with respect to a fixed point,
for example the pressure reading of an altimeter
or the "day of month" of some watches
where the gauge axis rotates to be visible through a fixed window.

In order to keep things modular, and separate gauge configuration
from usage in a specific panel,
G3 uses the pattern of closures with getter-setter methods
from Mike Bostock's approach to [reusable charts](https://bost.ocks.org/mike/chart/).
This means that most G3 components return a configurable drawing function
which is ultimately rendered to SVG by calling it with a [D3 selection](https://github.com/d3/d3-selection)
or CSS selector string.
The typical drawing function looks like this:
```js
(selection, gauge) => {
  /* append component instance to selection, perhaps based on parent gauge properties */
}
```
[Gauge components](#gauge) use [D3 dispatch](https://github.com/d3/d3-dispatch) to register interest
in their designated metric so that the containing [panel](#panel) can send updates as the metric changes.


### Gauge

A [*gauge()*](#g3-gauge) is the core component of G3,
typically containing a number of components to indicate one or more metrics.
Gauges are often decorated with a [*gaugeFace()*](#g3-gaugeFace),
[*gaugeLabel()s*](#g3-gaugeLabel) and [*gaugeScrew()s*](#g3-gaugeScrew).


<a name="g3-gauge" href="#g3-gauge">#</a>
g3.**gauge**() · [source](src/gauge.js)

Creates an gauge renderer configured via the
*gauge* getter/setter methods described below, e.g. *gauge*.r(100).
The *gauge* is called to draw it within an SVG document, e.g. *gauge*(d3.select('svg.mygauge')).
Typically *gauge* is not drawn directly
but instead appended to a [panel](#panel) which will draw it and manage metric updates.
A *gauge* is also [stylable](#stylable) and [appendable](#appendable) via [mixins](#mixins).
A number of pre-configured gauge builders are available via the functions in `g3.contrib.*`.

*gauge*.**metric**([*metric*: string]) · [source](src/gauge.js)

If *metric* is specified, set the name of the metric that this gauge will indicate.
If *metric* is not specified, return the name of the current metric, defaulting to *undefined*.

*gauge*.**unit**([*unit*: string]) · [source](src/gauge.js)

If *unit* is specified, set the unit of measurement for the current metric,
otherwise return the current unit, defaulting to *undefined*.
G3 will convert input data to the target unit,
provided that both the gauge and external metric source define explicit units,
and those units are known and compatible in the
[convert-units](https://github.com/convert-units/convert-units) module.
For example, a gauge designed to show miles/hour (mph)
could then correctly display  speeds provided in km/hour (kph).

*gauge*.**kind**([*kind*: string]) · [source](src/gauge.js)

If *kind* is specified, it must be either the string `circular` or `linear`
to select how the axis is displayed for this gauge.
If *kind* is not specified, return the current value, defaulting to `circular`.

*gauge*.**measure**([*measure*: any &rArr; number]) · [source](src/gauge.js)

If *measure* is specified, it defines a [d3.scale](https://github.com/d3/d3-scale)-like
function which transforms metric values to the axis coordinate system of the gauge,
and provides *measure*.domain() and *measure*.range() accessors reporting the expected
range of the source metric and axis coordinates respectively.
For example, on a gauge with a circular axis,
*gauge*.measure(d3.scaleLinear().domain([0,10]).range([-90, 90]))
would map a metric expected to take values between 0 and 10
to a semi-circular axis on the top half of the gauge face
(i.e. between -90° and 90°).

*gauge*.**rescale**([*rescale*: any &rArr; any]) · [source](src/gauge.js)

If *rescale* is defined, specifies a function that
rescales the current metric value before applying the *measure()* scale,
thus changing the domain of the metric before it's transformed to the gauge axis range.
Otherwise, returns the current rescaling, which defaults to the identity function.
For example, a dateTime metric might be rescaled to the day-of-month domain
before displaying on a calendar wheel.

*gauge*.**r**([*radius*: number]) · [source](src/gauge.js)

If *radius* is specified it defines the size of the gauge in SVG units,
otherwise the current *radius* is returned, defaulting to 100.
For circular gauges, the axis line will be placed here.

<a name="g3-gauge-autoindicate"></a>
*gauge*.**autoindicate**([*flag*: bool]) · [source](src/gauge.js)

If *flag* is set, the boolean value defines whether this gauge should self-indicate,
otherwise return the current value, defaulting to false.
Most gauges are fixed and use a pointer, text or style to indicate the current metric value.
A self-indicating gauge transforms itself so that the axis location corresponding
to the current metric value stays at a fixed position.
A circular gauge rotates so the correct axis value is shown at the top,
and a linear gauge slides itself to the correct axis value is shown centered at *x*=0.
To change the position where the gauge indicates, apply a transformation.
For example, to indicate in a window at the 3 o'clock position, try:

    g3.put().rotate(90).append(g3.gauge().autoindicate(true)...)

*gauge*.**clip**([*clippath*: function]) · [source](src/gauge.js)

If *clippath* is set, it defines a G3 drawing function that, when called, draws a clipping path for this gauge.
Otherwise, it returns the current drawing function, defaulting to undefined.
For complex nested gauges, like the attitude indicator, it is sometimes convenient to clip to a simple circle
via *gauge*.clip(g3.gaugeFace()).


<a name="g3-gaugeFace" href="#g3-gaugeFace">#</a>
g3.**gaugeFace**() · [source](src/gauge.js)

Returns a [stylable](#stylable) *gaugeFace* object, which when called will draw a circle with CSS class `g3-gauge-face`.

*gaugeFace*.**r**([*r*: number]) · [source](src/gauge.js)

If *r* is defined, set the radius for the circular face, otherwise return the current value, defaulting to 100.

*gaugeFace*.**window**([*window*: object]) · [source](src/gauge.js)

If *window* is defined, use that drawing function to define an
[SVG mask](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)
on the gauge face to "cut out" a window.  Otherwise, return the current window defaulting to undefined.


<a name="g3-gaugeLabel" href="#g3-gaugeLabel">#</a>
g3.**gaugeLabel**([*value*: string[, *opts*: object]]) · [source](src/gauge.js)

Create a [stylable](#stylable) *gaugeLabel* function which adds SVG text to a gauge when called.
If *value* is set, it defines the initial value of the label.
The optional *opts* can be used as a shortcut for the accessor functions.
For example `g3.gaugeLabel("hello", {x: 20, y: 20})`
is equivalent to `g3.gaugeLabel().value("hello").x(20).y(20)`.

*gaugeLabel*.**value**([*value*: string]) · [source](src/gauge.js)

Set the label text to *value* if defined, otherwise return the current value.

*gaugeLabel*.**size**([*size*: number]) · [source](src/gauge.js)

Set the label size to *size* SVG units, otherwise return the current value which defaults to 10.

*gaugeLabel*.**x**([*x*: number]) · [source](src/gauge.js)

*gaugeLabel*.**y**([*y*: number]) · [source](src/gauge.js)

*gaugeLabel*.**dx**([*dx*: number]) · [source](src/gauge.js)

*gaugeLabel*.**dy**([*dy*: number]) · [source](src/gauge.js)

Set or return the *x*, *y*, *dx* or *dy* values of the underlying
[SVG text element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)
respectively.


<a name="g3-gaugeScrew" href="#g3-gaugeScrew">#</a>
g3.**gaugeScrew**() · [source](src/gauge.js)

A *gaugeScrew* configures a [stylable](#stylable), [transformable](#transformable) screw head.
When called, draws the screw with the selected head shape oriented in a random rotation.

*gaugeScrew*.**r**([*r*: number]) · [source](src/gauge.js)

If *r* is defined, set the radius of the screw head, otherwise return the current value, defaulting to 8.

*gaugeScrew*.**shape**([*shape*: string]) · [source](src/gauge.js)

If *shape* is defined, sets the screw head style to one of `slotted`, `phillips` or `robertson`.
Otherwise returns the current shape, defaulting to `slotted`.


### Axis

The gauge axis represents the metric on the gauge face,
with the gauge measure mapping from the metric domain
to the range of coordinates of the gauge itself.
An [*axisLine()*](#g3-axisLine) draws a line covering the domain of the metric,
usually including [*axisTicks()*](#g3-axisTicks) to draw tick marks,
and [*axisLabels()*](#g3-axisLabels) to add labels.
Sometimes [*axisSector()s*] are used to highlight particular regions of the axis,
and can also be used for windows, rings or other annular decorations.


<a name="g3-axisLine" href="#g3-axisLine">#</a>
g3.**axisLine**() · [source](src/axis.js)

Returns a [stylable](#stylable) *axisLine*, which draws a line spanning the domain of its parent gauge's metric.
Essentially a shortcut for g3.axisSector([*min, max*]).size(0).inset(0).class('g3-axis-line')
where [*min, max*] are the smallest and largest values of this gauge's metric.


<a name="g3-axisTicks" href="#g3-axisTicks">#</a>
g3.**axisTicks**([*vs*: array<number>]) · [source](src/axis.js)

Returns a [stylable](#stylable) *axisTicks* object, which will draw tick marks along the axis line.
The optional *vs* defines a list of specific tick mark locations in the metric domain.

*axisTicks*.**values**([*vs*: array<number>]) · [source](src/axis.js)

If *vs* is defined, set specific tick mark locations along the axis, in the metric domain.
Otherwise return the current list of locations, which defaults to none.
See also *axisTicks*.start() and  *axisTicks*.step()

*axisTicks*.**step**([*step*: number]) · [source](src/axis.js)

If *step* is defined, set the step size for tick marks in the metric domain.
Otherwise return the current value, which defaults to 1.
See also  *axisTicks*.start().

*axisTicks*.**start**([*start*: number]) · [source](src/axis.js)

If *start* is defined, set the first tick mark location in the metric domain.
Otherwise return the current value, which defaults to *gauge*.metric().domain()[0].

*axisTicks*.**shape**([*shape*: string]) · [source](src/axis.js)

If *shape* is defined, sets the current tick mark shape to one of `tick`, `dot`, `wedge` or `rect`.
Otherwise, return the current shape, which defaults to `tick`.

*axisTicks*.**size**([*size*: number]) · [source](src/axis.js)

If *size* is defined, set the current tick mark size, otherwise return the current value,
which defaults to 10.
The *size* is measured inward from the axis line,
use a negative value (or negative inset) for outward ticks
on a circular gauge.

*axisTicks*.**width**([*width*: number]) · [source](src/axis.js)

If *width* is defined, set the current tick mark width along the axis, in SVG units.
Otherwise return the current value, which defaults to 1.
The `wedge` and `rect` shapes support *width*.

*axisTicks*.**inset**([*inset*: number]) · [source](src/axis.js)

If *inset* is defined, set the current tick mark inset inside the axis line.
Otherwise, return the default value, which defaults to 0.


<a name="g3-axisLabels" href="#g3-axisLabels">#</a>
g3.**axisLabels**([*vs*: array<number>|object]) · [source](src/axis.js)

Returns a [stylable](#stylable) *axisLabels* object,
which will draw text labels relative to the gauge's metric domain.

If *vs* is defined, set specific label locations along the axis, in the metric domain.
If *vs* is an array of numbers, each value defines a label position
with a text label produced by *axisLabels*.format().
If *vs* is an object, each key is interpreted as a number with the
value giving the text label.
For example
*axisLabels*.values([0, 5, 10]) or
*axisLabels*.values({0: "empty", 10: "full"}).
Otherwise return the current list of label locations, which defaults to none.
See also *axisLabels*.start() and  *axisLabels*.step()

*axisLabels*.**step**([*step*: number]) · [source](src/axis.js)

If *step* is defined, set the step size for labels in the metric domain.
Otherwise return the current value, which defaults to 1.
See also  *axisLabels*.start().

*axisLabels*.**start**([*start*: number]) · [source](src/axis.js)

If *start* is defined, set the first label location in the metric domain.
Otherwise return the current value, which defaults to *gauge*.metric().domain()[0].

*axisLabels*.**format**([*format*: number &rArr; string]) · [source](src/axis.js)

If *format* is defined, it is assumed to be a function that converts a
metric value indicating a label position to the appropriate text label.
For example *axisLabels*.format(v &rArr; Math.round(v/100)) might be used
to label a gauge in hundreds.

*axisLabels*.**size**([*size*: number]) · [source](src/axis.js)

If *size* is defined, set the text size in SVG units.
Otherwise return the current size, which defaults to 20.

*axisLabels*.**inset**([*inset*: number]) · [source](src/axis.js)

If *inset* is defined, set the current tick mark inset inside the axis line.
Otherwise, return the default value, which defaults to 0.

*axisLabels*.**orient**([*orient*: string]) · [source](src/axis.js)

If *orient* is defined, it indicates one of the label orientations
`fixed`, `relative`, `upward`, `clockwise`, or `counterclockwise`.
Otherwise it returns the current orientation which defaults to `fixed`.
In `fixed` orientation, labels ignore the local direction of the axis,
i.e. on a circular gauge with all labels would appear as unrotated text.
In `relative` orientation, labels are tangent
to the axis at their position,
i.e. on a circular gauge all labels would read along the circle.
Note that *axisLabels*.rotate() applies
after this basic orientation.
In `upward` orientation, labels behave like `relative`
but an additional 180° rotation is added if the
label would otherwise point downward in the labels' container.
In `clockwise` or `counterclockwise` orientation,
text is laid out along the axis path
centered on the label location, so that on a circular gauge
labels wrap around the circle,
reading in the described direction.
Additional rotation does not apply in this case.

*axisLabels*.**rotate**([*rotate*: number]) · [source](src/axis.js)

If *rotate* is defined, set the current rotation angle in degrees.
Otherwise return the current rotation, which defaults to 0.
See also *orient*.


<a name="g3-axisSector" href="#g3-axisSector">#</a>
g3.**axisSector**([*vs*: array<number>]) · [source](src/axis.js)

Returns a [stylable](#stylable) *axisSector* object, which draws part of an
[annulus](https://en.wikipedia.org/wiki/Annulus_(mathematics)) relative to the gauge's axis line.
If *vs* is defined it must be a two element array
giving the starting and ending point for the sector
in the domain of the gauge measure,
otherwise the sector spans the full domain.
This is typically used to highlight important regions of the axis,
and can also be used to add windows, rings or other annular decorations.

*axisSector*.**size**([*size*: number]) · [source](src/axis.js)

If *size* is defined, sets the width of the sector in SVG units, otherwise returning the current value,
which defaults to 5.  Size is measured inward from the axis line.

*axisSector*.**inset**([*inset*: number]) · [source](src/axis.js)

If *inset* is defined, sets the distance inside the axis line the outer rim of the sector.
Otherwise returns the current value, which defaults to 0.
Use a negative value for sectors outside the axis line.



### Indicate

Gauges are only useful when they *indicate* one or more metrics.
Some gauges [self indicate](#g3-gauge-autoindicate) but most
use a [pointer](#g3-indicatePointer), [text](#g3-indicateText),
or [style](#g3-indicateStyle) to display the current metric value.
You can create fairly compelling segmented LCD displays using
[DSEG](https://www.keshikan.net/fonts-e.html) fonts,
declared by G3 as the `DSEG7-Classic` and `DSEG14-Classic` font-family.


<a name="g3-indicateText" href="#g3-indicateText">#</a>
g3.**indicateText**() · [source](src/indicate.js)

Returns a [stylable](#stylable) *indicateText* object,
which is called to update the current metric value as text,
with optional formatting.
Use [g3-put()](#g3-put) to control the positioning of the text.


*indicateText*.**format**([*format*: any &rArr; string]) · [source](src/indicate.js)

If *format* is defined, it specifies a function that converts metric values to text.
Otherwise returns the current formatter, which defaults to the identity function.
For example, *indicateText*.format(v &rArr; Math.round(v/100)) would display the
metric value in hundreds.

*indicateText*.**size**([*size*: number]) · [source](src/indicate.js)

If *size* is defined, specifies the size of the text in SVG units,
otherwise returns the current size, defaulting to 20.


<a name="g3-indicatePointer" href="#g3-indicatePointer">#</a>
g3.**indicatePointer**() · [source](src/indicate.js)

Returns a [stylable](#stylable), [appendable](#appendable) *indicatePointer* object,
which is called to draw a pointer that typically points to the current metric value,
or some converted version, on the gauge axis.
A standard pointer can be configured using *indicatePointer*.shape(),
or the pointer can be customized with arbitrary elements via *indicatePointer*.append().

*indicatePointer*.**shape**([*shape*: string]) · [source](src/indicate.js)

If *shape* is defined, selects a pointer shape from the enumeration in [pointers.js](src/pointers.js).
The shapes currently available are illustrated below.
Otherwise, returns the current pointer shape, defaulting to `needle`.

<div align='center'>
    <img src="doc/pointers.png" alt='G3 pointer shapes'>
</div>
<br />

*indicatePointer*.**rescale**([*rescale*: any &rArr; any]) · [source](src/indicate.js)

If *rescale* is defined, specifies a function that
rescales the current metric value before indicating.
This scaling happens before the *measure()* is applied,
effectively modifying the domain of the metric before it's transformed to the gauge axis range.
Otherwise, return the current conversion, which defaults to the identity function.
For example, an altimeter might indicate in hundreds, thousands and ten-thousands
using pointers with different scales.

*indicatePointer*.**clamp**([*extents*: array<number>]) · [source](src/indicate.js)

If *extents* is defined, it provides a two-element array defining
the minimum and maximum extent of the pointer domain, after any rescaling.
For one-sided clamping, pass null or undefined as one of the values.
Otherwise, return the current limits which default to [undefined, undefined].
For example, the vertical speed indicator shouldn't wrap around if the speed exceeds
the axis scale, so would typically be clamped slightly within the maximum extent of the axis.
A similar effect could be achieved by enabling
[clamping](https://github.com/d3/d3-scale#continuous_clamp) on the gauge's measure,
but this would also prevent any axis decorations beyond the clamped extent.

<a name="g3-indicateStyle" href="#g3-indicateStyle">#</a>
g3.**indicateStyle**() · [source](src/indicate.js)

Returns an [appendable](#appendable) *indicateStyle* object,
which is called to apply CSS styling conditional on the current metric.
A trigger function chooses between "on" or "off" styling.
The default style shows or hides the *indicateStyle* contents
depending on whether the metric is non-zero.
See also [statusLight](#g3-statusLight) which provides
a convenience wrapper for indicator lights.

*indicateStyle*.**trigger**([*trigger*: any &rArr; float]) · [source](src/indicate.js)

If *trigger* is defined, specifies a function
mapping the current metric value to a
proportion between 0 and 1
which tweens between the off (0) and on (1) style.
Otherwise, returns the current trigger function, which defaults to the identity
(meaning that the style is on whenever the metric is non-zero).

*indicateStyle*.**styleOn**([*styleOn*: object]) · [source](src/indicate.js)

If *styleOn* is defined, it specifies a dictionary of styles to apply
to the *indicateStyle* contents when the *trigger* is true.
Otherwise, returns the current styles, which default to `{opacity: 1}`.

*indicateStyle*.**styleOff**([*styleOff*: object]) · [source](src/indicate.js)

If *styleOff* is defined, it specifies a dictionary of styles to apply
to the *indicateStyle* contents when the *trigger* is false.
Otherwise, returns the current styles, which default to `{opacity: 0}`.


<a name="g3-snapScale" href="#g3-snapScale">#</a>
g3.**snapScale**() · [source](src/common.js)

Creates a *snapScale* object which provides a continuous
"staircase" transformation function that pulls its input value
towards the closest step value.
This is useful to create pointers that "tick" like the second hand of a clock,
and can be provided as an argument to rescale an [indicator](#indicate).
When called, the closest step to the input value is determined, and the
output is transformed according to a D3 [power scale](https://github.com/d3/d3-scale#power-scales):

    d3.scalePow().domain([-w,w]).range([-w,w]).exponent(strength)

where *w* is half the step size, and *strength* determines how strong the pull is.

TODO: probably better to define the percent of the original for 'half-life' of the transformed step,
e.g. for calendar wheel it should 'tick' over a second or so once per day.
Or maybe this is scale should just be deprecated entirely:
another way to get a similar effect is to specify (or rescale) the metric as integer values,
so we'd get a single refresh transform with duration equal to polling interval.

*snapScale*.**start**([*start*: number]) · [source](src/common.js)

If defined, *start* sets the starting anchor point for calculating steps,
otherwise returns the current value defaulting to 0.

*snapScale*.**step**([*step*: number]) · [source](src/common.js)

If defined, *step* sets the step size,
otherwise returns the current value defaulting to 1.

*snapScale*.**strength**([*strength*: number]) · [source](src/common.js)

If defined, *strength* sets the strength of pull towards each step location,
otherwise returns the current value defaulting to 5.
A value of 1 results in a linear scale, i.e. with no pull,
and positive values less than 1 result in repulsion away from step locations.


<a name="g3-statusLight" href="#g3-statusLight">#</a>
g3.**statusLight**() · [source](src/gauge.js)

A convenience wrapper for [indicateStyle](#g3-indicateStyle)
that creates a gauge whose face lights up when its metric meets a trigger threshold.
Roughly equivalent to:

    g3.gauge().metric(metric).append(
        g3.indicateStyle().trigger(trigger).append(
            gaugeFace().style(`fill: ${color}`),
            gaugeFace().class('g3-highlight'),
        )
    )

*statusLight*.**metric**([*metric*: string]) · [source](src/gauge.js)

Set or return the [gauge](#g3-gauge)'s metric.

*statusLight*.**trigger**([*trigger*: any &rArr; boolean]) · [source](src/gauge.js)

Set or return the trigger function for the [indicateStyle](#g3-indicateStyle).

*statusLight*.**color**([*color*: string]) · [source](src/gauge.js)

If *color* is defined, sets the color to display when the trigger is on.
Otherwise return the current color, which defaults to `red`.


### Panel

A [*panel()*](#g3-panel) is a container for gauges,
which is used to manage layout and coordinate the update of metrics
which are polled from an external source.


<a name="g3-panel" href="#g3-panel">#</a>
g3.**panel**() · [source](src/panel.js)

Creates a [stylable](#stylable),
[appendable](#appendable) *panel* object,
which can be configured using the functions described below.
When the object is called via *panel(selector)*,
it appends an SVG element to *selector*,
renders its children
(typically [gauges](#g3-gauge) or other [elements](#g3-element))
and begins polling for metric updates.

*panel*.**width**([*width*: integer]) · [source](src/panel.js)
*panel*.**height**([*height*: integer]) · [source](src/panel.js)

Set or return the current width or height of the SVG container.

*panel*.**url**([*url*: string]) · [source](src/panel.js)

If defined, *url* sets the URL from which to retrieve metrics,
otherwise the current URL is returned, defaulting to undefined.
When URL is undefined, the panel supplies [fake metrics](src/fake.js) for testing.
Otherwise, an HTTP GET to the *url* should return a JSON dictionary
of metrics in the form `{metricName: value, ...}`.

*panel*.**interval**([*interval*: number]) · [source](src/panel.js)

If defined, *interval* sets the polling interval in milliseconds,
otherwise the current interval is returned, defaulting to 250.
The panel will query the configured URL (or generate fake metrics)
once each interval.


### Metrics

G3 gauges display the current value of one or more metrics.
Normally these metrics are fetched from an external source
by configuring a [panel's](#g3-panel) *url*,
but for development it's handy to display fake metrics which are generated locally.
You can use [g3py](https://github.com/patricksurry/g3py)
to provide the server for your panel.  It offers both fake metrics and
stubs integrated with X-Plane and FS2020.

Simple metrics are provided as a JSON dictionary of {*metricName*: *metricValue*},
where *metricValue* is either the raw metric value or an object
of {value: *metricValue*, unit: *unitName*}.
If *unitName* is a unit recognized by
[convert-units](https://github.com/convert-units/convert-units),
and compatible with any gauge(s) that consumes it,
G3 will automatically convert between them.
For example, X-Plane provides the barometer setting in `inHg` but
the panel displays correctly in `hPa`.

Any gauge can display fake metrics, as long as a matching metric generator
has been registered using *g3.fakeMetrics.register()*.
A simple set of metric generators is provided,
or you can provide your own function that produces a new metric value each time it's called.

<a name="g3-fakeMetrics" href="#g3-fakeMetrics">#</a>
g3.**fakeMetrics** · [source](src/faketimeseries.js)

The *fakeMetrics* generator is an instance of *metricsRegistry()* used
by the [panel](#g3-panel) to generate metrics when no external source is configured.
Calling *fakeMetrics()* returns a dictionary of {metricName: metricValue}
which simulates the current state of all metrics.

*fakeMetrics*.**register**([*metrics*: object]) · [source](src/faketimeseries.js)

If *metrics* is defined, it specifies a dictionary of {metricName: metricGenerator}
which are merged with the current set of fake metrics.
Each *metricGenerator* is a function that repeatedly provides the next in a sequence of
metric values for *metricName*.

<a name="g3-forceSeries" href="#g3-forceSeries">#</a>
g3.**forceSeries**([*min*: number[, *max*: number[, *options*: object]]]) · [source](src/faketimeseries.js)

Returns a generator for a random time series
which varies between *min* (default 0) and *max* (default 1),
configured by the {name: value} object in *options*.
The force series simulates the position of a particle that is nudged by random forces,
which modify its velocity, affecting its position.
Currently three options are recognized:
*fmax* (default 0.01) controls the maximum force at each step,
increasing the value will make the series bounce around faster;
*damping* (default 0.9) introduces a friction effect with 1 being no friction and 0 being fully stuck;
and *wrap* (default false) is a boolean that controls whether the particle wraps from min to max
or bounces back when it hits a boundary.

<a name="g3-categoricalSeries" href="#g3-categoricalSeries">#</a>
g3.**categoricalSeries**(*vs*: array<any>) · [source](src/faketimeseries.js)

Returns a generator for a time series that oscillates between the
categories listed in *vs*.

<a name="g3-datetimeSeries" href="#g3-datetimeSeries">#</a>
g3.**datetimeSeries**() · [source](src/faketimeseries.js)

Returns a time series generator which always returns the current Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).

<a name="g3-midnightSecondsSeries" href="#g3-midnightSecondsSeries">#</a>
g3.**midnightSecondsSeries**() · [source](src/faketimeseries.js)

Returns a time series generator which returns the number of seconds since midnight (in browser local time).

<a name="g3-elapsedSecondsSeries" href="#g3-elapsedSecondsSeries">#</a>
g3.**midnightSecondsSeries**() · [source](src/faketimeseries.js)

Returns a time series generator which returns the number of seconds since the panel was launched,
effectively a timer.


### Mixins

Many G3 object support standard configuration options via mixins.

<a name="stylable" href="#stylable">#</a>
**stylable** objects support CSS styling,
by adding class names, element styles, or inline CSS using the
[@emotion/css package](https://www.npmjs.com/package/@emotion/css).

*stylable*.**style**([*style*: string]) · [source](src/mixin.js)

If *style* is defined, set the object's inline style property, otherwise return the current inline style value.

*stylable*.**class**([*class*: string]) · [source](src/mixin.js)

If *class* is defined, add it as a space-separated list of class names to the object's class property,
otherwise return the current space-separated list of classes.

*stylable*.**css**([*css*: string]) · [source](src/mixin.js)

If *css* is defined, interpret as inline CSS rules using [@emotion/css](https://www.npmjs.com/package/@emotion/css),
which injects the CSS into the HTML doc using a new class name and adds that class to the current list of classes.
If *css* is not defined, return the current space-separated list of classes.
This can be helpful to override the default style of child elements that are not directly stylable themselves.

TODO: document the built-in styles that we inject, e.g. in g3.js,
as well as the global helper defs defined in panel.js for blurs, drop shadows etc

<a name="transformable" href="#transformable">#</a>
**transformable** objects support
[SVG transformation](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform)
via translation, scaling and rotation.
Note the resulting transformation is always applied as `translate(...) scale(...) rotate(...)`
regardless of the order in which the transformation is configured.
Also note that applies transformations right to left, so rotation happens first,
then scaling, and finally translation.

*transformable*.**x**([*x*: number]) · [source](src/mixin.js)

*transformable*.**y**([*y*: number]) · [source](src/mixin.js)

If *x* (*y*) is defined, set the current translation in the x (y) direction,
otherwise return the current value, which defaults to 0.

*transformable*.**scale**([*sx*: number, [*sy*: number]]) · [source](src/mixin.js)

If both *sx* and *sy* are defined, set the corresponding scale in each dimension.
If only one value *sx* is provided, set a common scale in both dimensions.
If no arguments are provided, return an array with the current [*sx, sy*] values,
which default to [1, 1].

*transformable*.**rotate**([*angle*: number]) · [source](src/mixin.js)

If *angle* is defined, set the current rotation, otherwise return the current value, which defaults to 0.

<a name="appendable" href="#appendable">#</a>
**appendable** objects support appending of child objects,
as well as shared global definitions like fill patterns, gradients or SVG filters.
This allows flexible nested configuration of panels and gauges.

*appendable*.**append**([*a*, [*b*, [*c*, ...]]]: object) · [source](src/mixin.js)

If any arguments are provided, append those G3 objects to *appendable*,
otherwise return the current list of appended objects, defaulting to the empty list.
The Javascript spread operator `...` is useful to append from a list,
e.g. *appendable*.append(...*xs*).

*appendable*.**defs**([*a*, [*b*, [*c*, ...]]]: object) · [source](src/mixin.js)

Similar to *appendable*.**append**() but when this object is drawn the appended *defs*
are added to a [`<defs>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs)
child of the top-level `<svg>` container.
These elements aren't rendered directly but referenced from other parts of the SVG.


### SVG elements

G3 provides simple wrappers to support deferred rendering of standard SVG elements.
The [g3.put()](#g3-put) object is a convenience wrapper for an SVG `<g>` element,
and [g3.element()](#g3-element) supports arbitrary elements.


<a name="g3-put" href="#g3-put">#</a>
g3.**put**() · [source](src/common.js)

Creates a [stylable](#stylable), [transformable](#transformable),
[appendable](#appendable) container object which renders an
SVG `<g>` element with its children when called.


<a name="g3-element" href="#g3-element">#</a>
g3.**element**(*element*: string[, *attrs*: object]) · [source](src/common.js)

Creates a [stylable](#stylable), [appendable](#appendable) object that
renders the named SVG *element* when called.
If *attrs* is defined, it defines a dictionary of attributes
like `{name: value, ...}` which are added to the element.

*element*.**attr**(*attribute*: any) · [source](src/common.js)

If *attribute* is defined, adds an attribute to the element,
otherwise return the full dictionary of current attributes, defaulting to empty.
