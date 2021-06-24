//TODO more pointer shapes, standard names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg

export var pointerShapes = {
    needle: (_) => {
        _.append('rect')
            .attr('class', 'indicator-needle')
            .attr('x', -1).attr('width', 2)
            .attr('y', -90).attr('height', 100)
        _.append('circle')
            .attr('class', 'indicator-hub')
            .attr('r', 5);
    },
    blade: (_) => {
        let g = _.append('g')
            .attr('transform', 'scale(5.625 -5.625)');
        g.append('path')
            .attr('class', 'indicator-blade')
            .attr('d', 'M 0,9 L 0.6,7 l 0,-7 l -1.2,0 l 0,7 z')
        g.append('circle')
            .attr('class', 'indicator-hub')
            .attr('r', 1.25);
    },
    dagger: (_) => {
        let g = _.append('g')
            .attr('transform', 'scale(5.625 -5.625)');
        g.append('path')
            .attr('class', 'indicator-blade')
            .attr('d', 'M 0,6 L 1.2,3 L 0.6,0 L -0.6,0 L -1.2,3 Z');
        g.append('path')
            .attr('class', 'indicator-handle')
            .attr('d', 'M 0.6, 0 L 1.6,-3 A 3,3,0,0,0,-1.6,-3 L -0.6,0 Z');
        g.append('circle')
            .attr('class', 'indicator-hub')
            .attr('r', 1.25);
    },
    rondel: (_) => {
        let g = _.append('g')
            .attr('transform', 'scale(5.625 -5.625)');
        g.append('path')
            .attr('class', 'indicator-blade')
            .attr('d', 'M 0,16 L 1.6,0 l -3.2,0 z');
        g.append('circle')
            .attr('class', 'indicator-hub')
            .attr('r', 2.4);
    },
    sword: (_) => {
        let g = _.append('g')
            .attr('transform', 'scale(5.625 -5.625)');
        g.append('path')
            .attr('class', 'indicator-blade')
            .attr('d', 'M 0,16 L 0.75,14 l 0,-12 l -1.5,0 l 0,12 z');
        g.append('rect')
            .attr('class', 'indicator-handle')
            .attr('height', 8).attr('width', 1.5)
            .attr('x', -0.75).attr('y', -6);
        g.append('circle')
            .attr('class', 'indicator-hub')
            .attr('r', 1.25);
        g.append('circle')
            .attr('class', 'indicator-pin')
            .attr('r', 0.5);
        g.append('circle')
            .attr('class', 'indicator-pommel')
            .attr('r', 1.25)
            .attr('cy', -6);
    },
    'aircraft-heading': (_) => {
        _.append('path')
            .attr('transform', "translate(-160, -160) scale(0.8)")
            .attr('d', "M 200.45288,260.80553 L 203.16177,253.84124 L 225.12833,263.88589 C 227.03295,264.83725 228.33805,264.53956 228.33805,262.63589 L 228.40255,256.61982 C 228.40255,250.22869 224.75105,247.90625 219.51131,243.70732 L 208.47788,235.31446 L 211.28639,196.92161 L 261.23772,213.1716 C 263.62163,213.95469 264.64806,212.98991 264.64806,211.20732 L 264.82432,201.9216 C 264.82432,194.61271 260.92135,191.45797 255.6207,187.81446 L 213.09186,157.27875 C 212.31569,139.15817 210.07741,119.6713 200.45288,103.52874 C 190.82836,119.6713 188.59008,139.15817 187.81391,157.27875 L 145.28507,187.81446 C 139.98442,191.45797 136.08145,194.61271 136.08145,201.9216 L 136.25771,211.20732 C 136.25771,212.98991 137.28414,213.95469 139.66805,213.1716 L 189.61938,196.92161 L 192.42789,235.31446 L 181.39446,243.70732 C 176.15472,247.90625 172.50322,250.22869 172.50322,256.61982 L 172.56772,262.63589 C 172.56772,264.53956 173.87282,264.83725 175.77744,263.88589 L 197.744,253.84124 L 200.45288,260.80553 z");
    },
    'aircraft-turn': (_) => {
        let g = _.append('g')
            .attr('transform', 'scale(0.5) translate(-436, -315)');
        g.append('path')
            .attr('d', "m 435.64988,289.47018 c -12.33394,0 -22.41326,9.69394 -23.03125,21.875 l -121.9375,-0.22694 c -4.43702,0.0318 -5.34776,6.2322 -0.5,7.0625 l 126.375,7.25819 c 4.14867,6.10563 11.15189,10.125 19.09375,10.125 7.92634,0 14.91358,-4.00188 19.0625,-10.09375 l 126.9375,-7.28944 c 4.84776,-0.8303 3.93702,-7.0307 -0.5,-7.0625 l -122.46875,0.25819 c -0.6019,-12.19506 -10.68685,-21.90625 -23.03125,-21.90625 z");
        g.append('path')
            .attr('d', "m 382.64058,299.50149 c 4.38251,0.0518 102.16734,0.0518 106.54985,0 4.38251,-0.0518 5.82754,-6.6971 -0.25253,-7.17567 l -44.44671,-2.12492 c -3.68642,-0.66946 -4.02856,-2.28053 -4.29315,-4.3671 l -0.50508,-25.22318 c 0,-3.88798 -7.42864,-3.96105 -7.42864,0 l -0.50508,25.22318 c -0.26459,2.08657 -0.60673,3.69764 -4.29315,4.3671 l -44.57298,2.12492 c -6.08007,0.47857 -4.63504,7.12387 -0.25253,7.17567 z");
    },
};
