import type { WebSocketConnectionModel } from '@services/webSocket'
import type { WebSocketConnectionOptionsModel } from '@services/webSocket'

export interface WebSocketServiceModel {
  connect: <TMessage>(
    path: string,
    options: WebSocketConnectionOptionsModel<TMessage>,
  ) => WebSocketConnectionModel
}
