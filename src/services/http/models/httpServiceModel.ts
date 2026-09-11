import type { HttpRequestOptionsModel } from '@services/http'

export interface HttpServiceModel {
  get: <TResponse>(path: string, options?: HttpRequestOptionsModel) => Promise<TResponse>
}
