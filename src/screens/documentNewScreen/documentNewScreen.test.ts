import { NewDocumentFormResponseTypes } from '@ui/templates/newDocumentFormTemplate'

import { submitNewDocumentWithoutPersistence } from './resources/services'

const formValuesMock = {
  name: 'Service contract',
  version: '1.0.0',
  fileName: 'service-contract.pdf',
} as const

describe('submitNewDocumentWithoutPersistence', () => {
  it('reports success without a save service behind it', async () => {
    await expect(submitNewDocumentWithoutPersistence(formValuesMock)).resolves.toEqual({
      type: NewDocumentFormResponseTypes.Success,
    })
  })
})
