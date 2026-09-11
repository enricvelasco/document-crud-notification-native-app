export interface DocumentListItemViewModel {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly contributors: readonly string[]
  readonly attachments: readonly string[]
}
