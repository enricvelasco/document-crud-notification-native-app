import type { GetDocumentListResponseModel } from '@core/domains/document'

export type GetDocumentListType = (signal?: AbortSignal) => Promise<GetDocumentListResponseModel>
