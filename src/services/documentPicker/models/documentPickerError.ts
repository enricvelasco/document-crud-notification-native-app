export class DocumentPickerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'DocumentPickerError'
  }
}
