# G3: a generic gauge grammar based on D3

Work in progress to provide flexible configuration for aircraft (or other) gauges using D3.

A gauge has a circular face displaying a (semi-)circular axis scale, usually including tick marks and labels 
and sometimes other decorations.  Each gauge provides an update function that displays a current value using
a rotating indicator, or by rotating itself.  Some gauges use multiple indicators to display the same underlying
value with different precisions, e.g. a standard clock with hours, minutes, seconds or an altimeter.

Composite gauges display multiple values, and provide an update function for each value.

![flight panel screenshot](doc/flightpanel.png)

## Resources

[Towards reusable charts](https://bost.ocks.org/mike/chart/a)
[Wiki](https://github.com/patricksurry/d3-gauges/wiki)



https://github.com/odwdinc/Python-SimConnect

- [Sim Innovations - Flight simulation solutions](https://siminnovations.com/)
- [SimVimCockpit - Configurator](https://simvim.com/)
- [MobiFlight + Arduino + Your Favorite Flight Simulator = Your Home Cockpit!](https://www.mobiflight.com/en/index.html)



## Installing

## Getting started

### Create a panel with existing gauges

### Serve metrics

### Create a gauge

## Reference

### Gauge and panel configuration

https://github.com/patricksurry/d3-gauges/blob/master/src/config/panels.js

https://github.com/patricksurry/d3-gauges/blob/master/src/config/clocks.js
https://github.com/patricksurry/d3-gauges/blob/master/src/config/flight.js
https://github.com/patricksurry/d3-gauges/blob/master/src/config/engine.js
https://github.com/patricksurry/d3-gauges/blob/master/src/config/electrical.js

### Gauge

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/gauge.js)

### Axis

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/axis.js)

### Indicate

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/indicate.js)

### Panel

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/panel.js)

### SVG

[source](https://github.com/patricksurry/d3-gauges/blob/master/src/common.js)


## TODO


- github pages demo

- diff on prior metrics + warn on missing metric after first call?

- more throw messages. e.g. for g.measure(2) should be g.measure()(2) type of 2 isn't function

- reusability is not great, e.g. draw & modify different versions of a gauge, or reuse tick labeling components

- upright axis label style

- custom tick mark shape for VSI arrows

- fix drop-shadow for window cutout in altitudeDHC2 - apply to mask?

- more pointer shapes, standardize names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

- Omega tachymeter
