import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';
import * as g3 from '../src/g3-contrib';

// Controls only ever send actions; their display follows what the hub reports.

describe('g3.contrib.switches', () => {
    let svg: d3.Selection<any, any, any, any>,
        ctrl: g3.GaugeController,
        sent: g3.Action[][];

    beforeEach(() => {
        document.body.innerHTML = '<svg></svg>';
        svg = d3.select('svg');
        ctrl = g3.gaugeController();
        sent = [];
        ctrl.sink(actions => sent.push(actions));
    });

    const fire = (sel: string, type: string, init: any = {}) => {
        const node = svg.select(sel).node() as Element;
        expect(node, `no element matching ${sel}`).toBeTruthy();
        const evt = type == 'wheel' ? new WheelEvent(type, { bubbles: true, ...init }) : new MouseEvent(type, { bubbles: true, ...init });
        node.dispatchEvent(evt);
    };
    const opacity = (sel: string) => (svg.select(sel).node() as HTMLElement).style.opacity;

    describe('toggle', () => {
        it('should send a set action flipping the reported value', () => {
            svg.call(g3.contrib.switches.toggle('master', 'MASTER'));
            ctrl({ metrics: { master: 0 } });
            fire('.g3-switch-control', 'click');
            ctrl({ metrics: { master: 1 } });
            fire('.g3-switch-control', 'click');
            expect(sent).toEqual([
                [{ op: 'set', metric: 'master', value: 1 }],
                [{ op: 'set', metric: 'master', value: 0 }],
            ]);
        });

        it('should start from a constant fake value', () => {
            svg.call(g3.contrib.switches.toggle('master'));
            expect(ctrl.fakes().master.fake).toBe(0);
        });
    });

    describe('button', () => {
        it('should set 1 while pressed and 0 when released, by default', () => {
            svg.call(g3.contrib.switches.button('starter', 'START'));
            fire('.g3-switch-control', 'pointerdown');
            fire('.g3-switch-control', 'pointerup');
            fire('.g3-switch-control', 'pointerleave');
            expect(sent).toEqual([
                [{ op: 'set', metric: 'starter', value: 1 }],
                [{ op: 'set', metric: 'starter', value: 0 }],
            ]);
        });

        it('should release when the pointer is cancelled', () => {
            svg.call(g3.contrib.switches.button('starter'));
            fire('.g3-switch-control', 'pointerdown');
            fire('.g3-switch-control', 'pointercancel');
            expect(sent[1]).toEqual([{ op: 'set', metric: 'starter', value: 0 }]);
        });

        it('should show as pressed immediately, without waiting for the hub', () => {
            svg.call(g3.contrib.switches.button('starter'));
            expect(opacity('.g3-switch-pressed')).toBe('0');
            fire('.g3-switch-control', 'pointerdown');
            expect(opacity('.g3-switch-pressed')).toBe('1');
            fire('.g3-switch-control', 'pointerup');
            expect(opacity('.g3-switch-pressed')).toBe('0');
        });

        it('should send a single trigger per press in trigger mode', () => {
            svg.call(g3.contrib.switches.button('cage', 'CAGE', { mode: 'trigger', event: 'attitudeCage' }));
            fire('.g3-switch-control', 'pointerdown');
            fire('.g3-switch-control', 'pointerup');
            expect(sent).toEqual([[{ op: 'trigger', event: 'attitudeCage' }]]);
        });

        it('should flip the reported value on each click in latch mode, and look pressed while it is 1', () => {
            svg.call(g3.contrib.switches.button('pitot', 'PITOT', { mode: 'latch' }));
            ctrl({ metrics: { pitot: 0 } });
            fire('.g3-switch-control', 'click');
            expect(sent).toEqual([[{ op: 'set', metric: 'pitot', value: 1 }]]);
            ctrl({ metrics: { pitot: 1 } });
            expect(opacity('.g3-switch-pressed')).toBe('1');
        });

        it('should call onPress instead of sending actions when given', () => {
            const onPress = vi.fn();
            svg.call(g3.contrib.switches.button(undefined, '7', { shape: 'rect', onPress }));
            fire('.g3-switch-control', 'pointerdown');
            fire('.g3-switch-control', 'pointerup');
            expect(onPress).toHaveBeenCalledTimes(1);
            expect(sent).toEqual([]);
        });
    });

    describe('rotary', () => {
        it('should send adjust actions with its step and limit hints', () => {
            svg.call(g3.contrib.switches.rotary('headingBug', 'HDG', { step: 5, min: 0, max: 360, wrap: true }));
            fire('.g3-switch-control', 'wheel', { deltaY: -100 });
            fire('.g3-switch-control', 'wheel', { deltaY: 100 });
            expect(sent).toEqual([
                [{ op: 'adjust', metric: 'headingBug', by: 5, min: 0, max: 360, wrap: true }],
                [{ op: 'adjust', metric: 'headingBug', by: -5, min: 0, max: 360, wrap: true }],
            ]);
        });

        it('should turn one detent (30 degrees) per step', () => {
            svg.call(g3.contrib.switches.rotary('headingBug', 'HDG', { step: 5 }));
            ctrl({ metrics: { headingBug: 5 } });
            expect(svg.select('.g3-indicate-pointer').attr('transform')).toBe('rotate(30)');
        });
    });

    describe('selector', () => {
        it('should default to OFF and ON positions', () => {
            svg.call(g3.contrib.switches.selector('mags'));
            const labels = svg.selectAll('.g3-axis-labels text').nodes().map((n: any) => n.textContent);
            expect(labels).toEqual(['OFF', 'ON']);
        });

        it('should step from the reported position', () => {
            svg.call(g3.contrib.switches.selector('mode', 'MODE', ['OFF', 'SBY', 'ON']));
            ctrl({ metrics: { mode: 1 } });
            fire('.g3-switch-control', 'wheel', { deltaY: -100 });
            expect(sent).toEqual([[{ op: 'set', metric: 'mode', value: 2 }]]);
        });

        it('should stop at the last position unless wrap is set', () => {
            svg.call(g3.contrib.switches.selector('mode', 'MODE', ['OFF', 'SBY', 'ON']));
            ctrl({ metrics: { mode: 2 } });
            fire('.g3-switch-control', 'wheel', { deltaY: -100 });
            expect(sent).toEqual([]);

            document.body.innerHTML = '<svg></svg>';
            svg = d3.select('svg');
            svg.call(g3.contrib.switches.selector('mode', 'MODE', ['OFF', 'SBY', 'ON'], { wrap: true }));
            ctrl({ metrics: { mode: 2 } });
            fire('.g3-switch-control', 'wheel', { deltaY: -100 });
            expect(sent).toEqual([[{ op: 'set', metric: 'mode', value: 0 }]]);
        });

        it('should space positions evenly whatever their values', () => {
            svg.call(g3.contrib.switches.selector('mags', 'MAGS', { 0: 'OFF', 1: 'R', 2: 'L', 5: 'BOTH' }, { range: [-60, 60] }));
            const angle = () => Number(svg.select('.g3-indicate-pointer').attr('transform').match(/rotate\((.*)\)/)![1]);
            ctrl({ metrics: { mags: 5 } });
            expect(angle()).toBeCloseTo(60);
            ctrl({ metrics: { mags: 1 } });
            expect(angle()).toBeCloseTo(-20);
        });
    });
});


describe('g3.contrib.radionav.transponder.KT76C', () => {
    let svg: d3.Selection<any, any, any, any>,
        ctrl: g3.GaugeController,
        sent: g3.Action[][];

    beforeEach(() => {
        document.body.innerHTML = '<svg></svg>';
        svg = d3.select('svg');
        ctrl = g3.gaugeController();
        sent = [];
        ctrl.sink(actions => sent.push(actions));
        svg.call(g3.contrib.radionav.transponder.KT76C());
    });

    const press = (label: string) => {
        const btn = svg.selectAll('.g3-switch-button').filter(function(this: any) {
            return d3.select(this).select('text').text() === label;
        });
        expect(btn.size(), `no button ${label}`).toBe(1);
        const node = btn.select('.g3-switch-control').node() as Element;
        node.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        node.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    };
    const text = (cls: string) => svg.select(`.${cls} text`).text();
    const lit = (cls: string) =>
        ((svg.select(`.${cls}`).node() as Element).closest('.g3-indicate-style') as HTMLElement).style.opacity === '1';
    const report = (metrics: Record<string, any>) => ctrl({ metrics });
    const ALT = 4, ON = 3, TST = 2, SBY = 1, OFF = 0;

    it('should show the code with leading zeros and the flight level', () => {
        report({ transponderCode: 400, transponderMode: ALT, transponderIdent: 0, 'altitude.pressure': 7400 });
        expect(text('kt76c-code')).toBe('0400');
        expect(text('kt76c-fl')).toBe('074');
    });

    it('should blank the display when only the mode changes to OFF', () => {
        report({ transponderCode: '7000', transponderMode: ALT, transponderIdent: 0, 'altitude.pressure': 7400 });
        expect(lit('kt76c-code')).toBe(true);
        expect(lit('kt76c-fl')).toBe(true);
        report({ transponderMode: OFF });
        expect(lit('kt76c-code')).toBe(false);
        expect(lit('kt76c-fl')).toBe(false);
        expect(lit('kt76c-alt')).toBe(false);
    });

    it('should show all segments in TST', () => {
        report({ transponderCode: '7000', transponderMode: TST, transponderIdent: 0, 'altitude.pressure': 7400 });
        expect(text('kt76c-code')).toBe('8888');
        expect(text('kt76c-fl')).toBe('888');
        expect(lit('kt76c-reply')).toBe(true);
    });

    it('should light R for ident only when replying', () => {
        report({ transponderCode: '7000', transponderMode: SBY, transponderIdent: 1, 'altitude.pressure': 0 });
        expect(lit('kt76c-reply')).toBe(false);
        report({ transponderMode: ON });
        expect(lit('kt76c-reply')).toBe(true);
    });

    it('should keep the old code while typing, and set the new one on the fourth digit', () => {
        report({ transponderCode: '7000', transponderMode: ALT, transponderIdent: 0, 'altitude.pressure': 0 });
        press('1'); press('2');
        expect(text('kt76c-code')).toBe('12--');
        expect(sent).toEqual([]);
        press('3'); press('4');
        expect(sent).toEqual([[{ op: 'set', metric: 'transponderCode', value: '1234' }]]);
        // until the hub reports the new code, the display shows the old one again
        expect(text('kt76c-code')).toBe('7000');
    });

    it('should back up one digit with CLR', () => {
        report({ transponderCode: '7000', transponderMode: ALT, transponderIdent: 0, 'altitude.pressure': 0 });
        press('1'); press('2'); press('CLR');
        expect(text('kt76c-code')).toBe('1---');
    });

    it('should set 1200 with VFR and send ident with IDT', () => {
        press('VFR');
        press('IDT');
        expect(sent).toEqual([
            [{ op: 'set', metric: 'transponderCode', value: '1200' }],
            [{ op: 'trigger', event: 'transponderIdent' }],
        ]);
    });

    it('should use configurable metric names', () => {
        document.body.innerHTML = '<svg></svg>';
        svg = d3.select('svg');
        const c = g3.gaugeController();
        svg.call(g3.contrib.radionav.transponder.KT76C({ code: 'xpdr.code', mode: 'xpdr.mode' }));
        expect(c.indicators()).toEqual(expect.arrayContaining(['xpdr.code', 'xpdr.mode']));
        expect(c.indicators()).not.toContain('transponderCode');
    });
});
