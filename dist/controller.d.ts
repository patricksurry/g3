import type { GaugeController } from './types';
export declare const convertUnits: (value?: number) => import("convert-units").Converter<import("convert-units/definitions/all").AllMeasures, import("convert-units/definitions/all").AllMeasuresSystems, import("convert-units/definitions/all").AllMeasuresUnits, number>, knownUnits: import("convert-units/definitions/all").AllMeasuresUnits[];
export declare let activeController: GaugeController | undefined;
export declare function gaugeController(): GaugeController;
