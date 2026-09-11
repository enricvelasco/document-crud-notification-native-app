import { useState } from 'react'

import type { NewDocumentFormSubmitType, NewDocumentFormValuesModel } from '../models'
import { NEW_DOCUMENT_FORM_EMPTY_VALUES } from './constants'
import { isNewDocumentFormComplete } from './isNewDocumentFormComplete'
import { isNewDocumentFormErrorResponse } from './isNewDocumentFormErrorResponse'

export interface UseNewDocumentFormTemplateModel {
  values: NewDocumentFormValuesModel
  errorMessage: string
  isSubmitting: boolean
  canSubmit: boolean
  handleNameChange: (name: string) => void
  handleVersionChange: (version: string) => void
  handleFileChange: (fileName: string) => void
  handleSubmit: () => void
}

export const useNewDocumentFormTemplate = (
  onSubmit: NewDocumentFormSubmitType,
): UseNewDocumentFormTemplateModel => {
  const [values, setValues] = useState<NewDocumentFormValuesModel>(NEW_DOCUMENT_FORM_EMPTY_VALUES)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (): Promise<void> => {
    setIsSubmitting(true)
    setErrorMessage('')

    const response = await onSubmit(values)

    setIsSubmitting(false)

    if (isNewDocumentFormErrorResponse(response)) {
      setErrorMessage(response.message)

      return
    }

    setValues(NEW_DOCUMENT_FORM_EMPTY_VALUES)
  }

  return {
    values,
    errorMessage,
    isSubmitting,
    canSubmit: !isSubmitting && isNewDocumentFormComplete(values),
    handleNameChange: (name) => setValues((current) => ({ ...current, name })),
    handleVersionChange: (version) => setValues((current) => ({ ...current, version })),
    handleFileChange: (fileName) => setValues((current) => ({ ...current, fileName })),
    handleSubmit: () => void submit(),
  }
}
