import { Text, View } from 'react-native'

import { CardListItemColumn } from './components/CardListItemColumn'
import type { CardListItemColumnModel } from './models'
import { styles } from './styles'

export * from './models'

export interface CardListItemProps {
  title: string
  description: string
  columns: readonly [CardListItemColumnModel, CardListItemColumnModel]
}

export const CardListItem = ({ title, description, columns }: CardListItemProps) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <Text numberOfLines={1} style={styles.description}>{description}</Text>
    </View>
    <View style={styles.columns}>
      {columns.map((column) => (
        <CardListItemColumn key={column.title} column={column} />
      ))}
    </View>
  </View>
)
