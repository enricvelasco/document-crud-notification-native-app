import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'

import type { DropdownAnchorModel, DropdownOptionModel } from '../../models'
import { DropdownMenuOption } from './components/DropdownMenuOption'
import { getDropdownMenuPosition } from './resources/getDropdownMenuPosition'
import { styles } from './styles'

export interface DropdownMenuProps {
  visible: boolean
  anchor: DropdownAnchorModel | null
  options: readonly DropdownOptionModel[]
  onSelect: (value: string) => void
  onDismiss: () => void
  value?: string
}

export const DropdownMenu = ({
  visible,
  anchor,
  options,
  onSelect,
  onDismiss,
  value,
}: DropdownMenuProps) => {
  const window = useWindowDimensions()

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View accessibilityRole="menu" style={[styles.menu, getDropdownMenuPosition(anchor, window)]}>
        <ScrollView bounces={false}>
          {options.map((option) => (
            <DropdownMenuOption
              key={option.value}
              option={option}
              selected={option.value === value}
              onPress={() => onSelect(option.value)}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}
