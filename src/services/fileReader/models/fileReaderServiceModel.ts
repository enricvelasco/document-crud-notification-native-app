export interface FileReaderServiceModel {
  readAsBase64: (uri: string) => Promise<string>
}
