import type { ComponentType } from 'react'

import type { IconModel } from '@ui/atoms/icons'

export interface OptionsButtonOptionModel {
  value: string
  icon: ComponentType<IconModel>
  accessibilityLabel: string
}
