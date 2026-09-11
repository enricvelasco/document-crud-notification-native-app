import {
  type HttpClientConfigModel,
  HttpError,
  HttpErrorTypes,
  type HttpRequestOptionsModel,
  type HttpServiceModel,
} from '../models'

const JSON_MEDIA_TYPE = 'application/json'

export interface HttpRequestContextModel {
  readonly url: string
  readonly timeoutMs: number
  readonly signal?: AbortSignal
}

export interface AbortSignalLinkModel {
  readonly abortController: AbortController
  readonly signal?: AbortSignal
}

const noop = (): void => undefined

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'

const linkAbortSignal = ({ abortController, signal }: AbortSignalLinkModel): (() => void) => {
  if (!signal) return noop

  if (signal.aborted) {
    abortController.abort()

    return noop
  }

  const abort = (): void => abortController.abort()

  signal.addEventListener('abort', abort)

  return (): void => signal.removeEventListener('abort', abort)
}

const toAbortedError = (url: string): HttpError =>
  new HttpError(`Request to ${url} was aborted.`, {
    type: HttpErrorTypes.Aborted,
    status: null,
  })

const toTimeoutError = (url: string): HttpError =>
  new HttpError(`Request to ${url} timed out.`, {
    type: HttpErrorTypes.Timeout,
    status: null,
  })

const toNetworkError = (url: string): HttpError =>
  new HttpError(`Request to ${url} could not be sent.`, {
    type: HttpErrorTypes.Network,
    status: null,
  })

const toTransportError = (error: unknown, context: HttpRequestContextModel): HttpError => {
  if (!isAbortError(error)) return toNetworkError(context.url)

  if (context.signal?.aborted) return toAbortedError(context.url)

  return toTimeoutError(context.url)
}

const sendGetRequest = async (
  context: HttpRequestContextModel,
  signal: AbortSignal,
): Promise<Response> => {
  try {
    return await fetch(context.url, {
      method: 'GET',
      headers: { Accept: JSON_MEDIA_TYPE },
      signal,
    })
  } catch (error) {
    throw toTransportError(error, context)
  }
}

const parseJsonResponse = async <TResponse,>(
  response: Response,
  context: HttpRequestContextModel,
): Promise<TResponse> => {
  try {
    return (await response.json()) as TResponse
  } catch (error) {
    if (isAbortError(error)) {
      throw toTransportError(error, context)
    }

    throw new HttpError(`Response from ${context.url} is not valid JSON.`, {
      type: HttpErrorTypes.Parse,
      status: response.status,
    })
  }
}

const getJson = async <TResponse,>(context: HttpRequestContextModel): Promise<TResponse> => {
  const abortController = new AbortController()
  const unlinkAbortSignal = linkAbortSignal({ abortController, signal: context.signal })
  const timeoutId = setTimeout(() => abortController.abort(), context.timeoutMs)

  try {
    const response = await sendGetRequest(context, abortController.signal)

    if (!response.ok) {
      throw new HttpError(`Request to ${context.url} failed with status ${response.status}.`, {
        type: HttpErrorTypes.Status,
        status: response.status,
      })
    }

    return await parseJsonResponse<TResponse>(response, context)
  } finally {
    clearTimeout(timeoutId)
    unlinkAbortSignal()
  }
}

const toBaseUrlWithoutTrailingSlash = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

const toRequestUrl = (baseUrl: string, path: string): string =>
  `${toBaseUrlWithoutTrailingSlash(baseUrl)}${path}`

export const createFetchHttpAdapter = (config: HttpClientConfigModel): HttpServiceModel => ({
  get: <TResponse,>(path: string, options?: HttpRequestOptionsModel): Promise<TResponse> =>
    getJson<TResponse>({
      url: toRequestUrl(config.baseUrl, path),
      timeoutMs: config.timeoutMs,
      signal: options?.signal,
    }),
})
