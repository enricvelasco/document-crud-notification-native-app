import type { GetDocumentListResponseModel } from '@core/domains/document'

export interface DocumentListResultsModel {
  readonly documents: PromiseSettledResult<GetDocumentListResponseModel>
  readonly isAborted: boolean
}
