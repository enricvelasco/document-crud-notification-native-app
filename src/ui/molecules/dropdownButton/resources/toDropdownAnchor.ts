import type { DropdownAnchorModel } from '../models'

type MeasuredBoundsType = readonly [number, number, number, number]

export const toDropdownAnchor = ([x, y, width, height]: MeasuredBoundsType): DropdownAnchorModel => ({
  x,
  y,
  width,
  height,
})
