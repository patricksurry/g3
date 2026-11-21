import * as d3 from 'd3';
import { d3sel } from './common';
import { stylable, appendId, identity } from './mixin';
import type {
    SelectorOrSelection,
    GaugeComponent,
    TickShape,
    LabelOrientation,
    AxisSectorComponent,
    AxisTicksComponent,
    AxisLabelsComponent
} from './types';
import { ends, isFullCircle } from './scale';


function tickvals(vs?: number[] | string[], step?: number, start?: number, g?: GaugeComponent): any[] {
    if (typeof vs !== 'undefined') return vs.slice();

    let values: any[];

    if (typeof step === 'number' && g) {
        const [lo, hi] = ends<number>(g.measure().domain().slice().sort((a: number, b: number) => a - b));
        values = [];
        for (let v = start ?? Math.ceil(lo/step)*step; v <= hi; v += step)
            values.push(v);
        if (
            isFullCircle(g.kind(), g.measure().range())
            && values.includes(lo)
            && values.includes(hi)
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

    const sector: AxisSectorComponent = stylable<AxisSectorComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const [v0, v1] = values || ends(g!.measure().domain());
            const _ = d3sel(sel).append('path');
            g!.redraw(() => _.attr('d', g!.sectorpath(v0, v1, size, inset)));
            sector.stylable(_);
        },
        {
            size(_?: number): any {
                return arguments.length ? (size = _!, sector) : size;
            },
            inset(_?: number): any {
                return arguments.length ? (inset = _!, sector) : inset;
            },
        }
    )).class('g3-axis-sector');

    return sector;
}


export function axisLine(): AxisSectorComponent {
    return axisSector().size(0).class('g3-axis-line');
}


export function axisTicks(vs?: number[]): AxisTicksComponent {
    let shape: TickShape = 'tick',
        size = 10,
        width = 1,
        inset = 0,
        step: number | undefined,
        start: number | undefined;
    const values = vs && vs.slice();

    const ticks: AxisTicksComponent = stylable<AxisTicksComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const tickValues = tickvals(values, step, start, g);
            const _ = d3sel(sel).append('g');
            ticks.class('g3-axis-ticks-' + shape).stylable(_);
            const entered = _.selectAll(null)
                .data(tickValues)
              .enter().append('g');
            g!.redraw(() => entered.attr('transform', (d: any) => g!.marktransform(d, inset)));

            switch (shape) {
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
        },
        {
            step(_?: number): any {
                return arguments.length ? (step = _, ticks) : step;
            },
            start(_?: number): any {
                return arguments.length ? (start = _, ticks) : start;
            },
            shape(_?: TickShape): any {
                return arguments.length ? (shape = _!, ticks) : shape;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, ticks) : size;
            },
            width(_?: number): any {
                return arguments.length ? (width = _!, ticks) : width;
            },
            inset(_?: number): any {
                return arguments.length ? (inset = _!, ticks) : inset;
            },
        }
    )).class('g3-axis-ticks');

    return ticks;
}


export function axisLabels(vs?: number[] | Record<string | number, string | number>): AxisLabelsComponent {
    const isMap = typeof vs === 'object' && vs !== null && !Array.isArray(vs),
        orientations: readonly LabelOrientation[] = ['fixed', 'relative', 'upward', 'clockwise', 'counterclockwise'];

    let orient: LabelOrientation = 'fixed',
        size = 20,
        inset = 25,
        rotate = 0,
        step: number | undefined,
        start: number | undefined,
        format: (v: any) => any = isMap ? (v: any) => (vs as Record<string | number, string | number>)[v] : identity;
    const values = isMap ? Object.keys(vs) : vs;

    const labels: AxisLabelsComponent = stylable<AxisLabelsComponent>(Object.assign(
        function(sel: SelectorOrSelection, g?: GaugeComponent) {
            const labelValues = tickvals(values, step, start, g),
                circPath = orient.endsWith('clockwise'),
                pathId = circPath ? appendId('axis-label-path-') : undefined;

            const _ = d3sel(sel).append('g');
            labels.stylable(_);
            const entered = _.selectAll(null)
                .data(labelValues)
              .enter().append('g');
            if (circPath) {
                const r = g!.r() - inset,
                    cw = orient == 'clockwise' ? 1 : 0;
                entered.append('path')
                    .attr('id', (_d: any, i: number) => `${pathId}-${i}`)
                    .attr('d', `M 0,${r} A ${r},${r},0,1,${cw},0,-${r} A ${r},${r},0,1,${cw},0,${r}`)
                    .attr('style', 'visibility: hidden')
                    .attr('transform', (d: any) => g!.metrictransform(d));
            }
            const textEl = entered.append('text')
                .attr('font-size', size);
            if (circPath) {
                textEl.append('textPath')
                    .attr('startOffset', '50%')
                    .attr('href', (_d: any, i: number) => `#${pathId}-${i}`)
                    .text(format);
            } else {
                textEl.text(format);
                g!.redraw(() => textEl.attr('transform', (d: any) => {
                    let xform = g!.marktransform(d, inset),
                        rot = rotate;
                    if (g!.kind() == 'circular') {
                        if (orient == 'fixed') xform += ' ' + g!.metrictransform(d, true);
                        else if (orient == 'upward') {
                            const v = ((g!.measure()(Number(d) + rot) % 360) + 360) % 360;
                            if (90 < v && v < 270) rot += 180;
                        }
                    }
                    if (rot) xform += ` rotate(${rot})`;
                    return `${xform}`;
                }));
            }
        },
        {
            step(_?: number): any {
                return arguments.length ? (step = _, labels) : step;
            },
            start(_?: number): any {
                return arguments.length ? (start = _, labels) : start;
            },
            orient(_?: LabelOrientation): any {
                if (_ && !orientations.includes(_))
                    throw `g3.axisLabels().orient() unknown orientation '${_}'`;
                return arguments.length ? (orient = _!, labels) : orient;
            },
            size(_?: number): any {
                return arguments.length ? (size = _!, labels) : size;
            },
            inset(_?: number): any {
                return arguments.length ? (inset = _!, labels) : inset;
            },
            rotate(_?: number): any {
                return arguments.length ? (rotate = _!, labels) : rotate;
            },
            format(_?: (v: any) => any): any {
                return arguments.length ? (format = _!, labels) : format;
            },
        }
    )).class('g3-axis-labels');

    return labels;
}
