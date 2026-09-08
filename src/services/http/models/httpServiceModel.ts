export interface HttpServiceModel {
  get: <TResponse>(path: string) => Promise<TResponse>
}
