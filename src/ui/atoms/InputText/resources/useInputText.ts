import { useState } from 'react'

export const useInputText = () => {
  const [isFocused, setIsFocused] = useState(false)

  return {
    isFocused,
    handleFocus: () => setIsFocused(true),
    handleBlur: () => setIsFocused(false),
  }
}
