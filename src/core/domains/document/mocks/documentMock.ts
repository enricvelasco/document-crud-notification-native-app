import type { DocumentListPayloadType, DocumentListType, GetDocumentListResponseModel } from '../models'

export const documentListPayloadMock: DocumentListPayloadType = [
  {
    ID: 'b763fe1e-469d-4422-9c31-6b9f1a02bdf1',
    CreatedAt: '1971-01-22T17:18:03.490907425Z',
    UpdatedAt: '1948-05-15T20:53:11.428431887Z',
    Title: 'St. Bernardus Abt 12',
    Attachments: [
      'German Wheat And Rye Beer',
      'Scottish And Irish Ale',
      'Amber Hybrid Beer',
    ],
    Contributors: [
      { ID: '1f2ff2e2-855a-4e2f-9ac5-a43788831d74', Name: 'Cyril Huels' },
      { ID: '04dad9ce-9d98-4e91-9d27-0d6b7322186e', Name: 'Giovanni Runolfsson' },
      { ID: 'ec7472ca-fd4f-4398-8b88-02525654af0d', Name: 'Elton Fahey' },
      { ID: '0dd3b29b-e78e-459c-a7c9-1e981a9eac5a', Name: 'Zula Willms' },
    ],
    Version: '1.14.2',
  },
  {
    ID: '1c37b048-017c-4656-86cd-a3a5404300b8',
    CreatedAt: '1960-08-26T03:12:52.624028557Z',
    UpdatedAt: '1938-10-13T00:23:08.083347625Z',
    Title: 'Double Bastard Ale',
    Attachments: [
      'Light Lager',
      'Belgian And French Ale',
      'Vegetable Beer',
    ],
    Contributors: [
      { ID: 'c4c4d5d4-f7c1-447d-a167-a5409c6ba28c', Name: 'Edgar Turcotte' },
      { ID: '342b1cff-8f39-407d-8b41-f8d8a9077402', Name: 'Euna Weimann' },
      { ID: '865b59de-39fd-4269-8c39-59f0fc559582', Name: 'Stuart Williamson' },
    ],
    Version: '1.13.14',
  },
  {
    ID: '8f8d1643-7d84-4099-9797-30511b7b0e55',
    CreatedAt: '1964-03-11T15:35:56.628172531Z',
    UpdatedAt: '1955-04-18T16:29:36.889670447Z',
    Title: 'Trois Pistoles',
    Attachments: [
      'Stout',
      'Dark Lager',
    ],
    Contributors: [
      { ID: '7042ce43-5e87-4853-9abb-bd27e693a0df', Name: 'Gus Gutkowski' },
      { ID: 'f43c8a12-02b8-416d-a8d7-dfbb4bce0b5b', Name: 'Eliane Toy' },
      { ID: '40916e38-1fd8-4e41-adc2-a2174a8f2ec9', Name: 'Una Champlin' },
      { ID: '77507225-4e11-4cdf-abf4-ab5946d943d8', Name: 'Dorian Okuneva' },
      { ID: 'cb84a1b0-f5ed-40ff-8ac9-615fca66c33c', Name: 'Cordie Lemke' },
    ],
    Version: '3.2.16',
  },
  {
    ID: '0c1d21e0-1851-4275-8089-eb2542a6bcab',
    CreatedAt: '1928-03-30T10:17:32.602577434Z',
    UpdatedAt: '1941-02-01T04:24:53.719164154Z',
    Title: 'Founders Kentucky Breakfast',
    Attachments: [
      'Wood-aged Beer',
      'Stout',
      'English Brown Ale',
    ],
    Contributors: [
      { ID: '8d9b10c4-6123-4268-8d08-5e5999d17480', Name: 'Emelia Zemlak' },
      { ID: '47d029c3-2549-47a3-a8b8-9b0fbf29a324', Name: 'Tessie Hermiston' },
    ],
    Version: '5.14.11',
  },
]

export const documentListMock: DocumentListType = [
  {
    id: 'b763fe1e-469d-4422-9c31-6b9f1a02bdf1',
    createdAt: '1971-01-22T17:18:03.490907425Z',
    updatedAt: '1948-05-15T20:53:11.428431887Z',
    title: 'St. Bernardus Abt 12',
    attachments: [
      'German Wheat And Rye Beer',
      'Scottish And Irish Ale',
      'Amber Hybrid Beer',
    ],
    contributors: [
      { id: '1f2ff2e2-855a-4e2f-9ac5-a43788831d74', name: 'Cyril Huels' },
      { id: '04dad9ce-9d98-4e91-9d27-0d6b7322186e', name: 'Giovanni Runolfsson' },
      { id: 'ec7472ca-fd4f-4398-8b88-02525654af0d', name: 'Elton Fahey' },
      { id: '0dd3b29b-e78e-459c-a7c9-1e981a9eac5a', name: 'Zula Willms' },
    ],
    version: '1.14.2',
  },
  {
    id: '1c37b048-017c-4656-86cd-a3a5404300b8',
    createdAt: '1960-08-26T03:12:52.624028557Z',
    updatedAt: '1938-10-13T00:23:08.083347625Z',
    title: 'Double Bastard Ale',
    attachments: [
      'Light Lager',
      'Belgian And French Ale',
      'Vegetable Beer',
    ],
    contributors: [
      { id: 'c4c4d5d4-f7c1-447d-a167-a5409c6ba28c', name: 'Edgar Turcotte' },
      { id: '342b1cff-8f39-407d-8b41-f8d8a9077402', name: 'Euna Weimann' },
      { id: '865b59de-39fd-4269-8c39-59f0fc559582', name: 'Stuart Williamson' },
    ],
    version: '1.13.14',
  },
  {
    id: '8f8d1643-7d84-4099-9797-30511b7b0e55',
    createdAt: '1964-03-11T15:35:56.628172531Z',
    updatedAt: '1955-04-18T16:29:36.889670447Z',
    title: 'Trois Pistoles',
    attachments: [
      'Stout',
      'Dark Lager',
    ],
    contributors: [
      { id: '7042ce43-5e87-4853-9abb-bd27e693a0df', name: 'Gus Gutkowski' },
      { id: 'f43c8a12-02b8-416d-a8d7-dfbb4bce0b5b', name: 'Eliane Toy' },
      { id: '40916e38-1fd8-4e41-adc2-a2174a8f2ec9', name: 'Una Champlin' },
      { id: '77507225-4e11-4cdf-abf4-ab5946d943d8', name: 'Dorian Okuneva' },
      { id: 'cb84a1b0-f5ed-40ff-8ac9-615fca66c33c', name: 'Cordie Lemke' },
    ],
    version: '3.2.16',
  },
  {
    id: '0c1d21e0-1851-4275-8089-eb2542a6bcab',
    createdAt: '1928-03-30T10:17:32.602577434Z',
    updatedAt: '1941-02-01T04:24:53.719164154Z',
    title: 'Founders Kentucky Breakfast',
    attachments: [
      'Wood-aged Beer',
      'Stout',
      'English Brown Ale',
    ],
    contributors: [
      { id: '8d9b10c4-6123-4268-8d08-5e5999d17480', name: 'Emelia Zemlak' },
      { id: '47d029c3-2549-47a3-a8b8-9b0fbf29a324', name: 'Tessie Hermiston' },
    ],
    version: '5.14.11',
  },
]

export const getDocumentListResponseMock: GetDocumentListResponseModel = {
  documents: documentListMock,
}
