import type { ReactElement } from 'react'
import { FlatList } from 'react-native'

import { toListColumnStyle } from './resources/toListColumnStyle'
import { toListContentStyle } from './resources/toListContentStyle'
import { LIST_DEFAULT_COLUMNS, LIST_DEFAULT_GAP } from './styles'

export interface ListProps<TItem> {
  items: readonly TItem[]
  renderItem: (item: TItem) => ReactElement
  keyExtractor: (item: TItem) => string
  columns?: number
  gap?: number
  empty?: ReactElement
}

export const List = <TItem,>({
  items,
  renderItem,
  keyExtractor,
  columns = LIST_DEFAULT_COLUMNS,
  gap = LIST_DEFAULT_GAP,
  empty,
}: ListProps<TItem>) => (
  <FlatList
    key={columns}
    data={items}
    keyExtractor={keyExtractor}
    renderItem={({ item }) => renderItem(item)}
    numColumns={columns}
    columnWrapperStyle={toListColumnStyle({ columns, gap })}
    contentContainerStyle={toListContentStyle(gap)}
    ListEmptyComponent={empty}
    showsVerticalScrollIndicator={false}
  />
)
