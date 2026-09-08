import {
  type HttpClientConfigModel,
  HttpError,
  HttpErrorTypes,
  type HttpServiceModel,
} from '../models'

const JSON_MEDIA_TYPE = 'application/json'

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'

const toTransportError = (error: unknown, url: string): HttpError => {
  if (isAbortError(error)) {
    return new HttpError(`Request to ${url} timed out.`, {
      type: HttpErrorTypes.Timeout,
      status: null,
    })
  }

  return new HttpError(`Request to ${url} could not be sent.`, {
    type: HttpErrorTypes.Network,
    status: null,
  })
}

const sendGetRequest = async (url: string, signal: AbortSignal): Promise<Response> => {
  try {
    return await fetch(url, {
      method: 'GET',
      headers: { Accept: JSON_MEDIA_TYPE },
      signal,
    })
  } catch (error) {
    throw toTransportError(error, url)
  }
}

const parseJsonResponse = async <TResponse,>(response: Response, url: string): Promise<TResponse> => {
  try {
    return (await response.json()) as TResponse
  } catch (error) {
    if (isAbortError(error)) {
      throw toTransportError(error, url)
    }

    throw new HttpError(`Response from ${url} is not valid JSON.`, {
      type: HttpErrorTypes.Parse,
      status: response.status,
    })
  }
}

const getJson = async <TResponse,>(url: string, timeoutMs: number): Promise<TResponse> => {
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs)

  try {
    const response = await sendGetRequest(url, abortController.signal)

    if (!response.ok) {
      throw new HttpError(`Request to ${url} failed with status ${response.status}.`, {
        type: HttpErrorTypes.Status,
        status: response.status,
      })
    }

    return await parseJsonResponse<TResponse>(response, url)
  } finally {
    clearTimeout(timeoutId)
  }
}

const toBaseUrlWithoutTrailingSlash = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

const toRequestUrl = (baseUrl: string, path: string): string =>
  `${toBaseUrlWithoutTrailingSlash(baseUrl)}${path}`

export const createFetchHttpAdapter = (config: HttpClientConfigModel): HttpServiceModel => ({
  get: <TResponse,>(path: string): Promise<TResponse> =>
    getJson<TResponse>(toRequestUrl(config.baseUrl, path), config.timeoutMs),
})
