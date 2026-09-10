import { AppRouteTypes, useAppNavigation } from '@hooks/useAppNavigation'

export const useDocumentListScreen = () => {
  const { navigateTo } = useAppNavigation()

  const handleOpenBottomSheet = () => navigateTo(AppRouteTypes.documentDetail)

  return { handleOpenBottomSheet }
}
