import type { ReactElement } from 'react'
import { FlatList, RefreshControl } from 'react-native'

import { toListColumnStyle } from './resources/toListColumnStyle'
import { toListContentStyle } from './resources/toListContentStyle'
import {
  LIST_DEFAULT_COLUMNS,
  LIST_DEFAULT_GAP,
  LIST_REFRESH_COLORS,
  LIST_REFRESH_TINT_COLOR,
} from './styles'

export interface ListProps<TItem> {
  items: readonly TItem[]
  renderItem: (item: TItem) => ReactElement
  keyExtractor: (item: TItem) => string
  columns?: number
  gap?: number
  empty?: ReactElement
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const List = <TItem,>({
  items,
  renderItem,
  keyExtractor,
  columns = LIST_DEFAULT_COLUMNS,
  gap = LIST_DEFAULT_GAP,
  empty,
  isRefreshing = false,
  onRefresh,
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
    refreshControl={onRefresh
      ? (
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={LIST_REFRESH_TINT_COLOR}
          colors={LIST_REFRESH_COLORS}
        />
      )
      : undefined}
    showsVerticalScrollIndicator={false}
  />
)
