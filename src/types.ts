import React from 'react'

export interface SplitFlapProps {
  /** The value to display */
  value: string
  /** Characters available for display */
  chars?: string[]
  /** Number of digits to display (defaults to value.length); ignored in words mode */
  length?: number
  /** 'chars' flips per character; 'words' shows the whole value on a single flap */
  mode?: 'chars' | 'words'
  /** Character used for padding */
  padChar?: string
  /** Where the value sits when shorter than length; 'auto' right-aligns numbers, left-aligns text */
  align?: 'auto' | 'left' | 'right'
  /** @deprecated Use `align` instead ('start' → 'left', 'end' → 'right') */
  padMode?: 'auto' | 'start' | 'end'
  /** Roll from blank to the initial value on mount (default true) */
  animateOnMount?: boolean
  /** Custom width for each digit (in pixels) */
  digitWidth?: number
  /** Interval between flips in milliseconds */
  timing?: number
  /** Duration of the final flap animation in milliseconds */
  duration?: number
  /** Show hinge line */
  hinge?: boolean
  /** Theme variant */
  theme?: 'default' | 'light' | 'dark'
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  /** CSS class name */
  className?: string
  /** CSS styles */
  style?: React.CSSProperties
  /** Custom background color or gradient for the flaps */
  background?: string
  /** Custom font color for the flap text */
  fontColor?: string
  /** Custom render function */
  render?: (children: React.ReactNode) => React.ReactNode
}

export interface LongFlapProps {
  /** Array of flap items with id and component */
  flaps: Array<{
    id: string | number
    component: React.ReactNode
  }>
  /** Current display ID to show */
  displayId: string | number
  /** Roll from blank to the initial flap on mount (default true) */
  animateOnMount?: boolean
  /** Custom width for the flap (in pixels) */
  digitWidth?: number
  /** Custom height for the flap (in pixels) */
  digitHeight?: number
  /** Interval between flips in milliseconds */
  timing?: number
  /** Duration of the final flap animation in milliseconds */
  duration?: number
  /** Show hinge line */
  hinge?: boolean
  /** Theme variant */
  theme?: 'default' | 'light' | 'dark'
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  /** CSS class name */
  className?: string
  /** CSS styles */
  style?: React.CSSProperties
  /** Custom background color or gradient for the flaps */
  background?: string
  /** Custom font color for the flap text */
  fontColor?: string
  /** Custom render function */
  render?: (children: React.ReactNode) => React.ReactNode
}

export interface FlapProps {
  children: React.ReactNode
  bottom?: boolean
  animated?: boolean
  final?: boolean
  phase?: 0 | 1
  idle?: boolean
}

export interface FlapDigitProps {
  value: React.ReactNode
  prevValue: React.ReactNode
  final: boolean
  revision: number
  mode: 'num' | 'alpha' | 'custom' | 'words'
  hinge: boolean
  digitWidth?: number
}

export interface FlapStackProps {
  stack: (string | React.ReactNode)[]
  /** Stable identity of the stack contents; a change resets the cursor */
  stackKey: string
  value: number
  timing: number
  duration: number
  mode: 'num' | 'alpha' | 'custom' | 'words'
  hinge: boolean
  digitWidth?: number
  animateOnMount?: boolean
}
