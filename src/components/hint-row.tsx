import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { Spacing } from '@constants/theme'

import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'

type HintRowProps = {
  title?: string
  hint?: ReactNode
}

export const HintRow = ({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) => {
  return (
    <View style={styles.stepRow}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView variant="dark" style={styles.codeSnippet}>
        <ThemedText themeVariant="light">{hint}</ThemedText>
      </ThemedView>
    </View>
  )
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
})
