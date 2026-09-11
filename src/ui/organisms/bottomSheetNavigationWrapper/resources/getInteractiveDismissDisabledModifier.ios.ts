import type { ModifierConfig } from '@expo/ui/swift-ui/modifiers'
import { interactiveDismissDisabled } from '@expo/ui/swift-ui/modifiers'

export const getInteractiveDismissDisabledModifier = (): ModifierConfig | undefined =>
  interactiveDismissDisabled()
