import data from './elements.json';
import type { Element, PeriodicTableData } from './types';

export type { Element, PeriodicTableData };

export const periodicTable = data as PeriodicTableData;
export const elements = periodicTable.elements;
