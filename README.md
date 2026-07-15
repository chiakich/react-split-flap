# React Split Flap

![Jun-11-2025 16-06-39](https://files.catbox.moe/9hbue5.gif)  
![Jun-11-2025 16-08-48](https://files.catbox.moe/1cw1ic.gif)

[![NPM](https://img.shields.io/npm/v/react-split-flap.svg)](https://www.npmjs.com/package/react-split-flap)

A React component that simulates the classic split-flap display effect, inspired by train stations and airport displays.

[Live Demo](https://chiakich.github.io/react-split-flap)<br>
[GitHub Repository](https://github.com/chiakich/react-split-flap)

## Features

- **Realistic Flip Animation** - Simulates authentic mechanical flipping effects
- **Built for Scale** - Hundreds of digits flip smoothly on a single shared animation clock (see [Performance](#performance))
- **Multiple Themes** - Built-in light and dark themes
- **Various Sizes** - From small to extra-large size options
- **Highly Customizable** - Support for custom character sets, animation speed, etc.
- **TypeScript Support** - Complete type definitions
- **LongFlap Component** - Support for complex ReactNode content with ID-based switching

## Installation

```bash
npm install react-split-flap
# or
yarn add react-split-flap
```

## Quick Start

```tsx
import React from 'react'
import { SplitFlap, Presets } from 'react-split-flap'

function App() {
  return <SplitFlap value="HELLO" chars={Presets.ALPHANUM} />
}
```

## Components

### SplitFlap - Character Display

Perfect for displaying strings with character-by-character flipping animation.

#### Multi-row boards

`SplitFlap` keeps its value as one flat string. To build a multi-row board, render the display as a CSS Grid and set a fixed number of columns. The grid wraps the direct digit children into rows while the component still uses one cursor array, one ticker subscription, and at most one state update per tick for the whole board.

```tsx
import type { CSSProperties } from 'react'
import { Presets, SplitFlap } from 'react-split-flap'

const WIDTH = 20
const HEIGHT = 12

const BOARD_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${WIDTH}, 1.7ch)`,
  columnGap: '1px',
  rowGap: '3px',
}

const normalizeRows = (rows: string[]) =>
  Array.from({ length: HEIGHT }, (_, index) =>
    (rows[index] ?? '').padEnd(WIDTH, ' ').slice(0, WIDTH),
  )

function Board({ rows }: { rows: string[] }) {
  const frame = normalizeRows(rows).join('')

  return (
    <SplitFlap
      value={frame}
      chars={Presets.ALPHANUM}
      length={WIDTH * HEIGHT}
      align="left"
      style={BOARD_STYLE}
      className="performance-mode"
      animateOnMount={false}
    />
  )
}
```

Every row must be padded or truncated to exactly `WIDTH` characters. Otherwise, a short row shifts every row after it. Do not include `\n` in `value`: it is treated as another flap character, not as a layout break.

For large boards, prefer one grid-backed `SplitFlap` over one component per row. Splitting a 12-row board into 12 components creates 12 cursor states and ticker subscriptions instead of one.

#### Props

| Property         | Type                                         | Default        | Description                                                                          |
| ---------------- | -------------------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `value`          | `string`                                     | -              | Value to display                                                                     |
| `chars`          | `string[]`                                   | `Presets.NUM`  | Available character set                                                              |
| `length`         | `number`                                     | `value.length` | Number of digits to display; longer values are truncated, shorter values padded      |
| `mode`           | `'chars' \| 'words'`                         | `'chars'`      | `'chars'` flips per character; `'words'` shows the whole value on a single flap      |
| `padChar`        | `string`                                     | `' '`          | Padding character                                                                    |
| `align`          | `'auto' \| 'left' \| 'right'`                | `'auto'`       | Where the value sits when shorter than `length`; `'auto'` right-aligns numbers       |
| `animateOnMount` | `boolean`                                    | `true`         | Roll from blank to the initial value on mount; `false` shows it immediately          |
| `digitWidth`     | `number`                                     | -              | Custom width for each digit (pixels)                                                 |
| `timing`         | `number`                                     | `60`           | Interval between flips (milliseconds)                                                |
| `duration`       | `number`                                     | `300`          | Duration of the final flap animation (milliseconds)                                  |
| `hinge`          | `boolean`                                    | `true`         | Whether to show hinge line                                                           |
| `theme`          | `'default' \| 'light' \| 'dark'`             | `'default'`    | Theme variant                                                                        |
| `size`           | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'`     | Size variant                                                                         |
| `className`      | `string`                                     | `''`           | CSS class name                                                                       |
| `style`          | `React.CSSProperties`                        | -              | Inline styles                                                                        |
| `background`     | `string`                                     | -              | Custom background color or gradient for the flaps                                    |
| `fontColor`      | `string`                                     | -              | Custom font color for the flap text                                                  |
| `render`         | `(children: ReactNode) => ReactNode`         | -              | Custom render function                                                               |

> `padMode` (`'auto' | 'start' | 'end'`) is still accepted for backwards compatibility but deprecated — use `align` instead (`'start'` → `'left'`, `'end'` → `'right'`).

Notes:

- The value is uppercased only when every entry in `chars` is uppercase, so lowercase character sets work as expected.
- Characters missing from `chars` do a full rotation through the set before landing on the fallback character.

### LongFlap - Complex Content Display

Perfect for displaying complex ReactNode components with ID-based switching, ideal for icons, styled content, and rich components.

#### Props

| Property         | Type                                                  | Default     | Description                                                     |
| ---------------- | ----------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `flaps`          | `Array<{id: string \| number, component: ReactNode}>` | -           | Array of flap items with ID and component                       |
| `displayId`      | `string \| number`                                    | -           | Current display ID to show                                      |
| `animateOnMount` | `boolean`                                             | `true`      | Roll from blank to the initial flap on mount                    |
| `digitWidth`     | `number`                                              | -           | Custom width for the flap (pixels)                              |
| `digitHeight`    | `number`                                              | `50`        | Custom height for the flap (pixels)                             |
| `timing`         | `number`                                              | `60`        | Interval between flips (milliseconds)                           |
| `duration`       | `number`                                              | `300`       | Duration of the final flap animation (milliseconds)             |
| `hinge`          | `boolean`                                             | `true`      | Whether to show hinge line                                      |
| `theme`          | `'default' \| 'light' \| 'dark'`                      | `'default'` | Theme variant                                                   |
| `size`           | `'small' \| 'medium' \| 'large' \| 'xlarge'`          | `'medium'`  | Size variant                                                    |
| `className`      | `string`                                              | `''`        | CSS class name                                                  |
| `style`          | `React.CSSProperties`                                 | -           | Inline styles                                                   |
| `background`     | `string`                                              | -           | Custom background color or gradient for the flaps               |
| `fontColor`      | `string`                                              | -           | Custom font color for the flap text                             |
| `render`         | `(children: ReactNode) => ReactNode`                  | -           | Custom render function                                          |

The flap set identity follows the `id` list, so defining `flaps` inline in JSX is safe — the animation state is preserved across re-renders as long as the ids stay the same.

#### When to use LongFlap vs SplitFlap

- **Use SplitFlap** when displaying strings or simple text with character-by-character flipping
- **Use LongFlap** when you need:
  - Complex ReactNode components (icons + text, styled content, etc.)
  - ID-based switching between predefined states
  - Single flap displaying rich content
  - Custom rendering of complex elements

## Performance

The 0.2 release line is built so that large boards (hundreds of digits flipping at once) stay smooth. Profiling showed the old bottlenecks were not JavaScript compute but browser rendering work, so the fixes target that:

- **One shared animation clock.** All digits subscribe to a single `requestAnimationFrame` loop instead of one `setInterval` per digit. Every flip due in the same frame is applied in one batched React commit, so a 400-digit board causes one render pass per frame instead of 400 scattered ones. When the tab is hidden, the clock falls back to a coarse timer so displays still reach their target value in the background.
- **One cursor update per display.** Character-mode digits share a cursor array and one ticker subscription. A 400-digit `SplitFlap` performs at most one React state update per tick instead of one update per digit; memoized digit children then render only when their own cursor changes.
- **Memoized display boundaries.** Unchanged displays and digits skip parent-driven renders. This matters for boards that cascade one row at a time: updating one row no longer walks every stable digit in the other rows.
- **No DOM remounting or per-digit animation reads.** Flap elements stay mounted across flips and alternate between two equivalent CSS animation names. This restarts at the first frame in the same style update without recreating nodes or calling `getAnimations()` for every face.
- **Settled static underlays.** After a flip finishes, each display batches its completed digits into their static state and hides the animated faces. Safari can therefore prepare the next compositor animation without exposing the stale underlay from the previous flip.
- **One hinge per digit.** The four flap faces share a single hinge overlay instead of rendering four identical hinge nodes, reducing the DOM by three elements per digit without changing the visual result.
- **Minimal compositor work.** Only the two actively animating flap halves of each digit get promoted to GPU layers, instead of every flap half unconditionally. Each face is a true half-height surface rather than a full-height surface masked by `clip-path`, cutting its raster area in half and avoiding hundreds of animated masks. In a ~400-digit trace, selective promotion alone cut compositing layers by ~70% and GPU process time by ~27%.

The animations themselves remain pure CSS transforms, so flips run on the compositor and respect `prefers-reduced-motion`.

For large boards, keep array and object props stable so the memoized boundaries can do their job: define `chars`/`flaps` outside render or wrap them in `useMemo`, and avoid recreating `style` or `render` callbacks on every parent render. Set `animateOnMount={false}` when a large board should appear immediately. If an application runs a repeating showcase, pause the value-producing timer with `IntersectionObserver` while the board is offscreen; the component cannot infer whether background progression is meaningful to the application.

For dense, small-cell displays, add `className="performance-mode"`. It keeps the full two-stage 3D flip but removes per-cell highlight and shadow paints, uses strict containment, and shortens the flip to reduce overlapping compositor layers. This is intended for boards where those sub-pixel decorations are not visible:

```tsx
<SplitFlap value={frame} length={240} className="performance-mode" animateOnMount={false} />
```

## Built-in Themes & Sizes

### Sizes

- `small` - 20px
- `medium` - 36px (default)
- `large` - 54px
- `xlarge` - 84px

### Themes

- `default` - Default styling
- `light` - Light theme
- `dark` - Dark theme

## Usage Examples

### SplitFlap Examples

#### Basic Counter

```tsx
import React, { useState } from 'react'
import { SplitFlap, Presets } from 'react-split-flap'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <SplitFlap value={count.toString()} chars={Presets.NUM} length={3} align="right" theme="light" />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

#### Text Display

```tsx
import React, { useState, useEffect } from 'react'
import { SplitFlap, Presets } from 'react-split-flap'

function TextCarousel() {
  const words = ['HELLO', 'WORLD', 'REACT']
  const [currentWord, setCurrentWord] = useState(words[0])

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % words.length
      setCurrentWord(words[index])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return <SplitFlap value={currentWord} chars={Presets.ALPHANUM} length={5} size="large" theme="dark" timing={20} />
}
```

#### Words Mode

```tsx
import { SplitFlap } from 'react-split-flap'

// The whole value flips as a single flap
function StatusBoard({ status }: { status: string }) {
  return <SplitFlap value={status} chars={['ON TIME', 'DELAYED', 'CANCELLED']} mode="words" />
}
```

#### Dashboard (no mount animation)

```tsx
import { SplitFlap, Presets } from 'react-split-flap'

// Shows the initial value immediately; only subsequent changes flip
function Metric({ count }: { count: number }) {
  return <SplitFlap value={String(count)} chars={Presets.NUM} length={4} align="right" animateOnMount={false} />
}
```

#### Custom Styling

```tsx
import React from 'react'
import { SplitFlap, Presets } from 'react-split-flap'

function CustomStyledFlap() {
  return (
    <SplitFlap
      value="CUSTOM"
      chars={Presets.ALPHANUM}
      size="large"
      background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
      fontColor="#ffffff"
      timing={50}
    />
  )
}
```

### LongFlap Examples

#### Weather Display

```tsx
import React, { useState } from 'react'
import { LongFlap } from 'react-split-flap'

const weatherFlaps = [
  {
    id: 'sunny',
    component: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>☀️</span>
        <span>Sunny</span>
      </div>
    ),
  },
  {
    id: 'rainy',
    component: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🌧️</span>
        <span>Rainy</span>
      </div>
    ),
  },
]

function WeatherDisplay() {
  const [currentWeather, setCurrentWeather] = useState('sunny')

  return <LongFlap flaps={weatherFlaps} displayId={currentWeather} digitWidth={200} size="large" theme="dark" />
}
```

#### Custom Styled LongFlap

```tsx
import React, { useState } from 'react'
import { LongFlap } from 'react-split-flap'

const styledFlaps = [
  {
    id: 'status1',
    component: <div style={{ fontSize: '24px', fontWeight: 'bold' }}>🚀 READY</div>,
  },
  {
    id: 'status2',
    component: <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⚡ ACTIVE</div>,
  },
]

function CustomStyledLongFlap() {
  const [status, setStatus] = useState('status1')

  return (
    <LongFlap
      flaps={styledFlaps}
      displayId={status}
      digitWidth={250}
      digitHeight={80}
      background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      fontColor="#ffffff"
      timing={100}
      size="xlarge"
    />
  )
}
```

## Migrating from 0.1.x

- **Named exports only.** `import SplitFlap from 'react-split-flap'` no longer works — use `import { SplitFlap } from 'react-split-flap'`.
- **Internal components are no longer exported.** `Flap`, `FlapDigit`, and `FlapStack` were implementation details and have been removed from the public API.
- **`length` is now optional** and defaults to `value.length`.
- **Words mode is explicit.** Use `mode="words"` instead of `length={1}` (the old `length={1}` behavior is kept as a fallback for now). Words mode no longer truncates the value.
- **`padMode` is deprecated** in favor of `align`: `padMode="start"` → `align="left"`, `padMode="end"` → `align="right"`.
- **Lowercase character sets now match.** The value is only uppercased when the whole char set is uppercase; previously it was always uppercased.
- **Screen readers now announce the value** (`role="img"` + `aria-label`); previously the component was fully `aria-hidden`.

## Development

### Local Development

```bash
# Clone the project
git clone <repository-url>
cd react-split-flap

# Install dependencies
yarn install

# Build the package
yarn global add yalc
yarn dev:publish #use yalc to public local

# Start demo
cd demo
yarn install
yarn dev:hot #force vite use fresh package
```

### Build

```bash
yarn build
```

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!
