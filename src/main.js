import * as d3 from 'd3';
import * as g3 from './g3';

window.d3 = d3;
window.g3 = g3;

import * as panels from './config/panels.js';


//TODO github pages demo

//TODO diff on prior metrics + warn on missing metric after first call?

//TODO more throw messages. e.g. for g.measure(2) should be g.measure()(2) type of 2 isn't function

//TODO add electrical.js with volt and ammeter p25 milviz

//TODO upright text style

//TODO tidy gauge.css

//TODO fix drop-shadow for window cutout - apply to mask?

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

