import React, { useState, useEffect, useRef } from 'react'
import { FlapStackProps } from '../types'
import FlapDigit from './FlapDigit'
import { subscribeTick } from '../ticker'

const FlapStack: React.FC<FlapStackProps> = ({
  stack,
  stackKey,
  value,
  timing,
  mode,
  hinge,
  digitWidth,
  animateOnMount = true,
}) => {
  const stackLength = stack.length

  const [cursor, setCursor] = useState(() => {
    if (animateOnMount) {
      return { current: -1, previous: -1, target: 0 }
    }
    const target = Math.max(0, Math.min(value, stackLength - 1))
    return { current: target, previous: target, target }
  })

  // Reset cursor when the flap set changes (identity via stackKey, not array reference)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setCursor({ current: -1, previous: -1, target: 0 })
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
        }
      })
    }, timing)

    return unsubscribe
  }, [stackKey, stackLength, value, timing])

  const { current, previous, target } = cursor

  return (
    <FlapDigit
      value={stack[current] || ''}
      prevValue={stack[previous] || ''}
      final={current === target}
      mode={mode}
      hinge={hinge}
      digitWidth={digitWidth}
    />
  )
}

export default FlapStack
