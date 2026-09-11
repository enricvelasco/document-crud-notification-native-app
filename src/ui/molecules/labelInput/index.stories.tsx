import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import type { InputTextProps } from '@ui/atoms/inputText'
import { InputText } from '@ui/atoms/inputText'
import { LabelInput } from '@ui/molecules/labelInput'

const ControlledInputText = ({ value: initialValue, onChangeText, ...rest }: InputTextProps) => {
  const [value, setValue] = useState(initialValue)

  const handleChangeText = (nextValue: string) => {
    setValue(nextValue)
    onChangeText(nextValue)
  }

  return <InputText {...rest} value={value} onChangeText={handleChangeText} />
}

const inputProps: InputTextProps = {
  value: '',
  placeholder: 'Document title',
  onChangeText: () => {},
}

const meta = {
  title: 'UI/Molecules/LabelInput',
  component: LabelInput,

  parameters: {
    docs: {
      description: {
        component: [
          'Puts a label above an input — any input.',
          '',
          'The wrapper does not know or care which field it is labelling. It takes',
          'the input as a component (`input={InputText}`) together with that',
          'component\'s own props (`inputProps`), exactly the way `PrimaryButton`',
          'takes `icon={AddIcon}`. A future `InputSelect` or `InputDate` drops in',
          'unchanged, and each keeps its own prop types — `inputProps` is typed',
          'against whatever was passed as `input`, so a typo in a field\'s props is',
          'still a compile error here.',
          '',
          'Passing the component rather than rendered JSX is what lets the wrapper',
          'stay in charge of presentation: it reads `disabled` off `inputProps` and',
          'dims the label to match, so a disabled field reads as one greyed unit',
          'instead of a bright label over a dead box. That is the whole contract the',
          'wrapper asks of an input — an optional `disabled` prop.',
          '',
          'Layout is a column with the label on top; the input keeps whatever width',
          'the wrapper is given.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    label: {
      control: 'text',
      description: 'The text painted above the input.',
    },
    input: {
      control: false,
      description: [
        'The field component to render, passed as a reference (`InputText`), not',
        'as an element. Must accept an optional `disabled` prop.',
      ].join(' '),
    },
    inputProps: {
      control: false,
      description: 'The props handed straight to `input`. Typed against it.',
    },
  },

  args: {
    label: 'Title',
    input: ControlledInputText,
    inputProps,
  },
} satisfies Meta<typeof LabelInput<InputTextProps>>

export default meta

type Story = StoryObj<typeof LabelInput<InputTextProps>>

/** A label over a text field. */
export const Default: Story = {}

/** The input already holds a value. The wrapper is indifferent to it. */
export const WithValue: Story = {
  args: {
    inputProps: { ...inputProps, value: 'Q3 contributor agreement' },
  },
}

/** `disabled` travels through `inputProps`, and the label dims with the field. */
export const Disabled: Story = {
  args: {
    inputProps: { ...inputProps, disabled: true },
  },
}

/** Any props the wrapped input understands pass through — here, `multiline`. */
export const Multiline: Story = {
  args: {
    label: 'Description',
    inputProps: {
      ...inputProps,
      placeholder: 'What changed in this document?',
      multiline: true,
    },
  },
}

/** What it is for: several labelled fields stacked into a form. */
export const InAForm: Story = {
  render: (args) => (
    <View style={styles.column}>
      <LabelInput {...args} label="Title" inputProps={{ ...inputProps, placeholder: 'Document title' }} />
      <LabelInput {...args} label="Owner" inputProps={{ ...inputProps, placeholder: 'Owner' }} />
      <LabelInput
        {...args}
        label="Description"
        inputProps={{ ...inputProps, placeholder: 'What changed?', multiline: true }}
      />
      <LabelInput {...args} label="Archived reason" inputProps={{ ...inputProps, disabled: true }} />
    </View>
  ),
}

const styles = StyleSheet.create({
  column: {
    width: 320,
    gap: Spacing.four,
  },
})
