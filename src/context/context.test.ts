import {
  createElement,
  isValidElement,
  type PropsWithChildren,
  type ReactNode,
} from 'react'

import { AppContextProvider } from './appContextProvider'
import { combineComponents } from './combineComponents'
import type { ProviderComponentType } from './models'

jest.mock('./notificationContext', () => ({
  NotificationContextProvider: jest.fn(({ children }: PropsWithChildren) => children),
}))

const CHILDREN = 'children'

const renderedProviders: string[] = []

const createProviderStub = (name: string): ProviderComponentType => ({ children }) => {
  renderedProviders.push(name)

  return children
}

const renderProviderTree = (node: ReactNode): ReactNode => {
  if (!isValidElement<PropsWithChildren>(node)) return node

  const renderProvider = node.type as (props: PropsWithChildren) => ReactNode

  return renderProviderTree(renderProvider(node.props))
}

const renderCombined = (providers: readonly ProviderComponentType[]): ReactNode =>
  renderProviderTree(createElement(combineComponents(providers), null, CHILDREN))

beforeEach(() => {
  renderedProviders.length = 0
})

describe('combineComponents', () => {
  it('renders the children untouched when there is no provider', () => {
    expect(renderCombined([])).toBe(CHILDREN)
    expect(renderedProviders).toEqual([])
  })

  it('wraps the children in the only provider it is given', () => {
    expect(renderCombined([createProviderStub('only')])).toBe(CHILDREN)
    expect(renderedProviders).toEqual(['only'])
  })

  it('keeps the first provider outermost and the last one closest to the children', () => {
    renderCombined([
      createProviderStub('first'),
      createProviderStub('second'),
      createProviderStub('third'),
    ])

    expect(renderedProviders).toEqual(['first', 'second', 'third'])
  })

  it('reaches the innermost provider with the children it was given', () => {
    expect(renderCombined([createProviderStub('outer'), createProviderStub('inner')]))
      .toBe(CHILDREN)
  })

  it('renders no provider until the returned component is rendered', () => {
    combineComponents([createProviderStub('never rendered')])

    expect(renderedProviders).toEqual([])
  })

  it('builds a new component on every call, so the combining belongs at module level', () => {
    const providers = [createProviderStub('stable')]

    expect(combineComponents(providers)).not.toBe(combineComponents(providers))
  })
})

describe('AppContextProvider', () => {
  it('passes the children through every global provider it combines', () => {
    expect(renderProviderTree(createElement(AppContextProvider, null, CHILDREN))).toBe(CHILDREN)
  })
})
