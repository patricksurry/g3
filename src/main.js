import * as d3 from 'd3';
import * as g3 from './g3';

window.d3 = d3;
window.g3 = g3;

import * as panels from './config/panels.js';



//TODO package like d3, maybe as g3 pack?

//TODO add a panel registry like gauges to simplify reuse

//TODO github pages demo

//TODO diff on prior metrics + warn on missing metric after first call?

//TODO more throw messages. e.g. for g.measure(2) should be g.measure()(2) type of 2 isn't function

//TODO reusability is not great, e.g. draw & modify different versions of a gauge, or reuse tick labeling components

//TODO upright text style

//TODO tidy gauge.css

//TODO custom tick mark shape for VSI arrows

//TODO fix drop-shadow for window cutout in altitudeDHC2 - apply to mask?

//TODO more pointer shapes, standard names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

//TODO Omega tachymeter

//TODO avoid so many LCD ttf in dist (saves about 2.5Mb)?


//panels.GalleryPanel.interval(250).url('/metrics/fake.json')(d3.select('body'));
// panels.DHC2FlightPanel.interval(250).url('/metrics/fake.json')(d3.select('body'));
panels.DHC2FlightPanel.interval(250)(d3.select('body'));
panels.DHC2EnginePanel(d3.select('body'));
panels.ClockPanel(d3.select('body'));
// panels.DHC2FlightPanel(d3.select('body'));
//panels.ClockPanel(d3.select('body'));

