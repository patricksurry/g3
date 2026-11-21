import type * as d3 from 'd3';

export type D3Selection = d3.Selection<any, any, any, any>;
export type SelectorOrSelection = string | D3Selection;
export type TransitionFunction = (sel: D3Selection) => d3.Transition<any, any, any, any> | D3Selection;
export type RenderFunction = (sel: any, g?: GaugeComponent) => void;

export type GaugeKind = 'circular' | 'linear' | 'ball.yaw' | 'ball.pitch' | 'drum';

/** A surface that turns in three dimensions, with the marks drawn on it that re-project as it turns. */
export interface Surface {
    /** current rotation in degrees, one entry per axis */
    rotation: number[];
    redraws: (() => void)[];
    redraw(): void;
}

/** Shared state for nested ball gauges: one orthographic projection rotated by `[yaw, pitch, roll]`. */
export interface SphereBall extends Surface {
    proj: d3.GeoProjection;
    rotation: [number, number, number];
}

/** A drum gauge: a cylinder of radius `r` spinning about its vertical axis. */
export interface Drum extends Surface {
    r: number;
    rotation: [number];
}
export type TickShape = 'tick' | 'dot' | 'wedge' | 'rect';
export type LabelOrientation = 'fixed' | 'relative' | 'upward' | 'clockwise' | 'counterclockwise';
export type ScrewShape = 'slotted' | 'phillips' | 'robertson';
export type PointerShape =
    | 'needle'
    | 'blade'
    | 'dagger'
    | 'rondel'
    | 'sword'
    | 'wedge'
    | 'omega-second'
    | 'omega-baton-long'
    | 'omega-baton-short'
    | 'aircraft-heading'
    | 'aircraft-turn'
    | (string & {});

/** Mixin providing CSS classes, inline styles, and `@emotion/css` rule injection. */
export interface StylableMixin<T> {
    /** Apply configured `class` and `style` attributes to a D3 selection. */
    stylable(selection: D3Selection): void;
    /** Get the space-separated list of classes (including injected `@emotion/css` classes). */
    css(): string;
    /** Inject inline CSS rules via `@emotion/css` and add the generated class name. */
    css(_: string | Record<string, any>): T;
    /** Get the space-separated list of CSS class names. */
    class(): string;
    /** Add one or more space-separated CSS class names. */
    class(_: string): T;
    /** Get the current inline SVG `style` attribute value. */
    style(): string | undefined;
    /** Set the inline SVG `style` attribute value. */
    style(_: string): T;
}

/** Mixin providing SVG `translate(...) rotate(...) scale(...)` transformations. */
export interface TransformableMixin<T> {
    /** Apply the configured `transform` attribute to a D3 selection. */
    transformable(selection: D3Selection): void;
    /** Get the current x translation in SVG units (default 0). */
    x(): number;
    /** Set the x translation in SVG units. */
    x(_: number): T;
    /** Get the current y translation in SVG units (default 0). */
    y(): number;
    /** Set the y translation in SVG units. */
    y(_: number): T;
    /** Get the current `[scalex, scaley]` factors (default `[1, 1]`). */
    scale(): [number, number];
    /** Set uniform (`scale(s)`) or non-uniform (`scale(sx, sy)`) scale factors. */
    scale(x: number, y?: number): T;
    /** Get the current rotation angle in degrees (default 0). */
    rotate(): number;
    /** Set the rotation angle in degrees. */
    rotate(_: number): T;
}

/** Mixin providing DOM event handler registration via D3 `.on()`. */
export interface InteractableMixin<T> {
    /** Bind registered event handlers to a D3 selection. */
    interactable(selection: D3Selection, ...args: any[]): void;
    /** Get the map of registered event handlers. */
    on(): Record<string, [(e: any, ...args: any[]) => void, any]>;
    /** Register a DOM event handler on the rendered selection. */
    on(type: string, handler: (e: any, ...args: any[]) => void, opts?: any): T;
}

/** Mixin supporting child G3 components (`append`) and shared SVG `<defs>` (`defs`). */
export interface AppendableMixin<T> {
    /** Render all registered `defs` and `append` children into `sel`. */
    appendable(sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the list of child renderers appended to the top-level `<defs>`. */
    defs(): RenderFunction[];
    /** Append one or more renderers to the top-level SVG `<defs>`. */
    defs(..._: RenderFunction[]): T;
    /** Get the list of appended child renderers. */
    append(): RenderFunction[];
    /** Append one or more child G3 renderers. */
    append(..._: RenderFunction[]): T;
}

/** Deferred SVG element constructor created by `g3.element()`. */
export interface ElementComponent extends
    StylableMixin<ElementComponent>,
    AppendableMixin<ElementComponent>,
    InteractableMixin<ElementComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the value of attribute `k`. */
    attr(k: string): any;
    /** Set attribute `k` to value `_`. */
    attr(k: string, _: any): ElementComponent;
    /** Get the text content of the element. */
    text(): string | number | undefined;
    /** Set the text content of the element. */
    text(_: string | number): ElementComponent;
}

/** Deferred SVG `<g>` group container created by `g3.put()`. */
export interface PutComponent extends
    StylableMixin<PutComponent>,
    TransformableMixin<PutComponent>,
    AppendableMixin<PutComponent>,
    InteractableMixin<PutComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
}

/** Continuous staircase rescaling function created by `g3.snapScale()`. */
export interface SnapScale {
    (v: number): number;
    /** Get the starting anchor point for step calculation (default 0). */
    start(): number;
    /** Set the starting anchor point for step calculation. */
    start(_: number): SnapScale;
    /** Get the step size (default 1). */
    step(): number;
    /** Set the step size. */
    step(_: number): SnapScale;
    /** Get the power-scale pull strength toward each step (default 5). */
    strength(): number;
    /** Set the power-scale pull strength toward each step. */
    strength(_: number): SnapScale;
}

/** Core gauge component created by `g3.gauge()`. */
export interface GaugeComponent extends
    StylableMixin<GaugeComponent>,
    AppendableMixin<GaugeComponent> {
    (sel: SelectorOrSelection, parent?: GaugeComponent): void;
    _ns: string[];
    /** Get the (qualified) primary metric key indicated by this gauge. */
    metric(): string | undefined;
    /** Set the primary metric key indicated by this gauge, plus any secondary metrics it also redraws on. */
    metric(_?: string, ...others: string[]): GaugeComponent;
    /** Get all (qualified) metric keys this gauge depends on, primary first. */
    metrics(): string[];
    /** Send actions to the panel's hub; `metric` and `unit` default to this gauge's. */
    send(...actions: Action[]): void;
    /** Get the metric pre-measure rescaling function (default `identity`). */
    rescale(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set a function that rescales metric values before applying `measure()`. */
    rescale(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): GaugeComponent;
    /** Get the unit of measurement for automatic conversion (via `convert-units`). */
    unit(): string | undefined;
    /** Set the unit of measurement for automatic conversion (via `convert-units`). */
    unit(_?: string): GaugeComponent;
    /** Get the metric instance qualifier (e.g. `'front'` for `fuel.front`). */
    instance(): string | undefined;
    /** Set the metric instance qualifier. */
    instance(_?: string | null): GaugeComponent;
    /** Get the fake used by the local hub: a generator `(current) => next`, or a constant starting value. */
    fake(): Fake | undefined;
    /** Set the fake used by the local hub: a generator `(current) => next`, or a constant starting value. */
    fake(_?: Fake): GaugeComponent;
    /** Get the axis coordinate system kind (`'circular'`, `'linear'`, `'ball.yaw'`, `'ball.pitch'` or `'drum'`, default `'circular'`). */
    kind(): GaugeKind;
    /** Set the axis coordinate system kind (`'circular'`, `'linear'`, `'ball.yaw'`, `'ball.pitch'` or `'drum'`). */
    kind(_: GaugeKind): GaugeComponent;
    /** Get the clipping path renderer for this gauge. */
    clip(): RenderFunction | undefined;
    /** Set a G3 renderer to define an SVG `<clipPath>` for this gauge. */
    clip(_: RenderFunction): GaugeComponent;
    /** Get the gauge radius in SVG units (default 100). */
    r(): number;
    /** Set the gauge radius in SVG units. */
    r(_: number): GaugeComponent;
    /** Get the D3 scale mapping metric domain values to gauge axis coordinates. */
    measure(): any;
    /** Set a D3 scale mapping metric domain values to gauge axis coordinates. */
    measure(_: any): GaugeComponent;
    /** Get whether this gauge transforms itself to self-indicate (default `false`). */
    autoindicate(): boolean;
    /** Set whether this gauge transforms itself to self-indicate. */
    autoindicate(_: boolean): GaugeComponent;
    /** Get whether a background alignment grid is shown on this gauge (default `false`). */
    grid(): boolean;
    /** Set whether a background alignment grid is shown on this gauge. */
    grid(_: boolean): GaugeComponent;
    metrictransform(v: any, invert?: boolean): string;
    marktransform(v: any, inset?: number): string;
    sectorpath(v0: any, v1: any, _size?: number, _inset?: number): string | null;
    /** Call `fn` now, and again whenever the gauge geometry changes (e.g. a ball or drum turns). */
    redraw(fn: () => void): void;
    /** The surface a ball or drum gauge draws on, set at drawing time; nested ball gauges share one. */
    _surface?: SphereBall | Drum;
}

/** Circular gauge face renderer created by `g3.gaugeFace()`. */
export interface GaugeFaceComponent extends StylableMixin<GaugeFaceComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the face radius in SVG units (default 100). */
    r(): number;
    /** Set the face radius in SVG units. */
    r(_: number): GaugeFaceComponent;
    /** Get the cut-out window mask renderer. */
    window(): RenderFunction | undefined;
    /** Set a G3 renderer to cut out an SVG mask window in the gauge face. */
    window(_: RenderFunction): GaugeFaceComponent;
}

/** Decorative screw head renderer created by `g3.gaugeScrew()`. */
export interface GaugeScrewComponent extends
    StylableMixin<GaugeScrewComponent>,
    TransformableMixin<GaugeScrewComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the screw head radius in SVG units (default 8). */
    r(): number;
    /** Set the screw head radius in SVG units. */
    r(_: number): GaugeScrewComponent;
    /** Get the screw head shape (`'slotted'`, `'phillips'`, or `'robertson'`). */
    shape(): ScrewShape;
    /** Set the screw head shape (`'slotted'`, `'phillips'`, or `'robertson'`). */
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

/** Static SVG text label renderer created by `g3.gaugeLabel()`. */
export interface GaugeLabelComponent extends StylableMixin<GaugeLabelComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the label text string. */
    value(): string;
    /** Set the label text string. */
    value(_: string): GaugeLabelComponent;
    /** Get the font size in SVG units (default 10). */
    size(): number;
    /** Set the font size in SVG units. */
    size(_: number): GaugeLabelComponent;
    /** Get the x coordinate in SVG units. */
    x(): number;
    /** Set the x coordinate in SVG units. */
    x(_: number): GaugeLabelComponent;
    /** Get the y coordinate in SVG units. */
    y(): number;
    /** Set the y coordinate in SVG units. */
    y(_: number): GaugeLabelComponent;
    /** Get the relative dx text offset. */
    dx(): number | string;
    /** Set the relative dx text offset. */
    dx(_: number | string): GaugeLabelComponent;
    /** Get the relative dy text offset. */
    dy(): number | string;
    /** Set the relative dy text offset. */
    dy(_: number | string): GaugeLabelComponent;
}

/** Illuminated indicator light gauge created by `g3.statusLight()`. */
export interface StatusLightComponent {
    (sel: SelectorOrSelection, parent?: GaugeComponent): void;
    /** Get the metric name monitored by this status light. */
    metric(): string | undefined;
    /** Set the metric name monitored by this status light. */
    metric(_?: string): StatusLightComponent;
    /** Get the metric instance qualifier. */
    instance(): string | undefined;
    /** Set the metric instance qualifier. */
    instance(_?: string | null): StatusLightComponent;
    /** Get the fake metric generator. */
    fake(): (() => any) | undefined;
    /** Set the fake metric generator. */
    fake(_?: () => any): StatusLightComponent;
    /** Get the trigger function mapping metric values to `[0, 1]` opacity. */
    trigger(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set the trigger function mapping metric values to `[0, 1]` opacity. */
    trigger(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): StatusLightComponent;
    /** Get the illuminated fill color (default `'red'`). */
    color(): string;
    /** Set the illuminated fill color. */
    color(_: string): StatusLightComponent;
}

/** Alignment grid renderer created by `g3.grid()`. */
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

/** Top-level SVG instrument panel container created by `g3.panel()`. */
export interface PanelComponent extends
    StylableMixin<PanelComponent>,
    TransformableMixin<PanelComponent>,
    AppendableMixin<PanelComponent> {
    (sel: SelectorOrSelection): void;
    /** Get the SVG panel width in pixels (default 640). */
    width(): number;
    /** Set the SVG panel width in pixels. */
    width(_: number): PanelComponent;
    /** Get the SVG panel height in pixels (default 480). */
    height(): number;
    /** Set the SVG panel height in pixels. */
    height(_: number): PanelComponent;
    /** Get whether the layout alignment grid is enabled (default `false`). */
    grid(): boolean;
    /** Enable or disable the layout alignment grid. */
    grid(_: boolean): PanelComponent;
    /** Get the external metrics endpoint URL. */
    url(): URL | undefined;
    /** Set the external metrics endpoint URL (polls JSON or uses `EventSource` when `interval(0)`). */
    url(_: string | URL): PanelComponent;
    /** Get the hub endpoint that actions are POSTed to. */
    inputUrl(): URL | undefined;
    /** Set the hub endpoint that actions are POSTed to. */
    inputUrl(_: string | URL): PanelComponent;
    /** Get the polling interval in milliseconds (default 250). */
    interval(): number;
    /** Set the polling interval in milliseconds (set to 0 for SSE `EventSource`). */
    interval(_: number): PanelComponent;
    /** Get whether smooth D3 transitions are enabled between metric updates (default `true`). */
    smooth(): boolean;
    /** Enable or disable smooth D3 transitions between metric updates. */
    smooth(_: boolean): PanelComponent;
}

/** Annular sector or axis line renderer created by `g3.axisSector()` or `g3.axisLine()`. */
export interface AxisSectorComponent extends StylableMixin<AxisSectorComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the radial thickness of the sector in SVG units (default 5). */
    size(): number;
    /** Set the radial thickness of the sector in SVG units. */
    size(_: number): AxisSectorComponent;
    /** Get the radial inset from the gauge axis line in SVG units (default 0). */
    inset(): number;
    /** Set the radial inset from the gauge axis line in SVG units. */
    inset(_: number): AxisSectorComponent;
}

/** Axis tick marks renderer created by `g3.axisTicks()`. */
export interface AxisTicksComponent extends StylableMixin<AxisTicksComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the tick step interval in the metric domain (default 1). */
    step(): number | undefined;
    /** Set the tick step interval in the metric domain. */
    step(_: number): AxisTicksComponent;
    /** Get the starting value for generated ticks in the metric domain. */
    start(): number | undefined;
    /** Set the starting value for generated ticks in the metric domain. */
    start(_: number): AxisTicksComponent;
    /** Get the tick mark shape (`'tick'`, `'dot'`, `'wedge'`, or `'rect'`, default `'tick'`). */
    shape(): TickShape;
    /** Set the tick mark shape (`'tick'`, `'dot'`, `'wedge'`, or `'rect'`). */
    shape(_: TickShape): AxisTicksComponent;
    /** Get the tick mark length/size in SVG units (default 10). */
    size(): number;
    /** Set the tick mark length/size in SVG units. */
    size(_: number): AxisTicksComponent;
    /** Get the tick mark width along the axis for `'wedge'` and `'rect'` shapes (default 1). */
    width(): number;
    /** Set the tick mark width along the axis for `'wedge'` and `'rect'` shapes. */
    width(_: number): AxisTicksComponent;
    /** Get the radial inset from the axis line in SVG units (default 0). */
    inset(): number;
    /** Set the radial inset from the axis line in SVG units. */
    inset(_: number): AxisTicksComponent;
}

/** Axis text labels renderer created by `g3.axisLabels()`. */
export interface AxisLabelsComponent extends StylableMixin<AxisLabelsComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the label step interval in the metric domain (default 1). */
    step(): number | undefined;
    /** Set the label step interval in the metric domain. */
    step(_: number): AxisLabelsComponent;
    /** Get the first label value in the metric domain. */
    start(): number | undefined;
    /** Set the first label value in the metric domain. */
    start(_: number): AxisLabelsComponent;
    /** Get the label orientation (`'fixed'`, `'relative'`, `'upward'`, `'clockwise'`, or `'counterclockwise'`). */
    orient(): LabelOrientation;
    /** Set the label orientation. */
    orient(_: LabelOrientation): AxisLabelsComponent;
    /** Get the font size in SVG units (default 20). */
    size(): number;
    /** Set the font size in SVG units. */
    size(_: number): AxisLabelsComponent;
    /** Get the radial inset from the axis line in SVG units (default 25). */
    inset(): number;
    /** Set the radial inset from the axis line in SVG units. */
    inset(_: number): AxisLabelsComponent;
    /** Get the additional label rotation angle in degrees (default 0). */
    rotate(): number;
    /** Set the additional label rotation angle in degrees. */
    rotate(_: number): AxisLabelsComponent;
    /** Get the label formatting function. */
    format(): (v: any) => any;
    /** Set a function that formats numeric axis values into display strings. */
    format(_: (v: any) => any): AxisLabelsComponent;
}

/** Dynamic metric text indicator created by `g3.indicateText()`. */
export interface IndicateTextComponent extends StylableMixin<IndicateTextComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the metric value formatter function (default `identity`). */
    format(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set a function that formats metric values into display text. */
    format(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): IndicateTextComponent;
    /** Get the text font size in SVG units (default 20). */
    size(): number;
    /** Set the text font size in SVG units. */
    size(_: number): IndicateTextComponent;
}

/** Dynamic metric unit indicator created by `g3.indicateUnit()`. */
export interface IndicateUnitComponent extends StylableMixin<IndicateUnitComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the unit formatter function (default `identity`). */
    format(): (u: string, v?: any, metrics?: Record<string, any>) => any;
    /** Set a function that formats unit strings into display text. */
    format(_: (u: string, v?: any, metrics?: Record<string, any>) => any): IndicateUnitComponent;
    /** Get the text font size in SVG units (default 20). */
    size(): number;
    /** Set the text font size in SVG units. */
    size(_: number): IndicateUnitComponent;
}

/** Rotating or sliding metric pointer indicator created by `g3.indicatePointer()`. */
export interface IndicatePointerComponent extends
    StylableMixin<IndicatePointerComponent>,
    AppendableMixin<IndicatePointerComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the pre-measure metric rescaling function (default `identity`). */
    rescale(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set a function that rescales metric values before applying the gauge's `measure()`. */
    rescale(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): IndicatePointerComponent;
    /** Get the `[min, max]` domain clamping bounds applied after rescaling. */
    clamp(): [number | undefined, number | undefined];
    /** Set `[min, max]` domain clamping bounds applied after rescaling. */
    clamp(_: [number | undefined | null, number | undefined | null]): IndicatePointerComponent;
    /** Get the built-in pointer shape name (default `'needle'`). */
    shape(): PointerShape;
    /** Set the built-in pointer shape name. */
    shape(_: PointerShape): IndicatePointerComponent;
}

/** Dynamic annular sector indicator created by `g3.indicateSector()`. */
export interface IndicateSectorComponent extends StylableMixin<IndicateSectorComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the pre-measure metric rescaling function (default `identity`). */
    rescale(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set a function that rescales metric values before applying the gauge's `measure()`. */
    rescale(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): IndicateSectorComponent;
    /** Get the `[min, max]` domain clamping bounds applied after rescaling. */
    clamp(): [number | undefined, number | undefined];
    /** Set `[min, max]` domain clamping bounds applied after rescaling. */
    clamp(_: [number | undefined | null, number | undefined | null]): IndicateSectorComponent;
    /** Get the fixed starting anchor value in the metric domain (default 0). */
    anchor(): number;
    /** Set the fixed starting anchor value in the metric domain. */
    anchor(_: number): IndicateSectorComponent;
    /** Get the radial thickness of the sector in SVG units (default 10). */
    size(): number;
    /** Set the radial thickness of the sector in SVG units. */
    size(_: number): IndicateSectorComponent;
    /** Get the radial inset from the axis line in SVG units (default 0). */
    inset(): number;
    /** Set the radial inset from the axis line in SVG units. */
    inset(_: number): IndicateSectorComponent;
}

/** Conditional CSS style indicator created by `g3.indicateStyle()`. */
export interface IndicateStyleComponent extends AppendableMixin<IndicateStyleComponent> {
    (sel: SelectorOrSelection, g?: GaugeComponent): void;
    /** Get the style object applied when `trigger` returns 1 (default `{opacity: 1}`). */
    styleOn(): Record<string, any>;
    /** Set the style object applied when `trigger` returns 1. */
    styleOn(_: Record<string, any>): IndicateStyleComponent;
    /** Get the style object applied when `trigger` returns 0 (default `{opacity: 0}`). */
    styleOff(): Record<string, any>;
    /** Set the style object applied when `trigger` returns 0. */
    styleOff(_: Record<string, any>): IndicateStyleComponent;
    /** Get the trigger function mapping metric values to `[0, 1]`. */
    trigger(): (v: any, metrics?: Record<string, any>, unit?: string) => any;
    /** Set a function mapping metric values to a `[0, 1]` interpolation factor between `styleOff` and `styleOn`. */
    trigger(_: (v: any, metrics?: Record<string, any>, unit?: string) => any): IndicateStyleComponent;
}

export interface ControllerData {
    latest?: number;
    metrics: Record<string, any>;
    units?: Record<string, string>;
}

/** A fake metric for the local hub: a generator called with the current value, or a constant starting value. */
export type Fake = ((current?: any) => any) | string | number | boolean | Date | null;

/** An action sent from a panel to its hub, see doc/API.md#actions. */
export type Action =
    | { op: 'set'; metric?: string; value: any; unit?: string }
    | { op: 'adjust'; metric?: string; by: number; unit?: string; min?: number; max?: number; wrap?: boolean }
    | { op: 'trigger'; event: string; value?: any };

export type MetricUpdater = (v: any, transition?: TransitionFunction, metrics?: Record<string, any>, unit?: string) => void;

/** Mirrors the metrics reported by a hub, and redraws registered updaters that depend on them. */
export interface GaugeController {
    /** Apply a message of changed metrics (and optional units) reported by the hub. */
    (data: ControllerData, transition?: TransitionFunction): void;
    /** Register an updater for a metric key, or a list of keys (primary first), in an optional target unit. */
    register(updater: MetricUpdater, metric?: string | string[], unit?: string): void;
    /** Declare the local hub fake for a metric, in an optional unit; the first declaration wins. */
    fake(metric: string, fake: Fake, unit?: string): void;
    /** All fake declarations, keyed by metric. */
    fakes(): Record<string, { fake: Fake; unit?: string }>;
    /** All registered metric keys. */
    indicators(): string[];
    /** Set the function that delivers each batch of actions to the hub. */
    sink(fn: (actions: Action[]) => void): GaugeController;
    /** Send a batch of actions to the hub via the sink. */
    send(...actions: Action[]): void;
}

/** The in-browser hub used when a panel has no url, created by `g3.localHub()`. */
export interface LocalHub {
    /** All current metrics, with units. */
    snapshot(): Required<ControllerData>;
    /** Advance each generated metric from its current value, returning the changes. */
    tick(): Required<ControllerData>;
    /** Apply a batch of actions in order, returning the changes. */
    apply(actions: Action[]): Required<ControllerData>;
}
