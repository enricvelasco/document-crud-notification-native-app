import type { NotificationEntryModel } from '@context'
import { notificationMock } from '@core/domains/notification/mocks/notificationMock'
import { LanguageTypes } from '@services/language'

import { toNotificationListItem, toNotificationListItems, toNotificationTimestampLabel } from './resources/utils'

jest.mock('@services/language', () => ({
  ...jest.requireActual('@services/language'),
  languageService: { getLanguage: jest.fn() },
}))

const { languageService } = jest.requireMock('@services/language') as {
  languageService: { getLanguage: jest.Mock }
}

const notificationEntryMock: NotificationEntryModel = { ...notificationMock, id: '0-f09acc46' }

beforeEach(() => languageService.getLanguage.mockReset().mockReturnValue(LanguageTypes.English))

describe('toNotificationTimestampLabel', () => {
  it('reads the timestamp in the language the app is in', () => {
    languageService.getLanguage.mockReturnValue(LanguageTypes.Spanish)

    expect(toNotificationTimestampLabel(notificationMock.timestamp)).not.toBe(notificationMock.timestamp)
  })

  it('paints a timestamp it cannot read as it arrived', () => {
    expect(toNotificationTimestampLabel('not a date')).toBe('not a date')
  })
})

describe('toNotificationListItem', () => {
  it('carries the accumulated key through as the list key', () => {
    expect(toNotificationListItem(notificationEntryMock).id).toBe(notificationEntryMock.id)
  })

  it('titles the notification with the document it is about', () => {
    expect(toNotificationListItem(notificationEntryMock).title).toBe(notificationMock.documentTitle)
  })

  it('names the person behind the change in the description', () => {
    expect(toNotificationListItem(notificationEntryMock).description).toContain(notificationMock.userName)
  })
})

describe('toNotificationListItems', () => {
  it('paints one item per accumulated notification', () => {
    expect(toNotificationListItems([notificationEntryMock, notificationEntryMock])).toHaveLength(2)
  })

  it('has nothing to paint before the first notification arrives', () => {
    expect(toNotificationListItems([])).toEqual([])
  })
})
