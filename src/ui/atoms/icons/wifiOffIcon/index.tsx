import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const WifiOffIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M2 8.82a15 15 0 0 1 4.17-2.65"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 8.82a15 15 0 0 0-11.29-3.76"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 12.86a10 10 0 0 1 5.17-2.69"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 12.86a10 10 0 0 0-2.01-1.52"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 16.43a5 5 0 0 1 7 0"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 20h.01"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 2 22 22"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
