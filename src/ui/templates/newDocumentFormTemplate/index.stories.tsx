import { StyleSheet, View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Colors, Spacing } from '@constants/theme'
import { NewDocumentFormResponseTypes, type NewDocumentFormSubmitType, NewDocumentFormTemplate } from '@ui/templates/newDocumentFormTemplate'

const STORY_SHEET_HEIGHT = 560

const STORY_SHEET_WIDTH = 390

const STORY_SUBMIT_DELAY = 1200

const styles = StyleSheet.create({
  sheet: {
    width: STORY_SHEET_WIDTH,
    height: STORY_SHEET_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderColor: Colors.border.default,
  },
})

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const submitWithSuccess: NewDocumentFormSubmitType = async () => {
  await wait(STORY_SUBMIT_DELAY)

  return { type: NewDocumentFormResponseTypes.Success }
}

const submitWithError: NewDocumentFormSubmitType = async () => {
  await wait(STORY_SUBMIT_DELAY)

  return {
    type: NewDocumentFormResponseTypes.Error,
    message: 'The document could not be created. Try again.',
  }
}

const meta = {
  title: 'UI/Templates/NewDocumentFormTemplate',
  component: NewDocumentFormTemplate,

  decorators: [
    (Story) => (
      <View style={styles.sheet}>
        <Story />
      </View>
    ),
  ],

  parameters: {
    docs: {
      description: {
        component: [
          'The new-document form as it is painted inside the bottom sheet: a header',
          'with the sheet title and its close button, the fields, and the submit',
          'button pinned below them.',
          '',
          'The template owns the form. The three field values, what the submit button',
          'is allowed to do and whether a submission is in flight never leave it —',
          'a half-typed title is not something the screen or the view has any use',
          'for, and lifting it out would re-render the whole sheet on every',
          'keystroke.',
          '',
          'What it does not own is the outcome. `onSubmit` is handed the values and',
          'answers with a response model — success, or an error carrying its own',
          'message — and the template does exactly two things with it: on error it',
          'paints that message above the button and leaves the fields as typed, so',
          'nothing is lost on a retry; on success it clears them. The wording of a',
          'failure belongs to whoever made the call, so the template never writes it.',
          '',
          'Submitting locks the fields rather than swapping them for a spinner. The',
          'form stays readable while it is in flight, and the button label carries',
          'the progress on its own.',
          '',
          'Closing is the screen\'s business — the header button only reports the tap.',
          'It is a separate prop from submitting because dismissing a half-filled',
          'form is not a failed submission.',
        ].join('\n'),
      },
    },
  },

  argTypes: {
    onSubmit: {
      control: false,
      description: [
        'Called with the three values when the button is pressed. Answers with a',
        'response model; an error one carries the message the form then shows.',
      ].join(' '),
    },
    onClose: {
      control: false,
      description: 'Called by the close button in the header.',
    },
  },

  args: {
    onSubmit: submitWithSuccess,
    onClose: () => {},
  },
} satisfies Meta<typeof NewDocumentFormTemplate>

export default meta

type Story = StoryObj<typeof meta>

/** An empty form. The button stays disabled until all three fields are filled. */
export const Default: Story = {}

/** The call fails: its message lands above the button and the fields keep what was typed. */
export const SubmitError: Story = {
  args: {
    onSubmit: submitWithError,
  },
}
