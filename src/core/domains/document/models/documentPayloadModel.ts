import type { DocumentContributorPayloadModel } from './documentContributorPayloadModel'

export interface DocumentPayloadModel {
  readonly ID: string
  readonly CreatedAt: string
  readonly UpdatedAt: string
  readonly Title: string
  readonly Attachments: readonly string[]
  readonly Contributors: readonly DocumentContributorPayloadModel[]
  readonly Version: string
}
