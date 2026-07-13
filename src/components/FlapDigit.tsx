import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { FlapDigitProps } from '../types'
import Flap from './Flap'

// Avoid the useLayoutEffect warning under SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const restartAnimations = (el: HTMLDivElement | null) => {
  if (!el) return

  if (typeof el.getAnimations === 'function') {
    el.getAnimations().forEach((animation) => {
      animation.currentTime = 0
      animation.play()
    })
  } else {
    // Fallback for browsers without Web Animations API: force reflow
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = ''
  }
}

const FlapDigit: React.FC<FlapDigitProps> = ({ value, prevValue, final, mode, hinge, digitWidth }) => {
  const digitStyle = digitWidth ? { width: `${digitWidth}px` } : {}
  const animatedTopRef = useRef<HTMLDivElement>(null)
  const animatedBottomRef = useRef<HTMLDivElement>(null)

  // Flaps stay mounted across flips, so the final flip animation must be
  // restarted manually when content changes while `final` remains true
  useIsomorphicLayoutEffect(() => {
    if (!final) return
    restartAnimations(animatedTopRef.current)
    restartAnimations(animatedBottomRef.current)
  }, [value, prevValue, final])

  return (
    <div className="split-flap-digit" data-kind="digit" data-mode={mode} style={digitStyle}>
      {/* Static top half showing current value */}
      <Flap hinge={hinge}>{value}</Flap>

      {/* Static bottom half showing previous value */}
      <Flap bottom hinge={hinge}>
        {prevValue}
      </Flap>

      {/* Animated top half flipping from previous to current */}
      <Flap ref={animatedTopRef} animated final={final} hinge={hinge}>
        {prevValue}
      </Flap>

      {/* Animated bottom half appearing after top half flips (hidden via CSS until final) */}
      <Flap ref={animatedBottomRef} bottom animated final={final} hinge={hinge}>
        {value}
      </Flap>
    </div>
  )
}

export default FlapDigit
