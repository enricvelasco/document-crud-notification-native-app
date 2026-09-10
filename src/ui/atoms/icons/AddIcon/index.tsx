import Svg, { Path } from 'react-native-svg'

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  ICON_STROKE_WIDTH,
  ICON_VIEW_BOX,
} from '../constants'
import type { IconModel } from '../models'

export const AddIcon = ({ size = DEFAULT_ICON_SIZE, color = DEFAULT_ICON_COLOR }: IconModel) => (
  <Svg width={size} height={size} viewBox={ICON_VIEW_BOX} fill="none">
    <Path
      d="M6 12H12M18 12H12M12 12V6M12 12V18"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)
