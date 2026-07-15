import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { subscribeTick } from '../ticker'
import FlapDigit from './FlapDigit'

export interface FlapBoardDigit {
  stack: string[]
  stackKey: string
  value: number
}

interface FlapBoardProps {
  digits: FlapBoardDigit[]
  timing: number
  duration: number
  mode: 'num' | 'alpha'
  hinge: boolean
  digitWidth?: number
  animateOnMount?: boolean
}

interface Cursor {
  current: number
  previous: number
  target: number
  stackKey: string
  revision: number
  settleAt: number | null
}

const STRUCTURE_SEPARATOR = '\u0001'
const TARGET_SEPARATOR = '\u0002'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const createCursor = (digit: FlapBoardDigit, animate: boolean): Cursor => ({
  current: animate ? -1 : digit.value,
  previous: animate ? -1 : digit.value,
  target: digit.value,
  stackKey: digit.stackKey,
  revision: 0,
  settleAt: null,
})

// Character displays share one cursor array and one ticker subscription. A
// 400-digit board therefore performs at most one React state update per tick,
// while memoized FlapDigit children only render when their own cursor changes.
const FlapBoard: React.FC<FlapBoardProps> = ({
  digits,
  timing,
  duration,
  mode,
  hinge,
  digitWidth,
  animateOnMount = true,
}) => {
  const [cursors, setCursors] = useState<Cursor[]>(() =>
    digits.map((digit) => createCursor(digit, animateOnMount)),
  )
  const cursorRef = useRef(cursors)
  const digitsRef = useRef(digits)
  digitsRef.current = digits

  const structureKey = useMemo(
    () => digits.map((digit) => digit.stackKey).join(STRUCTURE_SEPARATOR),
    [digits],
  )
  const targetsKey = useMemo(
    () => digits.map((digit) => digit.value).join(TARGET_SEPARATOR),
    [digits],
  )

  // Reconcile added digits and physical stack changes before paint. Existing
  // cursors keep their position so a new target can continue an in-flight roll.
  useIsomorphicLayoutEffect(() => {
    const currentDigits = digitsRef.current
    const previous = cursorRef.current
    let changed = previous.length !== currentDigits.length
    const next = currentDigits.map((digit, index) => {
      const cursor = previous[index]
      if (!cursor) {
        changed = true
        return createCursor(digit, animateOnMount)
      }
      if (cursor.stackKey !== digit.stackKey) {
        changed = true
        return createCursor(digit, true)
      }
      return cursor
    })

    if (changed) {
      cursorRef.current = next
      setCursors(next)
    }
  }, [animateOnMount, digits.length, structureKey])

  useEffect(() => {
    const hasPendingDigit = digitsRef.current.some((digit, index) => {
      const cursor = cursorRef.current[index]
      return !cursor || cursor.stackKey !== digit.stackKey || cursor.current !== digit.value
    })
    if (!hasPendingDigit) return

    let unsubscribe = () => {}
    unsubscribe = subscribeTick(() => {
      const currentDigits = digitsRef.current
      const previous = cursorRef.current
      let changed = previous.length !== currentDigits.length
      let hasPendingAfterTick = false

      const next = currentDigits.map((digit, index) => {
        let cursor = previous[index]
        if (!cursor) {
          cursor = createCursor(digit, animateOnMount)
          changed = true
        } else if (cursor.stackKey !== digit.stackKey) {
          cursor = createCursor(digit, true)
          changed = true
        }

        if (cursor.current === digit.value) {
          if (cursor.target === digit.value) return cursor
          changed = true
          return { ...cursor, target: digit.value }
        }

        const newCurrent = cursor.current >= digit.stack.length - 1 ? 0 : cursor.current + 1
        if (newCurrent !== digit.value) hasPendingAfterTick = true
        changed = true
        return {
          current: newCurrent,
          previous: cursor.current,
          target: digit.value,
          stackKey: digit.stackKey,
          revision: cursor.revision + 1,
          settleAt: newCurrent === digit.value ? performance.now() + duration : null,
        }
      })

      if (changed) {
        cursorRef.current = next
        setCursors(next)
      }
      if (!hasPendingAfterTick) unsubscribe()
    }, timing)

    return unsubscribe
  }, [animateOnMount, duration, structureKey, targetsKey, timing])

  const settleKey = useMemo(
    () => cursors.map((cursor) => cursor.settleAt ?? '').join(TARGET_SEPARATOR),
    [cursors],
  )

  // Once the compositor animation has finished, promote the current face to
  // the static bottom layer. This prevents Safari from briefly revealing the
  // previous transition's stale underlay while preparing the next flip.
  useEffect(() => {
    const deadlines = cursors
      .map((cursor) => cursor.settleAt)
      .filter((deadline): deadline is number => deadline !== null)
    if (deadlines.length === 0) return

    const earliest = Math.min(...deadlines)
    const timer = setTimeout(() => {
      const previous = cursorRef.current
      let changed = false
      const next = previous.map((cursor) => {
        if (cursor.settleAt === null || cursor.settleAt > earliest + 1) return cursor
        changed = true
        return { ...cursor, previous: cursor.current, settleAt: null }
      })

      if (changed) {
        cursorRef.current = next
        setCursors(next)
      }
    }, Math.max(0, Math.ceil(earliest - performance.now()) + 1))

    return () => clearTimeout(timer)
  }, [cursors, settleKey])

  return (
    <>
      {digits.map((digit, index) => {
        const storedCursor = cursors[index]
        const cursor =
          storedCursor?.stackKey === digit.stackKey
            ? storedCursor
            : createCursor(digit, storedCursor ? true : animateOnMount)

        return (
          <FlapDigit
            key={index}
            value={digit.stack[cursor.current] || ''}
            prevValue={digit.stack[cursor.previous] || ''}
            final={cursor.current === digit.value}
            revision={cursor.revision}
            mode={mode}
            hinge={hinge}
            digitWidth={digitWidth}
          />
        )
      })}
    </>
  )
}

export default FlapBoard
