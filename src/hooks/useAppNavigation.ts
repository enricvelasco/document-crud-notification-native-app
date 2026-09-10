import { useRouter } from 'expo-router'
import { useCallback } from 'react'

export const AppRouteTypes = {
  documentList: '/',
  documentDetail: '/detail',
} as const

export type AppRouteTypes = (typeof AppRouteTypes)[keyof typeof AppRouteTypes]

export interface UseAppNavigationModel {
  goBack: () => void
  navigateTo: (route: AppRouteTypes) => void
}

export const useAppNavigation = (): UseAppNavigationModel => {
  const router = useRouter()

  const goBack = useCallback(() => {
    if (router.canGoBack()) return router.back()

    return router.replace(AppRouteTypes.documentList)
  }, [router])

  const navigateTo = useCallback((route: AppRouteTypes) => router.push(route), [router])

  return { goBack, navigateTo }
}
