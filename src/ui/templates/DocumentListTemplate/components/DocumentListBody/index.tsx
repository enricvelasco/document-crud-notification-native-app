import { type DocumentListLayoutTypes, type DocumentListStateModel, DocumentListStateTypes } from '../../models'
import { DocumentListContent } from '../DocumentListContent'
import { DocumentListLoading } from '../DocumentListLoading'
import { DocumentListMessage } from '../DocumentListMessage'

export interface DocumentListBodyProps {
  state: DocumentListStateModel
  layout: DocumentListLayoutTypes
}

export const DocumentListBody = ({ state, layout }: DocumentListBodyProps) => {
  if (state.type === DocumentListStateTypes.Loading) return <DocumentListLoading />

  if (state.type === DocumentListStateTypes.Error) {
    return <DocumentListMessage message={state.message} />
  }

  return <DocumentListContent documents={state.documents} layout={layout} />
}
