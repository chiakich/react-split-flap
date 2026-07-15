import React from 'react'
import { FlapDigitProps } from '../types'
import Flap from './Flap'

const FlapDigit: React.FC<FlapDigitProps> = ({ value, prevValue, final, revision, mode, hinge, digitWidth }) => {
  const digitStyle = digitWidth ? { width: `${digitWidth}px` } : {}
  const hasTransition = revision > 0 && value !== prevValue
  const shouldAnimate = final && hasTransition
  const phase = (revision % 2) as 0 | 1

  return (
    <div className="split-flap-digit" data-kind="digit" data-mode={mode} style={digitStyle}>
      {/* Static top half showing current value */}
      <Flap>{value}</Flap>

      {/* Static bottom half showing previous value */}
      <Flap bottom>
        {prevValue}
      </Flap>

      {/* Animated top half flipping from previous to current */}
      <Flap animated final={shouldAnimate} phase={phase} idle={!hasTransition}>
        {prevValue}
      </Flap>

      {/* Animated bottom half appearing after top half flips (hidden via CSS until final) */}
      <Flap bottom animated final={shouldAnimate} phase={phase} idle={!hasTransition}>
        {value}
      </Flap>

      {/* All four flap faces meet at the same hinge, so one overlay is enough. */}
      {hinge && <div className="split-flap-hinge" data-kind="hinge" />}
    </div>
  )
}

export default React.memo(FlapDigit)
