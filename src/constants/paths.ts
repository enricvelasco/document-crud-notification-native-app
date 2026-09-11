export const APP_ROUTES = {
  documentList: '/',
  documentNew: '/new',
  notificationList: '/notifications',
} as const

export type AppRouteTypes = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
