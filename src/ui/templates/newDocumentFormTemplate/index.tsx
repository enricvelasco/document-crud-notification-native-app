import { Text, View } from 'react-native'

import { useTranslate } from '@hooks/useTranslate'
import { InputText } from '@ui/atoms/inputText'
import { PrimaryButton } from '@ui/atoms/primaryButton'
import { InputDocument } from '@ui/molecules/inputDocument'
import { LabelInput } from '@ui/molecules/labelInput'

import { NewDocumentFormHeader } from './components/newDocumentFormHeader'
import { NewDocumentFormMessage } from './components/newDocumentFormMessage'
import type { NewDocumentFormSubmitType } from './models'
import { getNewDocumentFormSubmitLabelKey } from './resources/getNewDocumentFormSubmitLabelKey'
import { useNewDocumentFormTemplate } from './resources/useNewDocumentFormTemplate'
import { styles } from './styles'

export * from './models'

export interface NewDocumentFormTemplateProps {
  onSubmit: NewDocumentFormSubmitType
  onClose: () => void
}

export const NewDocumentFormTemplate = ({ onSubmit, onClose }: NewDocumentFormTemplateProps) => {
  const translate = useTranslate()
  const {
    values,
    errorMessage,
    isSubmitting,
    canSubmit,
    handleNameChange,
    handleVersionChange,
    handleFileChange,
    handleSubmit,
  } = useNewDocumentFormTemplate(onSubmit)

  return (
    <View style={styles.root}>
      <NewDocumentFormHeader
        title={translate('_NEW_DOCUMENT_FORM_TEMPLATE_HEADER_TITLE')}
        closeLabel={translate('_NEW_DOCUMENT_FORM_TEMPLATE_CLOSE')}
        onClose={onClose}
      />

      <Text style={styles.title}>{translate('_NEW_DOCUMENT_FORM_TEMPLATE_TITLE')}</Text>

      <View style={styles.content}>
        <LabelInput
          label={translate('_NEW_DOCUMENT_FORM_TEMPLATE_NAME_LABEL')}
          input={InputText}
          inputProps={{
            value: values.name,
            placeholder: translate('_NEW_DOCUMENT_FORM_TEMPLATE_NAME_PLACEHOLDER'),
            disabled: isSubmitting,
            onChangeText: handleNameChange,
          }}
        />

        <LabelInput
          label={translate('_NEW_DOCUMENT_FORM_TEMPLATE_VERSION_LABEL')}
          input={InputText}
          inputProps={{
            value: values.version,
            placeholder: translate('_NEW_DOCUMENT_FORM_TEMPLATE_VERSION_PLACEHOLDER'),
            disabled: isSubmitting,
            onChangeText: handleVersionChange,
          }}
        />

        <LabelInput
          label={translate('_NEW_DOCUMENT_FORM_TEMPLATE_FILE_LABEL')}
          input={InputDocument}
          inputProps={{
            value: values.fileName,
            placeholder: translate('_NEW_DOCUMENT_FORM_TEMPLATE_FILE_PLACEHOLDER'),
            disabled: isSubmitting,
            onSelectDocument: handleFileChange,
          }}
        />

        {errorMessage ? <NewDocumentFormMessage message={errorMessage} /> : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={translate(getNewDocumentFormSubmitLabelKey(isSubmitting))}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>
    </View>
  )
}
