import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Spacing } from '@constants/theme'
import type { InputTextProps } from '@ui/atoms/inputText'
import { InputText } from '@ui/atoms/inputText'

const ControlledInputText = ({ value: initialValue, onChangeText, ...rest }: InputTextProps) => {
  const [value, setValue] = useState(initialValue)

  const handleChangeText = (nextValue: string) => {
    setValue(nextValue)
    onChangeText(nextValue)
  }

  return <InputText {...rest} value={value} onChangeText={handleChangeText} />
}

const meta = {
  title: 'UI/Atoms/InputText',
  component: InputText,

  render: (args) => <ControlledInputText {...args} />,

  parameters: {
    docs: {
      description: {
        component: [
          'The single-line text field every form is built from — a controlled',
          '`TextInput` wearing the theme.',
          '',
          'It is controlled on purpose: the field never holds its own text. The',
          'caller owns `value` and receives every keystroke through `onChangeText`,',
          'so validation, trimming and submission all happen in one place instead of',
          'being read back off the input. The stories below keep that state for you,',
          'which is why `value` has no control in the panel.',
          '',
          'The one piece of state the field does own is focus, because that is a',
          'purely visual concern the caller has no use for — the border turns',
          '`Colors.primary.default` while the field is focused and drops back to',
          '`Colors.border.default` when it is not.',
          '',
          '`disabled` is the project\'s word, matching `PrimaryButton`, and is',
          'translated to the platform\'s `editable={false}` inside the component. A',
          'disabled field greys its fill, its border, its text and its placeholder,',
          'and is announced as disabled to assistive technology.',
          '',
          'Height is fixed so single-line fields stacked in a form line up exactly.',
          '`multiline` opts into a taller box that grows text from the top rather',
          'than centring it.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    value: {
      control: false,
      description: 'The text shown. The caller owns it — these stories hold it in local state.',
    },
    onChangeText: {
      control: false,
      description: 'Fired on every keystroke with the full next value.',
    },
    placeholder: {
      control: 'text',
      description: 'Hint text painted while the field is empty.',
      table: { defaultValue: { summary: 'none' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Greys the field and blocks editing.',
      table: { defaultValue: { summary: 'false' } },
    },
    multiline: {
      control: 'boolean',
      description: 'Taller box, text anchored to the top, wraps instead of scrolling sideways.',
      table: { defaultValue: { summary: 'false' } },
    },
    secureTextEntry: {
      control: 'boolean',
      description: 'Masks what is typed. Not combinable with `multiline`.',
      table: { defaultValue: { summary: 'false' } },
    },
    maxLength: {
      control: 'number',
      description: 'Hard cap on characters — the field simply stops accepting more.',
      table: { defaultValue: { summary: 'none' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Takes focus as soon as it mounts.',
      table: { defaultValue: { summary: 'false' } },
    },
  },

  args: {
    value: '',
    placeholder: 'Document title',
    disabled: false,
    multiline: false,
    secureTextEntry: false,
    autoFocus: false,
    onChangeText: () => {},
  },
} satisfies Meta<typeof InputText>

export default meta

type Story = StoryObj<typeof meta>

/** Empty, showing its placeholder. Click it to see the focused border. */
export const Default: Story = {}

/** Starting with text already in it. */
export const WithValue: Story = {
  args: {
    value: 'Q3 contributor agreement',
  },
}

/** Greyed and unfocusable — the placeholder dims along with everything else. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** Disabled with text, so the muted text colour is visible rather than the placeholder. */
export const DisabledWithValue: Story = {
  args: {
    value: 'Q3 contributor agreement',
    disabled: true,
  },
}

/** A taller box for descriptions. Text starts at the top and wraps. */
export const Multiline: Story = {
  args: {
    placeholder: 'What changed in this document?',
    multiline: true,
  },
}

/** Masked input for anything that should not be read over a shoulder. */
export const Secure: Story = {
  args: {
    placeholder: 'Password',
    secureTextEntry: true,
  },
}

/** Capped at 12 characters — typing simply stops there. */
export const MaxLength: Story = {
  args: {
    placeholder: 'Short code',
    maxLength: 12,
  },
}

/** The states side by side. Only one of them can take the focus ring. */
export const States: Story = {
  render: (args) => (
    <View style={styles.column}>
      <ControlledInputText {...args} placeholder="Empty" />
      <ControlledInputText {...args} value="Filled in" />
      <ControlledInputText {...args} placeholder="Disabled" disabled />
      <ControlledInputText {...args} value="Disabled with text" disabled />
    </View>
  ),
}

/** Stacked in a form: every single-line field is the same height. */
export const InAForm: Story = {
  render: (args) => (
    <View style={styles.column}>
      <ControlledInputText {...args} placeholder="Document title" />
      <ControlledInputText {...args} placeholder="Owner" />
      <ControlledInputText {...args} placeholder="Description" multiline />
    </View>
  ),
}

const styles = StyleSheet.create({
  column: {
    width: 320,
    gap: Spacing.three,
  },
})
