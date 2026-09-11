import type { DocumentContributorModel, DocumentModel } from '@core/domains/document'
import { translateService } from '@services/translate'

import {
  type DocumentListItemViewModel,
  type DocumentListResultsModel,
  type DocumentListViewModel,
  ViewSectionStatusTypes,
  type ViewSectionType,
} from '../models'

const contributorModelToName = (contributor: DocumentContributorModel): string => contributor.name

const documentModelToListItem = (document: DocumentModel): DocumentListItemViewModel => ({
  id: document.id,
  title: document.title,
  description: translateService.translate('_DOCUMENT_LIST_VIEW_DESCRIPTION', {
    version: document.version,
  }),
  contributors: document.contributors.map(contributorModelToName),
  attachments: document.attachments,
})

const documentsResultToSection = (
  results: DocumentListResultsModel,
): ViewSectionType<readonly DocumentListItemViewModel[]> => {
  if (results.isAborted) return { status: ViewSectionStatusTypes.Aborted }

  if (results.documents.status === 'rejected') {
    return {
      status: ViewSectionStatusTypes.Error,
      message: translateService.translate('_DOCUMENT_LIST_VIEW_LOAD_ERROR'),
      cause: results.documents.reason,
    }
  }

  return {
    status: ViewSectionStatusTypes.Ok,
    data: results.documents.value.documents.map(documentModelToListItem),
  }
}

export const documentListToViewModel = (
  results: DocumentListResultsModel,
): DocumentListViewModel => ({
  documents: documentsResultToSection(results),
})
