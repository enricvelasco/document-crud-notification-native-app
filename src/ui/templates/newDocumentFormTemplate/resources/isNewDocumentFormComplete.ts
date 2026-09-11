import type { NewDocumentFormValuesModel } from '../models'

export const isNewDocumentFormComplete = ({
  name,
  version,
  fileUri,
}: NewDocumentFormValuesModel): boolean =>
  name.trim().length > 0 && version.trim().length > 0 && fileUri.length > 0
