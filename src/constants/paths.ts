export const APP_ROUTES = {
  documentList: '/',
  documentDetail: '/detail',
  documentNew: '/new',
} as const

export type AppRouteTypes = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
