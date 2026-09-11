import type { NewDocumentFormValuesModel } from '../models'

export const isNewDocumentFormComplete = ({
  name,
  version,
  fileName,
}: NewDocumentFormValuesModel): boolean =>
  name.trim().length > 0 && version.trim().length > 0 && fileName.length > 0
