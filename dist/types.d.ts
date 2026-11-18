import type * as d3 from 'd3';
export type D3Selection = d3.Selection<any, any, any, any>;
export type SelectorOrSelection = string | D3Selection;
export type TransitionFunction = (sel: D3Selection) => d3.Transition<any, any, any, any> | D3Selection;
export type RenderFunction = (sel: any, g?: GaugeComponent) => void;
export type GaugeKind = 'circular' | 'linear';
export type TickShape = 'tick' | 'dot' | 'wedge' | 'rect';
export type LabelOrientation = 'fixed' | 'relative' | 'upward' | 'clockwise' | 'counterclockwise';
export type ScrewShape = 'slotted' | 'phillips' | 'robertson';
export type PointerShape = 'needle' | 'blade' | 'dagger' | 'rondel' | 'sword' | 'wedge' | 'omega-second' | 'omega-baton-long' | 'omega-baton-short' | 'aircraft-heading' | 'aircraft-turn' | (string & {});
export interface StylableMixin<T> {
    stylable(selection: D3Selection): void;
    css(): string;
    css(_: string | Record<string, any>): T;
    class(): string;
    class(_: string): T;
    style(): string | undefined;
    style(_: string): T;
}
export interface TransformableMixin<T> {
    transformable(selection: D3Selection): void;
    x(): number;
    x(_: number): T;
    y(): number;
    y(_: number): T;
    scale(): [number, number];
    scale(x: number, y?: number): T;
    rotate(): number;
    rotate(_: number): T;
}
export interface InteractableMixin<T> {
    interactable(selection: D3Selection, ...args: any[]): void;
    on(): Record<string, [(e: any, ...args: any[]) => void, any]>;
    on(type: string, handler: (e: any, ...args: any[]) => void, opts?: any): T;
}
export interface AppendableMixin<T> {
    appendable(sel: SelectorOrSelection, g?: GaugeComponent): void;
    defs(): RenderFunction[];
    defs(..._: RenderFunction[]): T;
    append(): RenderFunction[];
    append(..._: RenderFunction[]): T;
}
export interface ElementComponent extends StylableMixin<ElementComponent>, AppendableMixin<ElementComponent>, InteractableMixin<ElementComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    attr(k: string): any;
    attr(k: string, _: any): ElementComponent;
}
export interface PutComponent extends StylableMixin<PutComponent>, TransformableMixin<PutComponent>, AppendableMixin<PutComponent>, InteractableMixin<PutComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
}
export interface SnapScale {
    (v: number): number;
    start(): number;
    start(_: number): SnapScale;
    step(): number;
    step(_: number): SnapScale;
    strength(): number;
    strength(_: number): SnapScale;
}
export interface GaugeComponent extends StylableMixin<GaugeComponent>, AppendableMixin<GaugeComponent> {
    (sel: SelectorOrSelection, parent?: GaugeComponent): void;
    _ns: string[];
    metric(): string | undefined;
    metric(_?: string): GaugeComponent;
    rescale(): (v: any) => any;
    rescale(_: (v: any) => any): GaugeComponent;
    unit(): string | undefined;
    unit(_?: string): GaugeComponent;
    instance(): string | undefined;
    instance(_?: string | null): GaugeComponent;
    fake(): (() => any) | undefined;
    fake(_?: () => any): GaugeComponent;
    kind(): GaugeKind;
    kind(_: GaugeKind): GaugeComponent;
    clip(): RenderFunction | undefined;
    clip(_: RenderFunction): GaugeComponent;
    r(): number;
    r(_: number): GaugeComponent;
    measure(): any;
    measure(_: any): GaugeComponent;
    autoindicate(): boolean;
    autoindicate(_: boolean): GaugeComponent;
    grid(): boolean;
    grid(_: boolean): GaugeComponent;
    metrictransform(v: any, invert?: boolean): string;
    marktransform(v: any, inset?: number): string;
    sectorpath(v0: any, v1: any, _size?: number, _inset?: number): string | null;
}
export interface GaugeFaceComponent extends StylableMixin<GaugeFaceComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    r(): number;
    r(_: number): GaugeFaceComponent;
    window(): RenderFunction | undefined;
    window(_: RenderFunction): GaugeFaceComponent;
}
export interface GaugeScrewComponent extends StylableMixin<GaugeScrewComponent>, TransformableMixin<GaugeScrewComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    r(): number;
    r(_: number): GaugeScrewComponent;
    shape(): ScrewShape;
    shape(_: ScrewShape): GaugeScrewComponent;
}
export interface GaugeLabelOptions {
    size?: number;
    x?: number;
    y?: number;
    dx?: number | string;
    dy?: number | string;
    value?: string;
    style?: string;
    class?: string;
    css?: string | Record<string, any>;
}
export interface GaugeLabelComponent extends StylableMixin<GaugeLabelComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    value(): string;
    value(_: string): GaugeLabelComponent;
    size(): number;
    size(_: number): GaugeLabelComponent;
    x(): number;
    x(_: number): GaugeLabelComponent;
    y(): number;
    y(_: number): GaugeLabelComponent;
    dx(): number | string;
    dx(_: number | string): GaugeLabelComponent;
    dy(): number | string;
    dy(_: number | string): GaugeLabelComponent;
}
export interface StatusLightComponent {
    (sel: SelectorOrSelection, parent?: GaugeComponent): void;
    metric(): string | undefined;
    metric(_?: string): StatusLightComponent;
    instance(): string | undefined;
    instance(_?: string | null): StatusLightComponent;
    fake(): (() => any) | undefined;
    fake(_?: () => any): StatusLightComponent;
    trigger(): (v: any) => any;
    trigger(_: (v: any) => any): StatusLightComponent;
    color(): string;
    color(_: string): StatusLightComponent;
}
export interface GridComponent extends StylableMixin<GridComponent> {
    (sel: SelectorOrSelection): void;
    x(): number;
    x(_: number): GridComponent;
    y(): number;
    y(_: number): GridComponent;
    width(): number;
    width(_: number): GridComponent;
    height(): number;
    height(_: number): GridComponent;
    xmajor(): number;
    xmajor(_: number): GridComponent;
    ymajor(): number;
    ymajor(_: number): GridComponent;
    xminor(): number;
    xminor(_: number): GridComponent;
    yminor(): number;
    yminor(_: number): GridComponent;
}
export interface PanelComponent extends StylableMixin<PanelComponent>, TransformableMixin<PanelComponent>, AppendableMixin<PanelComponent> {
    (sel: SelectorOrSelection): void;
    width(): number;
    width(_: number): PanelComponent;
    height(): number;
    height(_: number): PanelComponent;
    grid(): boolean;
    grid(_: boolean): PanelComponent;
    url(): URL | undefined;
    url(_: string | URL): PanelComponent;
    interval(): number;
    interval(_: number): PanelComponent;
    smooth(): boolean;
    smooth(_: boolean): PanelComponent;
}
export interface AxisSectorComponent extends StylableMixin<AxisSectorComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    size(): number;
    size(_: number): AxisSectorComponent;
    inset(): number;
    inset(_: number): AxisSectorComponent;
}
export interface AxisTicksComponent extends StylableMixin<AxisTicksComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    step(): number | undefined;
    step(_: number): AxisTicksComponent;
    start(): number | undefined;
    start(_: number): AxisTicksComponent;
    shape(): TickShape;
    shape(_: TickShape): AxisTicksComponent;
    size(): number;
    size(_: number): AxisTicksComponent;
    width(): number;
    width(_: number): AxisTicksComponent;
    inset(): number;
    inset(_: number): AxisTicksComponent;
}
export interface AxisLabelsComponent extends StylableMixin<AxisLabelsComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    step(): number | undefined;
    step(_: number): AxisLabelsComponent;
    start(): number | undefined;
    start(_: number): AxisLabelsComponent;
    orient(): LabelOrientation;
    orient(_: LabelOrientation): AxisLabelsComponent;
    size(): number;
    size(_: number): AxisLabelsComponent;
    inset(): number;
    inset(_: number): AxisLabelsComponent;
    rotate(): number;
    rotate(_: number): AxisLabelsComponent;
    format(): (v: any) => any;
    format(_: (v: any) => any): AxisLabelsComponent;
}
export interface IndicateTextComponent extends StylableMixin<IndicateTextComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    format(): (v: any) => any;
    format(_: (v: any) => any): IndicateTextComponent;
    size(): number;
    size(_: number): IndicateTextComponent;
}
export interface IndicatePointerComponent extends StylableMixin<IndicatePointerComponent>, AppendableMixin<IndicatePointerComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    rescale(): (v: any) => any;
    rescale(_: (v: any) => any): IndicatePointerComponent;
    clamp(): [number | undefined, number | undefined];
    clamp(_: [number | undefined | null, number | undefined | null]): IndicatePointerComponent;
    shape(): PointerShape;
    shape(_: PointerShape): IndicatePointerComponent;
}
export interface IndicateSectorComponent extends StylableMixin<IndicateSectorComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    rescale(): (v: any) => any;
    rescale(_: (v: any) => any): IndicateSectorComponent;
    clamp(): [number | undefined, number | undefined];
    clamp(_: [number | undefined | null, number | undefined | null]): IndicateSectorComponent;
    anchor(): number;
    anchor(_: number): IndicateSectorComponent;
    size(): number;
    size(_: number): IndicateSectorComponent;
    inset(): number;
    inset(_: number): IndicateSectorComponent;
}
export interface IndicateStyleComponent extends AppendableMixin<IndicateStyleComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    styleOn(): Record<string, any>;
    styleOn(_: Record<string, any>): IndicateStyleComponent;
    styleOff(): Record<string, any>;
    styleOff(_: Record<string, any>): IndicateStyleComponent;
    trigger(): (v: any) => any;
    trigger(_: (v: any) => any): IndicateStyleComponent;
}
export interface ControllerData {
    latest?: number;
    metrics: Record<string, any>;
    units?: Record<string, string>;
}
export interface GaugeController {
    (data: ControllerData, transition?: TransitionFunction): void;
    register(updater: (v: any, transition?: TransitionFunction) => void, metric?: string, unit?: string): void;
    fake(metric: string, generator: () => any): void;
    fakeMetrics(): {
        latest: number;
        units: Record<string, string>;
        metrics: Record<string, any>;
    };
    indicators(): string[];
    mappedMetrics(): string[] | null;
}
