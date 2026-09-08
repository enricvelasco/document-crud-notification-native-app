import type { TranslationKeyType } from '@translations'

import type { TranslateParamsModel } from '@services/translate'

export type TranslateType = (
  key: TranslationKeyType,
  params?: TranslateParamsModel,
) => string

export interface TranslateServiceModel {
  translate: TranslateType
}
