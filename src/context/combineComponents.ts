import { createElement } from 'react'

import type { ProviderComponentType } from './models'

const ChildrenPassThrough: ProviderComponentType = ({ children }) => children

export const combineComponents = (
  providers: readonly ProviderComponentType[],
): ProviderComponentType =>
  providers.reduce<ProviderComponentType>((combined, provider) => {
    const CombinedProvider: ProviderComponentType = ({ children }) =>
      createElement(combined, null, createElement(provider, null, children))

    return CombinedProvider
  }, ChildrenPassThrough)
