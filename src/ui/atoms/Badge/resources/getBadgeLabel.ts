import { BADGE_MAX_COUNT, BADGE_OVERFLOW_LABEL } from './constants'

export const getBadgeLabel = (count: number) => {
  const isOverflowing = count > BADGE_MAX_COUNT

  return isOverflowing ? BADGE_OVERFLOW_LABEL : String(count)
}
