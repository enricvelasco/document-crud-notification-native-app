import { Text, View } from 'react-native'

import type { CardListItemColumnModel } from '../../models'
import { CARD_LIST_ITEM_COLUMN_ICON_COLOR, CARD_LIST_ITEM_COLUMN_ICON_SIZE, styles } from './styles'

export interface CardListItemColumnProps {
  column: CardListItemColumnModel
}

export const CardListItemColumn = ({ column }: CardListItemColumnProps) => {
  const Icon = column.icon

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Icon size={CARD_LIST_ITEM_COLUMN_ICON_SIZE} color={CARD_LIST_ITEM_COLUMN_ICON_COLOR} />
        <Text numberOfLines={1} style={styles.title}>{column.title}</Text>
      </View>
      <View style={styles.items}>
        {column.items.map((item, index) => (
          <Text key={index} numberOfLines={1} style={styles.item}>{item}</Text>
        ))}
      </View>
    </View>
  )
}
