import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const GridIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M21 3.6V12H12V3H20.4C20.7314 3 21 3.26863 21 3.6Z"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
    />
    <Path
      d="M21 20.4V12H12V21H20.4C20.7314 21 21 20.7314 21 20.4Z"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
    />
    <Path
      d="M3 12V3.6C3 3.26863 3.26863 3 3.6 3H12V12H3Z"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
    />
    <Path
      d="M3 12V20.4C3 20.7314 3.26863 21 3.6 21H12V12H3Z"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
    />
  </Svg>
)
