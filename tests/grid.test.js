import * as d3 from 'd3';
import * as g3 from '../src/g3.js';

describe('g3.grid', () => {
    let svg;

    beforeEach(() => {
        document.body.innerHTML = '<svg width="500" height="500"></svg>';
        svg = d3.select('svg');
    });

    it('should draw a grid with major and minor lines', () => {
        const myGrid = g3.grid()
            .x(0)
            .y(0)
            .width(600)
            .height(400)
            .xmajor(100)
            .ymajor(100)
            .xminor(25)
            .yminor(25);

        expect(myGrid.x()).toBe(0);
        expect(myGrid.y()).toBe(0);
        expect(myGrid.width()).toBe(600);
        expect(myGrid.height()).toBe(400);
        expect(myGrid.xmajor()).toBe(100);
        expect(myGrid.ymajor()).toBe(100);
        expect(myGrid.xminor()).toBe(25);
        expect(myGrid.yminor()).toBe(25);

        svg.call(myGrid);

        const gridGroup = svg.select('g.g3-grid');
        expect(gridGroup.empty()).toBe(false);

        expect(gridGroup.selectAll('g.g3-grid-line').size()).toBe(5+7);
        expect(gridGroup.selectAll('line.g3-grid-hairline').size()).toBe(3*(6+4));
    });
});