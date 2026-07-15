import React, { useMemo } from 'react'
import { SplitFlapProps } from './types'
import { FlapBoard, FlapBoardDigit, FlapStack } from './components'
import { Presets } from './presets'

// Joiner unlikely to appear in user-provided chars
const KEY_SEPARATOR = '\u0000'

const SplitFlap: React.FC<SplitFlapProps> = ({
  value,
  chars = Presets.NUM,
  length,
  mode,
  padChar = ' ',
  align,
  padMode,
  animateOnMount = true,
  digitWidth,
  timing = 60,
  duration,
  hinge = true,
  theme = 'default',
  size = 'medium',
  className = '',
  style,
  background,
  fontColor,
  render,
}) => {
  const effectiveDuration = duration ?? (className.split(/\s+/).includes('performance-mode') ? 160 : 300)
  // Legacy: length === 1 used to mean words mode
  const wordsMode = mode === 'words' || (mode === undefined && length === 1)
  const displayLength = length ?? value.length

  const charsKey = useMemo(() => chars.join(KEY_SEPARATOR), [chars])

  // Only uppercase the value when the char set itself is uppercase,
  // so lowercase char sets stay matchable
  const uppercase = useMemo(() => chars.every((char) => char === char.toUpperCase()), [chars])

  const digitMode = useMemo(() => (chars.every((char) => /^[\s0-9]$/.test(char)) ? 'num' : 'alpha'), [chars])

  const displayValue = useMemo(() => {
    let processedValue = uppercase ? value.toUpperCase() : value

    if (wordsMode) return processedValue

    if (processedValue.length < displayLength) {
      const padding = padChar.repeat(displayLength - processedValue.length)
      const effectiveAlign = align ?? (padMode === 'start' ? 'left' : padMode === 'end' ? 'right' : 'auto')
      const padStart = effectiveAlign === 'right' || (effectiveAlign === 'auto' && /^[0-9.,+-]*$/.test(processedValue))

      processedValue = padStart ? padding + processedValue : processedValue + padding
    } else if (processedValue.length > displayLength) {
      processedValue = processedValue.substring(0, displayLength)
    }

    return processedValue
  }, [value, uppercase, wordsMode, displayLength, padChar, align, padMode])

  // Chars missing from the set get an extended stack: a full rotation
  // through all chars before landing on the fallback
  const findCharInStack = (char: string): { index: number; stack: string[]; key: string } => {
    const index = chars.indexOf(char)

    if (index !== -1) {
      return { index, stack: chars, key: charsKey }
    }

    const extendedStack = [...chars, char]
    return { index: extendedStack.length - 1, stack: extendedStack, key: charsKey + KEY_SEPARATOR + char }
  }

  const digits = useMemo<FlapBoardDigit[]>(() => {
    if (wordsMode) return []

    const result: FlapBoardDigit[] = []
    for (let i = 0; i < displayLength; i++) {
      const char = displayValue[i] || padChar
      const { index, stack, key } = findCharInStack(char)

      result.push({ stack, stackKey: key, value: index })
    }
    return result
  }, [chars, charsKey, displayLength, displayValue, padChar, wordsMode])

  const renderDigits = () => {
    if (wordsMode) {
      const { index, stack, key } = findCharInStack(displayValue)
      return (
        <FlapStack
          key={0}
          stack={stack}
          stackKey={key}
          value={index}
          mode="words"
          timing={timing}
          duration={effectiveDuration}
          hinge={hinge}
          digitWidth={digitWidth}
          animateOnMount={animateOnMount}
        />
      )
    }

    return (
      <FlapBoard
        digits={digits}
        timing={timing}
        duration={effectiveDuration}
        mode={digitMode}
        hinge={hinge}
        digitWidth={digitWidth}
        animateOnMount={animateOnMount}
      />
    )
  }

  const displayClasses = [
    'split-flap-display',
    theme !== 'default' ? theme : '',
    size,
    wordsMode ? 'words-mode' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const combinedStyle = {
    ...style,
    '--flap-animation-duration': `${effectiveDuration}ms`,
    ...(background && { '--flap-background': background }),
    ...(fontColor && { '--flap-font-color': fontColor }),
  } as React.CSSProperties & {
    '--flap-animation-duration': string
    '--flap-background'?: string
    '--flap-font-color'?: string
  }

  // role="img" exposes the label while keeping the flap internals out of the a11y tree
  const content = (
    <div className={displayClasses} style={combinedStyle} role="img" aria-label={value}>
      {renderDigits()}
    </div>
  )

  return render ? render(content) : content
}

export default React.memo(SplitFlap)
