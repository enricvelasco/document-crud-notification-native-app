import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTranslate } from '@hooks/useTranslate'
import type { NetworkStatusTypes } from '@services/network'
import { WifiOffIcon } from '@ui/atoms/icons'
import { PrimaryButton } from '@ui/atoms/primaryButton'
import { BottomSheet } from '@ui/organisms/bottomSheet'

import { toNetworkStatusLabelKey, toRetryLabelKey } from './resources/services'
import {
  NETWORK_STATUS_SHEET_ICON_COLOR,
  NETWORK_STATUS_SHEET_ICON_SIZE,
  SHEET_SAFE_AREA_EDGES,
  styles,
} from './styles'

export interface NetworkStatusSheetProps {
  status: NetworkStatusTypes
  isRetrying?: boolean
  onRetry: () => void
}

export const NetworkStatusSheet = ({
  status,
  isRetrying = false,
  onRetry,
}: NetworkStatusSheetProps) => {
  const translate = useTranslate()

  return (
    <BottomSheet>
      <SafeAreaView accessibilityRole="alert" edges={SHEET_SAFE_AREA_EDGES} style={styles.root}>
        <WifiOffIcon
          size={NETWORK_STATUS_SHEET_ICON_SIZE}
          color={NETWORK_STATUS_SHEET_ICON_COLOR}
        />

        <Text style={styles.title}>{translate('_NETWORK_STATUS_SHEET_TITLE')}</Text>
        <Text style={styles.message}>{translate('_NETWORK_STATUS_SHEET_MESSAGE')}</Text>
        <Text style={styles.status}>
          {translate('_NETWORK_STATUS_SHEET_CONNECTION', {
            status: translate(toNetworkStatusLabelKey(status)),
          })}
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label={translate(toRetryLabelKey(isRetrying))}
            disabled={isRetrying}
            onPress={onRetry}
          />
        </View>
      </SafeAreaView>
    </BottomSheet>
  )
}
