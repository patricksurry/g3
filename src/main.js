import * as d3 from 'd3';
import * as g3 from './g3';

window.d3 = d3;
window.g3 = g3;

import * as panels from './config/panels.js';


//TODO  - electrical.js with volt and ammeter p25 milviz

//TODO style status light gradient

//TODO screws, add roberston :)

//TODO upright text style

//TODO more pointer shapes, standard names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

//TODO Omega tachymeter

//TODO tidy gauge.css

//TODO fix drop-shadow for window cutout - apply to mask?


//panels.GalleryPanel.interval(250).url('/metrics/fake.json')(d3.select('body'));
panels.DHC2FlightPanel.interval(250).url('/metrics/fake.json')(d3.select('body'));
// panels.DHC2FlightPanel(d3.select('body'));
//panels.ClockPanel(d3.select('body'));

