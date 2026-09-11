import { DocumentError, type GetDocumentListResponseModel } from '@core/domains/document'
import { getDocumentListResponseMock } from '@core/domains/document/mocks/documentMock'

import { type DocumentListItemViewModel, type DocumentListResultsModel, ViewSectionStatusTypes } from '../models'

export const documentListFulfilledResultMock: PromiseFulfilledResult<GetDocumentListResponseModel> = {
  status: 'fulfilled',
  value: getDocumentListResponseMock,
}

export const documentListRejectedResultMock: PromiseRejectedResult = {
  status: 'rejected',
  reason: new DocumentError('The document list could not be loaded.'),
}

export const documentListResultsMock: DocumentListResultsModel = {
  documents: documentListFulfilledResultMock,
  isAborted: false,
}

export const documentListRejectedResultsMock: DocumentListResultsModel = {
  documents: documentListRejectedResultMock,
  isAborted: false,
}

export const documentListAbortedResultsMock: DocumentListResultsModel = {
  documents: documentListRejectedResultMock,
  isAborted: true,
}

export const documentListItemsMock: readonly DocumentListItemViewModel[] = [
  {
    id: 'b763fe1e-469d-4422-9c31-6b9f1a02bdf1',
    title: 'St. Bernardus Abt 12',
    description: 'Version 1.14.2',
    contributors: ['Cyril Huels', 'Giovanni Runolfsson', 'Elton Fahey', 'Zula Willms'],
    attachments: [
      'German Wheat And Rye Beer',
      'Scottish And Irish Ale',
      'Amber Hybrid Beer',
    ],
  },
  {
    id: '1c37b048-017c-4656-86cd-a3a5404300b8',
    title: 'Double Bastard Ale',
    description: 'Version 1.13.14',
    contributors: ['Edgar Turcotte', 'Euna Weimann', 'Stuart Williamson'],
    attachments: [
      'Light Lager',
      'Belgian And French Ale',
      'Vegetable Beer',
    ],
  },
  {
    id: '8f8d1643-7d84-4099-9797-30511b7b0e55',
    title: 'Trois Pistoles',
    description: 'Version 3.2.16',
    contributors: [
      'Gus Gutkowski',
      'Eliane Toy',
      'Una Champlin',
      'Dorian Okuneva',
      'Cordie Lemke',
    ],
    attachments: [
      'Stout',
      'Dark Lager',
    ],
  },
  {
    id: '0c1d21e0-1851-4275-8089-eb2542a6bcab',
    title: 'Founders Kentucky Breakfast',
    description: 'Version 5.14.11',
    contributors: ['Emelia Zemlak', 'Tessie Hermiston'],
    attachments: [
      'Wood-aged Beer',
      'Stout',
      'English Brown Ale',
    ],
  },
]

export const documentListOkSectionMock = {
  status: ViewSectionStatusTypes.Ok,
  data: documentListItemsMock,
} as const
