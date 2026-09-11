import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const ListIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M8 6L20 6"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 6.01L4.01 5.99889"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 12.01L4.01 11.9989"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 18.01L4.01 17.9989"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 12L20 12"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 18L20 18"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
