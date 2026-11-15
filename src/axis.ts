import * as d3 from 'd3';
import { d3sel } from './common';
import { stylable, appendId, identity } from './mixin';
import type { SelectorOrSelection, AxisSectorComponent, AxisTicksComponent, AxisLabelsComponent } from './types';


function tickvals(vs?: number[] | string[], step?: number, start?: number, g?: any): any[] {
    if (typeof vs !== 'undefined') return vs.slice();

    let values: any[];

    if (typeof step === 'number' && g) {
        const domain = g.measure().domain().slice();
        const range = g.measure().range();
        domain.sort((a: number, b: number) => a - b);
        values = [];
        for (let v = start ?? Math.ceil(domain[0]/step)*step; v <= domain[1]; v += step)
            values.push(v);
        if (
            g.kind() == 'circular'
            && ((range[0] - range[1]) % 360 == 0)
            && values.includes(domain[0])
            && values.includes(domain[1])
        ) values.pop();
    } else if (g) {
        values = g.measure().ticks();
    } else {
        values = [];
    }
    return values;
}


export function axisSector(vs?: number[]): AxisSectorComponent {
    const values = vs ? vs.slice() : null;
    let size = 5,
        inset = 0;
    function sector(sel: SelectorOrSelection, g: any) {
        const _ = d3sel(sel)
            .append('path')
            .attr('d', g.sectorpath(...(values || g.measure().domain()), size, inset));
        (sector as any).stylable(_);
    }
    (sector as any).size = function(_?: number) {
        return arguments.length ? (size = _!, sector) : size;
    };
    (sector as any).inset = function(_?: number) {
        return arguments.length ? (inset = _!, sector) : inset;
    };
    return (stylable(sector) as unknown as AxisSectorComponent).class('g3-axis-sector');
}


export function axisLine(): AxisSectorComponent {
    return axisSector().size(0).class('g3-axis-line');
}


export function axisTicks(vs?: number[]): AxisTicksComponent {
    let shape = 'tick',
        size = 10,
        width = 1,
        inset = 0,
        step: number | undefined,
        start: number | undefined;
    const values = vs && vs.slice();
    function ticks(sel: SelectorOrSelection, g: any) {
        const tickValues = tickvals(values, step, start, g);
        const _ = d3sel(sel).append('g');
        (ticks as any).class('g3-axis-ticks-' + shape).stylable(_);
        const entered = _.selectAll(null)
            .data(tickValues)
          .enter().append('g')
            .attr('transform', (d: any) => g.marktransform(d, inset));

        switch(shape) {
            case 'dot':
                entered.append('circle').attr('r', size);
                break;
            case 'wedge':
                entered.append('path').attr('d', `M 0,${size} L ${width/2},0 L ${-width/2},0 z`);
                break;
            case 'rect':
                entered.append('rect').attr('width', width).attr('height', size).attr('x', -width/2);
                break;
            default:
                entered.append('path').attr('d', d3.line()([[0, 0], [0, size]]));
        }
    }
    (ticks as any).step = function(_?: number) {
        return arguments.length ? (step = _, ticks) : step;
    };
    (ticks as any).start = function(_?: number) {
        return arguments.length ? (start = _, ticks) : start;
    };
    (ticks as any).shape = function(_?: string) {
        return arguments.length ? (shape = _!, ticks) : shape;
    };
    (ticks as any).size = function(_?: number) {
        return arguments.length ? (size = _!, ticks) : size;
    };
    (ticks as any).width = function(_?: number) {
        return arguments.length ? (width = _!, ticks) : width;
    };
    (ticks as any).inset = function(_?: number) {
        return arguments.length ? (inset = _!, ticks) : inset;
    };
    return (stylable(ticks) as unknown as AxisTicksComponent).class('g3-axis-ticks');
}


export function axisLabels(vs?: any): AxisLabelsComponent {
    const isMap = typeof vs === 'object' && vs !== null && !Array.isArray(vs),
        orientations = ['fixed', 'relative', 'upward', 'clockwise', 'counterclockwise'];

    let orient = 'fixed',
        size = 20,
        inset = 25,
        rotate = 0,
        step: number | undefined,
        start: number | undefined,
        format = isMap ? (v: any) => vs[v] : identity;
    const values = isMap ? Object.keys(vs) : vs;
    function labels(sel: SelectorOrSelection, g: any) {
        const labelValues = tickvals(values, step, start, g),
            circPath = orient.endsWith('clockwise'),
            pathId = circPath ? appendId('axis-label-path-') : undefined;

        const _ = d3sel(sel).append('g');
        (labels as any).stylable(_);
        const entered = _.selectAll(null)
            .data(labelValues)
          .enter().append('g');
        if (circPath) {
            const r = g.r() - inset,
                cw = orient == 'clockwise' ? 1: 0;
            entered.append('path')
                .attr('id', (_d: any, i: number) => `${pathId}-${i}`)
                .attr('d', `M 0,${r} A ${r},${r},0,1,${cw},0,-${r} A ${r},${r},0,1,${cw},0,${r}`)
                .attr('style', 'visibility: hidden')
                .attr('transform', (d: any) => g.metrictransform(d));
        }
        let textSel: any = entered.append('text')
            .attr('font-size', size);
        if (circPath) {
            textSel = textSel.append('textPath')
                .attr('startOffset', '50%')
                .attr('href', (_d: any, i: number) => `#${pathId}-${i}`);
        } else {
            textSel.attr('transform', (d: any) => {
                let xform = g.marktransform(d, inset),
                    rot = rotate;
                if (g.kind() == 'circular') {
                    if (orient == 'fixed') xform += ' ' + g.metrictransform(d, true);
                    else if (orient == 'upward') {
                        const v = ((g.measure()(d + rot) % 360) + 360) % 360;
                        if (90 < v && v < 270) rot += 180;
                    }
                }
                if (rot) xform += ` rotate(${rot})`;
                return `${xform}`;
            });
        }
        textSel.text(format);
    }
    (labels as any).step = function(_?: number) {
        return arguments.length ? (step = _, labels) : step;
    };
    (labels as any).start = function(_?: number) {
        return arguments.length ? (start = _, labels) : start;
    };
    (labels as any).orient = function(_?: string) {
        if (_ && !orientations.includes(_))
            throw `g3.axisLabels().orient() unknown orientation '${_}'`;
        return arguments.length ? (orient = _!, labels) : orient;
    };
    (labels as any).size = function(_?: number) {
        return arguments.length ? (size = _!, labels) : size;
    };
    (labels as any).inset = function(_?: number) {
        return arguments.length ? (inset = _!, labels) : inset;
    };
    (labels as any).rotate = function(_?: number) {
        return arguments.length ? (rotate = _!, labels) : rotate;
    };
    (labels as any).format = function(_?: (v: any) => any) {
        return arguments.length ? (format = _!, labels) : format;
    };
    return (stylable(labels) as unknown as AxisLabelsComponent).class('g3-axis-labels');
}
