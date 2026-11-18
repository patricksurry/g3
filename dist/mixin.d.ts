import type { StylableMixin, TransformableMixin, InteractableMixin, AppendableMixin } from './types';
export declare const identity: <T>(v: T) => T;
interface AppendIdFunction {
    (typ: string): string;
    nextId: number;
}
export declare const appendId: AppendIdFunction;
export declare function stylable<R extends object>(f: object): R & StylableMixin<R>;
export declare function transformable<R extends object>(f: object): R & TransformableMixin<R>;
export declare function interactable<R extends object>(f: object): R & InteractableMixin<R>;
export declare function appendable<R extends object>(f: object): R & AppendableMixin<R>;
export {};
