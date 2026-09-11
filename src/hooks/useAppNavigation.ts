import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { APP_ROUTES, type AppRouteTypes } from '@constants/paths'

export interface UseAppNavigationModel {
  goBack: () => void
  navigateTo: (route: AppRouteTypes) => void
}

export const useAppNavigation = (): UseAppNavigationModel => {
  const router = useRouter()

  const goBack = useCallback(() => {
    if (router.canGoBack()) return router.back()

    return router.replace(APP_ROUTES.documentList)
  }, [router])

  const navigateTo = useCallback((route: AppRouteTypes) => router.push(route), [router])

  return { goBack, navigateTo }
}
