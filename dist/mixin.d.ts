import type { StylableMixin, TransformableMixin, InteractableMixin, AppendableMixin } from './types';
export declare const identity: <T>(v: T) => T;
interface AppendIdFunction {
    (typ: string): string;
    nextId: number;
}
export declare const appendId: AppendIdFunction;
export declare function stylable<T extends object>(f: T): T & StylableMixin<T>;
export declare function transformable<T extends object>(f: T): T & TransformableMixin<T>;
export declare function interactable<T extends object>(f: T): T & InteractableMixin<T>;
export declare function appendable<T extends object>(f: T): T & AppendableMixin<T>;
export {};
//# sourceMappingURL=mixin.d.ts.map