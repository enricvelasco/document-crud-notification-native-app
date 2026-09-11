import { usePathname, useRouter } from 'expo-router'
import { useCallback } from 'react'

import { APP_ROUTES, type AppRouteTypes, isAppRoute } from '@constants/paths'

export interface UseAppNavigationModel {
  goBack: () => void
  navigateTo: (route: AppRouteTypes) => void
  refreshCurrentRoute: () => void
}

export const useAppNavigation = (): UseAppNavigationModel => {
  const router = useRouter()
  const pathname = usePathname()

  const goBack = useCallback(() => {
    if (router.canGoBack()) return router.back()

    return router.replace(APP_ROUTES.documentList)
  }, [router])

  const navigateTo = useCallback((route: AppRouteTypes) => router.push(route), [router])

  const refreshCurrentRoute = useCallback(
    () => router.replace(isAppRoute(pathname) ? pathname : APP_ROUTES.documentList),
    [router, pathname],
  )

  return { goBack, navigateTo, refreshCurrentRoute }
}
