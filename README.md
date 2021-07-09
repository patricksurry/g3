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

```bash
npm install @patricksurry/g3
```

... or something like that

## Getting started

### Display an existing panel

Display your a predefined instrument panel with fake readings by pasting this HTML code into a file like `panel.html`:

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


### Create a panel with existing gauges

### Display real metrics

### Core concepts

A gauge has a circular face displaying a (semi-)circular axis scale, usually including tick marks and labels
and sometimes other decorations.  Each gauge provides an update function that displays a current value using
a rotating indicator, or by rotating itself.  Some gauges use multiple indicators to display the same underlying
value with different precisions, e.g. a standard clock with hours, minutes, seconds or an altimeter.

Composite gauges display multiple values, and provide an update function for each value.

Everything is a drawable function

```js
(selection, gauge) => { /* draw into selection, optionally using containing gauge information */}
```

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
