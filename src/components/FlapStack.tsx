import React, { useState, useEffect, useRef } from 'react'
import { FlapStackProps } from '../types'
import FlapDigit from './FlapDigit'
import { subscribeTick } from '../ticker'

const FlapStack: React.FC<FlapStackProps> = ({
  stack,
  stackKey,
  value,
  timing,
  duration,
  mode,
  hinge,
  digitWidth,
  animateOnMount = true,
}) => {
  const stackLength = stack.length

  const [cursor, setCursor] = useState(() => {
    if (animateOnMount) {
      return { current: -1, previous: -1, target: 0, revision: 0 }
    }
    const target = Math.max(0, Math.min(value, stackLength - 1))
    return { current: target, previous: target, target, revision: 0 }
  })

  // Reset cursor when the flap set changes (identity via stackKey, not array reference)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setCursor({ current: -1, previous: -1, target: 0, revision: 0 })
  }, [stackKey])

  // Animation sequence when value changes
  useEffect(() => {
    const target = Math.max(0, Math.min(value, stackLength - 1))

    const unsubscribe = subscribeTick(() => {
      setCursor((prevCursor) => {
        if (prevCursor.current === target) {
          unsubscribe()
          return prevCursor.target === target ? prevCursor : { ...prevCursor, target }
        }

        const newCurrent = prevCursor.current >= stackLength - 1 ? 0 : prevCursor.current + 1

        if (newCurrent === target) {
          unsubscribe()
        }
        return {
          current: newCurrent,
          previous: prevCursor.current,
          target,
          revision: prevCursor.revision + 1,
        }
      })
    }, timing)

    return unsubscribe
  }, [stackKey, stackLength, value, timing])

  useEffect(() => {
    if (cursor.current !== cursor.target || cursor.previous === cursor.current) return
    const revision = cursor.revision
    const timer = setTimeout(() => {
      setCursor((current) =>
        current.revision === revision && current.current === current.target
          ? { ...current, previous: current.current }
          : current,
      )
    }, duration)
    return () => clearTimeout(timer)
  }, [cursor.current, cursor.previous, cursor.revision, cursor.target, duration])

  const { current, previous, target, revision } = cursor

  return (
    <FlapDigit
      value={stack[current] || ''}
      prevValue={stack[previous] || ''}
      final={current === target}
      revision={revision}
      mode={mode}
      hinge={hinge}
      digitWidth={digitWidth}
    />
  )
}

// Parent displays often update one row or digit at a time. stackKey is the
// declared identity of the physical flap set, so comparing it avoids walking
// every unchanged digit while still allowing local cursor state to animate.
export default React.memo(
  FlapStack,
  (previous, next) =>
    previous.stackKey === next.stackKey &&
    // Words mode may contain React nodes whose content changes while ids stay stable.
    (previous.mode !== 'words' || previous.stack === next.stack) &&
    previous.value === next.value &&
    previous.timing === next.timing &&
    previous.duration === next.duration &&
    previous.mode === next.mode &&
    previous.hinge === next.hinge &&
    previous.digitWidth === next.digitWidth &&
    previous.animateOnMount === next.animateOnMount,
)
