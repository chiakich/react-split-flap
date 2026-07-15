import React, { forwardRef } from 'react'
import { FlapProps } from '../types'

const Flap = forwardRef<HTMLDivElement, FlapProps>(({ bottom, animated, final, phase = 0, idle, children }, ref) => {
  const classes = [
    'split-flap-part',
    bottom ? 'bottom' : 'top',
    animated ? 'animated' : '',
    final ? 'final' : '',
    idle ? 'idle' : '',
    animated && final ? `phase-${phase === 0 ? 'a' : 'b'}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes}>
      <span className="split-flap-char">{children}</span>
    </div>
  )
})

Flap.displayName = 'Flap'

export default Flap
