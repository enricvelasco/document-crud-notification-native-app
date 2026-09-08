import type { DocumentContributorModel } from './documentContributorModel'

export interface DocumentModel {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly title: string
  readonly attachments: readonly string[]
  readonly contributors: readonly DocumentContributorModel[]
  readonly version: string
}
