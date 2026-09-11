import type { ComponentType } from 'react'

import type { IconModel } from '@ui/atoms/icons'

export interface CardListItemColumnModel {
  icon: ComponentType<IconModel>
  title: string
  items: readonly string[]
}
