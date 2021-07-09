# G3: a flexible pure Javascript framework for steam gauge instrument panels

G3 (backronym: generic gauge grammar) is a flexible framework for designing and
running "steam gauge" instrument panels for flight (or other) simulators, like this
(or see [live demo](https://patricksurry.github.io/)):

![flight panel screenshot](doc/flightpanel.png)

G3 is part of a quixotic pandemic project to build a
[DHC-2 Beaver](https://en.wikipedia.org/wiki/De_Havilland_Canada_DHC-2_Beaver)
cockpit simpit.
Although there are plenty of [alternatives](#resources)
for creating instrument panels,
I decided it would be fun to roll my own using [D3](https://d3js.org/).
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
You should see something like the [live demo](https://patricksurry.github.io/) above.

### Create a panel with existing gauges

The [examples folder](https://github.com/patricksurry/d3-gauges/tree/master/src/examples)
contains a number of predefined gauges (flight, electrical, engine, clocks) and panels.
You can see them all by using `test.html` to display the `DebugPanel` which includes
every defined gauge, including showing 'exploded' views of all subgauges.

Let's make a panel that simply shows a clock and a heading gauge.
Create a new html file called `panel.html` that looks like this:
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
panel('body')
    </script>
  </body>
</html>
```
This defines a new panel, `SimplePanel`, which creates a 600x300
SVG container, retrieves existing gauges and places them at (150,150) and (450,150).
By convention gauges are drawn assuming a radius 100 circle,
but you can simply add `.scale(1.5)` to the `put()` if you prefer radius 150, say.
Serve locally as before and browse to http://localhost:8000/panel.html
and you should see something like this:

TODO - test screenshot

### Display real metrics


### Core concepts

A *panel* is a container that presents a collection of *gauges*,
and orchestrates the display of *metrics*,
normally retrieved by polling some external source.
(It's also easy to generate fake metrics that vary over time for development purposes.)
A simple *gauge* displays some *metric*, 
using a *scale* to transform the raw metric 
and *indicate* that value on a local *axis*,
usually adorned with *ticks*, *labels* and other decorations.   
Typical "steam gauges" use a circular coordinate system to indicate
metric values using a rotating *pointer*.
More complex gauges might display the same metric at several scales
(e.g. a clock with a second, minute and hour hand,
or an altimeter displaying hundreds, thousands and ten-thousands of feet);
contain one or more sub-gauges that display different metrics
(like a combined oil and fuel temperature gauge);
or indicate values using text (such as a digital watch or radio frequency LCD)
or color rather than a pointer.
Some gauges *auto-indicate*, in that the gauge itself
tracks the metric value with respect to a fixed point,
for example the pressure reading of an altimeter
or the "day of month" of some watches
where the gauge axis rotates to be visible through a fixed window.

In order to keep things modular, and separate gauge configuration
from usage in a specific panel, 
G3 uses the pattern of closures with getter-setter methods
from Mike Bostock's approach to [reusable charts](https://bost.ocks.org/mike/chart/).
This means that most G3 components result in a configurable drawing function
which is eventually called by passing it a concrete [D3 selection](https://github.com/d3/d3-selection)
(or CSS selector string) into which it draws itself.
The typical drawing function looks like this:
```js
(selection, gauge) => { 
  /* append component instance to selection, perhaps based on parent gauge properties */
}
```
[Gauge components](#gauge) use [D3 dispatch](https://github.com/d3/d3-dispatch) to register interest
in the named metric so that the containing [panel](#panel) can send updates as the metric changes.

### Create a new gauge

## Contributing

TODO - set up a development environment


## Resources

[Towards reusable charts](https://bost.ocks.org/mike/chart/a)
[Wiki](https://github.com/patricksurry/d3-gauges/wiki)



https://github.com/odwdinc/Python-SimConnect

- [Sim Innovations - Flight simulation solutions](https://siminnovations.com/)
- [SimVimCockpit - Configurator](https://simvim.com/)
- [MobiFlight + Arduino + Your Favorite Flight Simulator = Your Home Cockpit!](https://www.mobiflight.com/en/index.html)




## API reference

### Gauge and panel examples

https://github.com/patricksurry/d3-gauges/blob/master/src/examples/panels.js

https://github.com/patricksurry/d3-gauges/blob/master/src/examples/clocks.js
https://github.com/patricksurry/d3-gauges/blob/master/src/examples/flight.js
https://github.com/patricksurry/d3-gauges/blob/master/src/examples/engine.js
https://github.com/patricksurry/d3-gauges/blob/master/src/examples/electrical.js

### Gauge

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

e.g.
<a name="arc" href="#arc">#</a> d3.<b>arc</b>() · [Source](https://github.com/d3/d3-shape/blob/master/src/arc.js)


### Axis

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)

### Indicate

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)

### Panel

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/panel.js)

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
