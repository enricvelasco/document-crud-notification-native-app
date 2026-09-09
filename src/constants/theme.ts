/**
 * The app color palette. Each block is a role and holds its three options.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '../global.css'

import { Platform } from 'react-native'

export const Colors = {
  primary: {
    default: '#3C87F7',
    light: '#D8E7FE',
    dark: '#1C5FC4',
  },
  border: {
    default: '#D8D9E0',
    light: '#EDEEF0',
    dark: '#B9BBC6',
  },
  background: {
    default: '#FFFFFF',
    light: '#F0F0F3',
    dark: '#E0E1E6',
  },
  text: {
    default: '#11181C',
    light: '#60646C',
    dark: '#000000',
  },
} as const

export type ThemeColor = keyof typeof Colors
export type ThemeColorVariant = keyof (typeof Colors)[ThemeColor]

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800
