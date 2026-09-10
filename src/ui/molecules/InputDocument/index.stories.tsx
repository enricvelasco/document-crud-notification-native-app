import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { LabelInput } from '@ui/molecules/LabelInput'

import type { InputDocumentProps } from '.'
import { InputDocument } from '.'

const meta = {
  title: 'UI/Molecules/InputDocument',
  component: InputDocument,

  parameters: {
    docs: {
      description: {
        component: [
          'A file field wearing a `SecondaryButton`. It is the only control in the',
          'kit whose value the user cannot type: pressing it opens the system',
          'document browser, and the name of whatever they choose comes back',
          'through `onSelectDocument`.',
          '',
          'The button is the whole component — same 48pt height, same 1pt',
          '`Colors.border.default` edge, `DocumentIcon` always on the left. What',
          'changes is the label: `placeholder` while nothing is selected, the file',
          'name once something is. `SecondaryButton` truncates it to one line, so a',
          'long name never grows the row.',
          '',
          'It is controlled, like `InputText` — the parent owns `value` and decides',
          'what a selection means. Cancelling the system browser is a no-op:',
          '`onSelectDocument` is never called, so the previous value survives.',
          '',
          'The system browser lives behind `@services/documentPicker`, not behind a',
          'direct `expo-document-picker` import, which is what lets a test of this',
          'component mock one module the project owns.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    placeholder: {
      control: 'text',
      description: 'The label painted while no document is selected.',
    },
    value: {
      control: 'text',
      description: [
        'The name of the selected document, painted in place of the placeholder.',
        'Owned by the parent — the component never stores it.',
      ].join(' '),
      table: { defaultValue: { summary: 'none' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Fades the border and content, and blocks the system browser.',
      table: { defaultValue: { summary: 'false' } },
    },
    onSelectDocument: {
      control: false,
      description: [
        'Fired with the picked document name. Not called when the user cancels,',
        'and never called while `disabled`.',
      ].join(' '),
    },
  },

  args: {
    placeholder: 'Select document',
    disabled: false,
    onSelectDocument: () => {},
  },
} satisfies Meta<typeof InputDocument>

export default meta

type Story = StoryObj<typeof meta>

const SelectableInputDocument = ({ placeholder, disabled }: InputDocumentProps) => {
  const [documentName, setDocumentName] = useState<string | undefined>(undefined)

  return (
    <View style={styles.column}>
      <InputDocument
        placeholder={placeholder}
        value={documentName}
        disabled={disabled}
        onSelectDocument={setDocumentName}
      />
      <Text style={styles.readout}>{documentName ?? 'nothing selected yet'}</Text>
    </View>
  )
}

/** Nothing selected: the placeholder is the label. */
export const Default: Story = {}

/** Something selected: the file name replaces the placeholder. */
export const WithDocument: Story = {
  args: {
    value: 'contract.pdf',
  },
}

/** Faded border, faded label, and the system browser never opens. */
export const Disabled: Story = {
  args: {
    value: 'contract.pdf',
    disabled: true,
  },
}

/** Too long for the width: truncated on one line, never taller. */
export const LongDocumentName: Story = {
  render: (args) => (
    <View style={styles.narrow}>
      <InputDocument {...args} value="2026-q1-contributor-agreement-final-signed.pdf" />
    </View>
  ),
}

/** Under a label, the shape a form actually uses it in. */
export const InAForm: Story = {
  render: (args) => (
    <View style={styles.narrow}>
      <LabelInput label="Attachment" input={InputDocument} inputProps={args} />
    </View>
  ),
}

/** Press it. The real system browser opens and the name lands below. */
export const Live: Story = {
  render: (args) => <SelectableInputDocument {...args} />,
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  narrow: {
    width: 260,
  },
  readout: {
    fontSize: 14,
    color: Colors.text.light,
  },
})
