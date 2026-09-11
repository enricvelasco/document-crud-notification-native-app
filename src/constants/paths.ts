export const APP_ROUTES = {
  documentList: '/',
  documentNew: '/new',
  notificationList: '/notifications',
} as const

export type AppRouteTypes = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export const APP_ROUTE_LIST: readonly AppRouteTypes[] = Object.values(APP_ROUTES)

export const isAppRoute = (value: string): value is AppRouteTypes =>
  (APP_ROUTE_LIST as readonly string[]).includes(value)
