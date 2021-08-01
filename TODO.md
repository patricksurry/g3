## Open issues

- gaugeface window should take a ... of windows, see flight altitude

- cylindrical projection axis style for a magnetic compass, where we're looking at a disc edge on.
  an [orthographic globe projection](https://github.com/d3/d3-geo#geoOrthographic)
  would also work better 360 loop/roll attitude indicator

- indicateSector - needs redraw not global xform

- indicateOdometer - maybe indicateText option? - https://github.hubspot.com/odometer/
  or a collection of cylindrical self-indicators with a form of snapscale

- more throw messages. e.g. for g.measure(2) should be g.measure()(2) type of 2 isn't function

- how can we reuse common patterns, e.g. subdial formatting in speedmaster

- re-usability is not great, e.g. draw & modify different versions of a gauge, or reuse tick labeling components

- custom tick mark shape option for VSI arrows

- fix drop-shadow for window cutout in altitudeDHC2 - apply to mask?

- add more pointer shapes, with standard names e.g. https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

- metric update could diff w.r.t. prior metrics to avoid no-op updates

- metric update could warn to console when expected metric(s) are missing in the initial update
