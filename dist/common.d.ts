import type { D3Selection, SelectorOrSelection, ElementComponent, PutComponent, SnapScale } from './types';
export declare function d3sel(sel: SelectorOrSelection): D3Selection;
export declare function element(elt: string, attrs_?: Record<string, any>): ElementComponent;
export declare function put(): PutComponent;
export declare function snapScale(): SnapScale;
export declare function flatten(o: Record<string, any>, ks?: string[]): [string[], any][];
//# sourceMappingURL=common.d.ts.map