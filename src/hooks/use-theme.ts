/**
 * Access to the app color palette.
 * Kept as a hook so a future theme source can replace the constant without touching consumers.
 */

import { Colors } from '@constants/theme'

export const useTheme = () => Colors
