import { unstable_batchedUpdates } from 'react-dom'

interface Subscriber {
  callback: () => void
  interval: number
  next: number
}

// Shared rAF-driven clock so all digits tick in the same frame,
// letting React batch every flip into a single commit
const subscribers = new Set<Subscriber>()
let rafId: number | null = null
let timerId: ReturnType<typeof setTimeout> | null = null

// rAF stops in hidden tabs; fall back to a coarse timer so displays
// still reach their target value while backgrounded
const HIDDEN_TICK = 250

const schedule = () => {
  if (subscribers.size === 0 || rafId !== null || timerId !== null) return

  if (typeof document !== 'undefined' && document.hidden) {
    timerId = setTimeout(() => {
      timerId = null
      loop(performance.now())
    }, HIDDEN_TICK)
  } else {
    rafId = requestAnimationFrame(loop)
  }
}

const loop = (now: number) => {
  rafId = null

  unstable_batchedUpdates(() => {
    subscribers.forEach((sub) => {
      if (now >= sub.next) {
        sub.next = now + sub.interval
        sub.callback()
      }
    })
  })

  schedule()
}

export const subscribeTick = (callback: () => void, interval: number): (() => void) => {
  const sub: Subscriber = { callback, interval, next: performance.now() + interval }
  subscribers.add(sub)
  schedule()

  return () => {
    subscribers.delete(sub)
    if (subscribers.size === 0) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      if (timerId !== null) {
        clearTimeout(timerId)
        timerId = null
      }
    }
  }
}
