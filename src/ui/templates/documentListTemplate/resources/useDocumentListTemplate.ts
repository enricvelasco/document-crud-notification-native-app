import { useState } from 'react'

import type { DocumentListLayoutTypes } from '../models'
import { isDocumentListLayout } from './isDocumentListLayout'

export interface UseDocumentListTemplateModel {
  layout: DocumentListLayoutTypes
  handleLayoutChange: (value: string) => void
}

export const useDocumentListTemplate = (
  initialLayout: DocumentListLayoutTypes,
): UseDocumentListTemplateModel => {
  const [layout, setLayout] = useState<DocumentListLayoutTypes>(initialLayout)

  const handleLayoutChange = (value: string): void => {
    if (!isDocumentListLayout(value)) return

    setLayout(value)
  }

  return { layout, handleLayoutChange }
}
