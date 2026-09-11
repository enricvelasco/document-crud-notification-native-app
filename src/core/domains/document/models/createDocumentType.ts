import type { CreateDocumentModel } from './createDocumentModel'

export type CreateDocumentType = (document: CreateDocumentModel) => Promise<void>
