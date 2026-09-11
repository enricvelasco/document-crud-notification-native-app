import type { CreateDocumentActionModel } from './createDocumentActionModel'

export interface CreateDocumentActionMapperModel {
  readonly action: CreateDocumentActionModel
  readonly fileBase64: string
}
