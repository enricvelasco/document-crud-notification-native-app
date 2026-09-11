import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const ChevronDownIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M6 9L12 15L18 9"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
