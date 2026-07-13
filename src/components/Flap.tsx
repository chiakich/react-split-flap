import React, { forwardRef } from 'react'
import { FlapProps } from '../types'

const Flap = forwardRef<HTMLDivElement, FlapProps>(({ bottom, animated, final, hinge, children }, ref) => {
  const classes = ['split-flap-part', bottom ? 'bottom' : 'top', animated ? 'animated' : '', final ? 'final' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes}>
      <span className="split-flap-char">{children}</span>
      {hinge && <div className="split-flap-hinge" data-kind="hinge" />}
    </div>
  )
})

Flap.displayName = 'Flap'

export default Flap
