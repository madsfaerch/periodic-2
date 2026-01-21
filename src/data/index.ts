import type { Element, PeriodicTableData } from './types'
import data from './elements.json'

export type { Element, PeriodicTableData }

export const periodicTable = data as PeriodicTableData
export const elements = periodicTable.elements
