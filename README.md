# d3-gauges

Work in progress to provide flexible configuration for aircraft (or other) gauges using D3.

A gauge has a circular face displaying a (semi-)circular axis scale, usually including tick marks and labels 
and sometimes other decorations.  Each gauge provides an update function that displays a current value using
a rotating indicator, or by rotating itself.  Some gauges use multiple indicators to display the same underlying
value with different precisions, e.g. a standard clock with hours, minutes, seconds or an altimeter.

Composite gauges display multiple values, and provide an update function for each value.
