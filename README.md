# G3: a flexible pure Javascript framework for steam gauge instrument panels

G3&mdash;a tortured backronym for "generic gauge grammar"&mdash;is a flexible Javascript
framework for designing and running steam gauge style instrument panels
for flight (or other) simulators, to display externally provided metrics.
Here's an example of some of the pre-defined flight instruments
(you can also see a [live demo](https://patricksurry.github.io/)):

<div align='center'>
    <img src="doc/flightpanel.png" alt='flight panel screenshot'>
</div>

G3 is part of a quixotic pandemic project to build a
[DHC-2 Beaver](https://en.wikipedia.org/wiki/De_Havilland_Canada_DHC-2_Beaver)
cockpit simpit.
Although there are plenty of [alternatives](#resources)
for creating instrument panels,
I decided it would be fun to roll my own based on pure Javascript with SVG using [D3](https://d3js.org/).
After several iterations, I ended up very close to
the pattern suggested by
[Mike Bostock](https://bost.ocks.org/mike/)
several years ago in
[Towards reusable charts](https://bost.ocks.org/mike/chart/).

The base G3 package lets you define gauges and assemble them into control panels.
The G3-examples package also includes a bunch of predefined gauges and a few panels
that you can use or modify as desired.

- [Install G3](#installing)
- [Get started](#getting-started) by running a panel or designing a new gauge
- Give back by [contributing](#contributing) new gauges and panels
- Explore related [resources](#resources)
- Dig in to the full [API reference](#api-reference)

**Keywords**: G3 D3 Javascript SVG flight simulator gauges instruments control panel metrics telemetry

## Installing

TODO

Create a project directory and install G3:

```bash
npm install @patricksurry/g3
```

... or something like that

## Getting started

### Display an existing panel


Check things are working by creating a minimal HTML file to display an existing panel with fake metrics.
Create a new file called `test.html` containing:

```html
<html>
  <body>
    <script src="./g3-examples.min.js"></script>
    <script>
g3.panel('DHC2FlightPanel')('body');
    </script>
  </body>
</html>
```
This tells G3 to retrieve the pre-defined `DHC2FlightPanel` panel,
and draw it as a new SVG object into the HTML `<body>` element.
By default the panel provides fake metrics so you can see your gauges moving
in a somewhat realistic but random way.
Save the file and use a terminal window to serve it locally using your favorite HTTP server.
For example
```shell
python -m http.server
```
or
```shell
npx http-server -p 8000
```
and point your browser at http://localhost:8000/test.html.
You should see something that looks like the [live demo](https://patricksurry.github.io/) above.

### Create a panel with existing gauges

The [examples folder](https://github.com/patricksurry/d3-gauges/tree/master/src/examples)
included with `G3-examples`contains a number of predefined gauges including
[clocks](https://github.com/patricksurry/d3-gauges/blob/master/src/examples/clocks.js),
[flight instruments](https://github.com/patricksurry/d3-gauges/blob/master/src/examples/flight.js),
[engine gauges](https://github.com/patricksurry/d3-gauges/blob/master/src/examples/engine.js),
and [electrical gauges](https://github.com/patricksurry/d3-gauges/blob/master/src/examples/electrical.js);
as well as a few
[example panels](https://github.com/patricksurry/d3-gauges/blob/master/src/examples/panels.js).
You can see them all by modifying `test.html` to display the `DebugPanel` which
automatically displays every registered gauge,
as well as exploded views of all subgauges.

Let's make a panel that shows a clock and a heading gauge side by side.
Create a new HTML file called `panel.html` that looks like this:
```html
<html>
  <body>
    <script src="./g3-examples.min.js"></script>
    <script>
var panel = g3.panel('SimplePanel')
        .width(600).height(300)
        .append(
            g3.put().x(150).y(150).append(g3.gauge('clockSimple')),
            g3.put().x(450).y(150).append(g3.gauge('headingDHC2')),
        );
panel('body');
    </script>
  </body>
</html>
```
This defines a new panel, `SimplePanel`, which---when called---creates a 600x300
SVG container, retrieves existing gauges, and places them at (150,150) and (450,150).
By convention gauges are drawn assuming a radius 100 circle,
but you can simply add `.scale(1.5)` to the `put()` if you prefer radius 150, say.
Serve locally as before and browse to http://localhost:8000/panel.html
and you should see something like this:

<div align='center'>
    <img src="doc/simplepanel.png" alt='simple panel screenshot'>
</div>



### Display real metrics

We've built a panel, but it's displaying fake metrics.
We can poll for external metrics by specifying a URL
that responds with a [JSON](https://www.json.org/json-en.html)
object containing the current metrics,
and optionally a polling interval (default 250ms, or four times per second).
Let's add that to `panel.html`, replacing `panel('body');` with:

```js
...
panel.interval(500).url('/metrics/fake.json')('body');
...
```

Now we just need our server to provide metrics at the endpoint.
First we'll create an endpoint that serves fake metrics:
the behavior will look similar at first but we can hook it up to whatever we want.

TODO - include python fastapi example

TODO - show how we can change a specific metric

More usefully, we'd have our server collect metrics from our simulation,
for example via [SimConnect](https://github.com/odwdinc/Python-SimConnect),
and provide those in our endpoint.

TODO - example of SimConnnect


### Create a new gauge



## Contributing

TODO - set up a development environment

Test locally via `src/index.html` and `npm run start`.

Use `rollup` to package, via

```sh
npm run build
```

## Resources

[Towards reusable charts](https://bost.ocks.org/mike/chart/a)
[Wiki](https://github.com/patricksurry/d3-gauges/wiki)



https://github.com/odwdinc/Python-SimConnect

- [Sim Innovations - Flight simulation solutions](https://siminnovations.com/)
- [SimVimCockpit - Configurator](https://simvim.com/)
- [MobiFlight + Arduino + Your Favorite Flight Simulator = Your Home Cockpit!](https://www.mobiflight.com/en/index.html)




## API reference

### Key concepts

A [panel](#panel) is a container that presents a collection of [gauges](#gauge),
and orchestrates the display of [metrics](#metrics),
normally retrieved by polling some external source.
(G3 also generates fake time-varying metrics for development purposes.)
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
in the named metric so that the containing [panel](#panel) can send updates as the metric changes.

### Gauge

TODO link to the different subsections with anchors like D3 #.

g3.**gauge**(*identifier*: string) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

Create a configurable gauge rendering function, registered with the required *identifier*,
or return an existing gauge renderer if the identifier has already been registered.
Use its getter/setter methods (below) to configure it, like *gauge*.r(100),
then call it to draw it within an SVG document like *gauge*(d3.select('svg.mygauge')).
Typically *gauge* is not drawn directly
but instead appended to a [panel](#panel) which will draw it and manage metric updates.
A *gauge* is also stylable and appendable via [mixins](#mixins).

*gauge*.**metric**([*metric*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *metric* is specified, set the name of the metric that this gauge will indicate.
If *metric* is not specified, return the name of the current metric, defaulting to *undefined*.

*gauge*.**unit**([*unit*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

*(Currently unused.)*
If *unit* is specified, set the unit of measurement for the current metric,
otherwise return the current unit, defaulting to *undefined*.
In future this is intended to support better discovery of metric units and potentially
conversion between compatible units (feet ⟷ meters, inches of mercury ⟷ hectopascals, etc)

*gauge*.**kind**([*kind*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *kind* is specified, it must be either the string `"circular"` or `"linear"`
to select how the axis is displayed for this gauge.
If *kind* is not specified, return the current value, defaulting to `"circular"`.

*gauge*.**measure**([*measure*: object]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *measure* is specified, it defines a [d3.scale](https://github.com/d3/d3-scale)-like
function which transforms metric values to the axis coordinate system of the gauge,
and provides *measure*.domain() and *measure*.range() accessors reporting the expected
range of the source metric and axis coordinates respectively.
For example, on a gauge with a circular axis,
*gauge*.measure(d3.scaleLinear().domain([0,10]).range([-90, 90]))
would map a metric expected to take values between 0 and 10 to a semi-circular axis on the top half of the gauge face.

*gauge*.**r**([*radius*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *radius* is specified it defines the size of the gauge in SVG units,
otherwise the current *radius* is returned, defaulting to 100.
For circular gauges, the axis line will be placed here.

*gauge*.**autoindicate**([*flag*: bool]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *flag* is set, the boolean value defines whether this gauge should self-indicate,
otherwise return the current value, defaulting to false.
Most gauges are fixed and use a pointer, text or style to indicate the current metric value.
A self-indicating gauge transforms itself so that the axis location corresponding
to the current metric value stays at a fixed position.
A circular gauge rotates so the correct axis value is shown at the top,
and a linear gauge slides itself to the correct axis value is shown centered at *x*=0.

*gauge*.**clip**([*clippath*: function]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *clippath* is set, it defines a G3 drawing function that, when called, draws a clipping path for this gauge.
Otherwise, it returns the current drawing function, defaulting to undefined.
For complex nested gauges, like the attitude indicator, it is sometimes convenient to clip to a simple circle
via *gauge*.clip(g3.gaugeFace()).


g3.**gaugeFace**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

Returns a [stylable](#mixins) *gaugeFace* object, which when called will draw a circle with CSS class `g3-gauge-face`.

*gaugeFace*.**r**([*r*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *r* is defined, set the radius for the circular face, otherwise return the current value, defaulting to 100.

*gaugeFace*.**window**([*window*: object]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

If *window* is defined, use that drawing function to define an
[SVG mask](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)
on the gauge face to "cut out" a window.  Otherwise, return the current window defaulting to undefined.


g3.**gaugeLabel**([*value*: string [, *opts*: object]]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

Create a [stylable](#mixins) *gaugeLabel* function is called to add SVG text to a gauge.
If *value* is set, it defines the initial value of the label.
The optional *opts* can be used as a shortcut for the accessor functions.
For example `g3.gaugeLabel("hello", {x: 20, y: 20})`
is equivalent to `g3.gaugeLabel().value("hello").x(20).y(20)`.

*gaugeLabel*.**value**([*value*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

Set the label text to *value* if defined, otherwise return the current value.

*gaugeLabel*.**x**([*x*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

*gaugeLabel*.**y**([*y*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

*gaugeLabel*.**dx**([*dx*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

*gaugeLabel*.**dy**([*dy*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

Set or return the *x*, *y*, *dx* or *dy* values of the underlying
[SVG text element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)
respectively.


g3.**gaugeScrew**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

stylable, transformable

r=8
shape=slotted [phillips, robertson]

### Axis

g3.**axisLine**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)

Draws an axis line spanning the gauge metric's domain.
Essentially a shortcut for g3.axisSector([*min, max*]).size(0).inset(0).class('g3-axis-line')
where [*min, max*] are the smallest and largest values of this gauge's metric.
*axisLine* is stylable.

g3.**axisSector**(*vs*: array[number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)

stylable

size = 5
inset = 0

g3.**axisTicks**([*vs*: array[number]]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)

stylable

shape = 'tick' [dot, wedge, rect],
        size = 10,
        width = 1,
        inset = 0,
        values = vs && vs.slice(),
        step,

g3.**axisLabels**([*vs*: array[number]]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)


/*
orientation:
- fixed: normal reading orientation independent of axis position
- relative: relative to axis orientation at label position, with normal reading orientation when axis is rotated to top
- cw / ccw: text is drawn along the axis path in either clockwise or counter-clockwise direction
- rotate: rotation to apply w.r.t. fixed or relative orientation
- upright: choose between rotate and rotate+180 direction based on whichever is pointing up
*/
var orient = 'fixed',  // 'relative', 'cw', 'ccw'
    upright = true,  //TODO
    size = 20,
    inset = 25,
    rotate = 0,
    values = isMap ? Object.keys(vs) : vs,
    format = isMap ? v => vs[v] : identity,
    step, start;



### Indicate

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)


g3.**indicateText**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)

stylable

format
size=20

g3.**indicatePointer**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)

stylable, appendable

rescale
shape [=needle]

<div align='center'>
    <img src="doc/pointers.png" alt='G3 pointer shapes'>
</div>

g3.**indicateStyle**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)

appendable

trigger = identity
styleOn = {opacity: 1},
styleOff = {opacity: 0}

g3.**statusLight**() · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

### Panel

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/panel.js)

### Mixins

Many G3 object support standard configuration options via mixins.

**stylable** objects support CSS styling,
by adding class names, element styles, or inline CSS via the
[@emotion/css package](https://www.npmjs.com/package/@emotion/css).

*stylable*.**style**([*style*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If *style* is defined, set the object's inline style property, otherwise return the current inline style value.

*stylable*.**class**([*class*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If *class* is defined, add it as a space-separated list of class names to the object's class property,
otherwise return the current space-separated list of classes.

*stylable*.**css**([*css*: string]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If *css* is defined, interpret as inline CSS rules using [@emotion/css](https://www.npmjs.com/package/@emotion/css),
which injects the CSS into the HTML doc using a new class name and adds that class to the current list of classes.
If *css* is not defined, return the current space-separated list of classes.
This can be helpful to override the default style of child elements that are not directly stylable themselves.

**transformable** objects support
[SVG transformation](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform)
via translation, scaling and rotation.
Note the resulting transformation is always applied as `translate(...) scale(...) rotate(...)`
regardless of the order in which the transformation is configured.
Also note that applies transformations right to left, so rotation happens first,
then scaling, and finally translation.

*transformable*.**x**([*x*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

*transformable*.**y**([*y*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If *x* (*y*) is defined, set the current translation in the x (y) direction,
otherwise return the current value, which defaults to 0.

*transformable*.**scale**([*sx*: number, [*sy*: number]]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If both *sx* and *sy* are defined, set the corresponding scale in each dimension.
If only one value *sx* is provided, set a common scale in both dimensions.
If no arguments are provided, return an array with the current [*sx, sy*] values,
which default to [1, 1].

*transformable*.**rotate**([*angle*: number]) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If *angle* is defined, set the current rotation, otherwise return the current value, which defaults to 0.

**appendable** objects support appending of child objects,
as well as shared global definitions like fill patterns, gradients or SVG filters.
This allows flexible nested configuration of panels and gauges.

*appendable*.**append**([*a*, [*b*, [*c*, ...]]]: object) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

If any arguments are provided, append those G3 objects to *appendable*,
otherwise return the current list of appended objects, defaulting to the empty list.
The Javascript spread operator `...` is useful to append from a list,
e.g. *appendable*.append(...*xs*).

*appendable*.**defs**([*a*, [*b*, [*c*, ...]]]: object) · [source](https://github.com/patricksurry/d3-gauges/blob/master/src/mixin.js)

Similar to *appendable*.**append**() but when this object is drawn the appended *defs*
are added to a [`<defs>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs)
child of the top-level `<svg>` container.
These elements aren't rendered directly but referenced from other parts of the SVG.


### SVG elements

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/common.js)


## TODO

- more throw messages. e.g. for g.measure(2) should be g.measure()(2) type of 2 isn't function

- re-usability is not great, e.g. draw & modify different versions of a gauge, or reuse tick labeling components

- upright axis label style

- custom tick mark shape option for VSI arrows

- fix drop-shadow for window cutout in altitudeDHC2 - apply to mask?

- more pointer shapes, standardize names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

- Omega tachymeter example

- diff on prior metrics + warn on missing metric after first call?

- fish-eye axis style for a magnetic compass, where we're looking at a disc edge on


