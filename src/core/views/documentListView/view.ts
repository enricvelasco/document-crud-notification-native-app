import { getDocumentList } from '@core/domains/document'

import { documentListToViewModel } from './mappers/documentListToViewModel'
import type { DocumentListViewModel } from './models'

export const loadDocumentListView = async (
  signal?: AbortSignal,
): Promise<DocumentListViewModel> => {
  const [documents] = await Promise.allSettled([getDocumentList(signal)])

  return documentListToViewModel({ documents, isAborted: Boolean(signal?.aborted) })
}
