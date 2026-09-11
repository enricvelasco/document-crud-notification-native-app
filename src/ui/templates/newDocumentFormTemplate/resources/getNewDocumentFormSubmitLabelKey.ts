import type { TranslationKeyType } from '@translations'

export const getNewDocumentFormSubmitLabelKey = (isSubmitting: boolean): TranslationKeyType =>
  isSubmitting ? '_NEW_DOCUMENT_FORM_TEMPLATE_SUBMITTING' : '_NEW_DOCUMENT_FORM_TEMPLATE_SUBMIT'
