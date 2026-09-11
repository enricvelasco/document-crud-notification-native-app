import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const SortIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M17 8L12 3L7 8"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 16L12 21L7 16"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
