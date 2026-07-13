import React, { Fragment, useMemo } from 'react'
import { LongFlapProps } from './types'
import { FlapStack } from './components'

const LongFlap: React.FC<LongFlapProps> = ({
  flaps,
  displayId,
  animateOnMount = true,
  digitWidth,
  digitHeight = 50,
  timing = 60,
  hinge = true,
  theme = 'default',
  size = 'medium',
  className = '',
  style,
  background,
  fontColor,
  render,
}) => {
  const flapStack = useMemo(() => flaps.map((f) => <Fragment key={f.id}>{f.component}</Fragment>), [flaps])

  // Cursor identity follows the id list, so inline-defined flaps arrays are safe
  const stackKey = useMemo(() => flaps.map((f) => String(f.id)).join('\u0000'), [flaps])

  const currentIndex = useMemo(() => {
    const flapIndex = flaps.findIndex((f) => f.id === displayId)
    return flapIndex !== -1 ? flapIndex : 0
  }, [flaps, displayId])

  const displayClasses = ['split-flap-display', theme !== 'default' ? theme : '', size, 'long-flap-mode', className]
    .filter(Boolean)
    .join(' ')

  const longFlapStyle = {
    ...style,
    '--digit-width': digitWidth ? `${digitWidth}px` : 'auto',
    '--digit-height': digitHeight ? `${digitHeight}px` : 'auto',
    ...(background && { '--flap-background': background }),
    ...(fontColor && { '--flap-font-color': fontColor }),
  } as React.CSSProperties & {
    '--digit-width': string
    '--digit-height': string
    '--flap-background'?: string
    '--flap-font-color'?: string
  }

  const content = (
    <div className={displayClasses} style={longFlapStyle} aria-hidden="true">
      <FlapStack
        stack={flapStack}
        stackKey={stackKey}
        value={currentIndex}
        timing={timing}
        mode="words"
        hinge={hinge}
        digitWidth={digitWidth}
        animateOnMount={animateOnMount}
      />
    </div>
  )

  return render ? render(content) : content
}

export default LongFlap
