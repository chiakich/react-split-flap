# React Split Flap

[![NPM](https://img.shields.io/npm/v/react-split-flap.svg)](https://www.npmjs.com/package/react-split-flap)

A React component for train-station and airport-style split-flap displays. It supports character displays, whole-content flaps, custom themes, and high-density boards.

[Live Demo](https://chiakich.github.io/react-split-flap) · [GitHub](https://github.com/chiakich/react-split-flap)

![Character split-flap demo](https://files.catbox.moe/9hbue5.gif)

## Install

```bash
npm install react-split-flap
```

## Quick start

```tsx
import { Presets, SplitFlap } from 'react-split-flap'

export function StationSign() {
  return <SplitFlap value="HELLO" chars={Presets.ALPHANUM} theme="dark" />
}
```

The package includes its styles automatically. `SplitFlap` uses named exports; a default export is not provided.

## API

### `SplitFlap`

Flips a string one character at a time.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | required | Value to display |
| `chars` | `string[]` | `Presets.NUM` | Physical character order |
| `length` | `number` | `value.length` | Number of digits; values are padded or truncated to fit |
| `mode` | `'chars' \| 'words'` | `'chars'` | Per-character or whole-value flipping |
| `padChar` | `string` | `' '` | Padding character |
| `align` | `'auto' \| 'left' \| 'right'` | `'auto'` | Alignment within `length`; auto right-aligns numbers |
| `animateOnMount` | `boolean` | `true` | Roll from blank on mount |
| `digitWidth` | `number` | — | Digit width in pixels |
| `timing` | `number` | `60` | Interval between physical flap steps in milliseconds |
| `duration` | `number` | `300` | Duration of the final 3D flip in milliseconds |
| `hinge` | `boolean` | `true` | Show the center hinge |
| `theme` | `'default' \| 'light' \| 'dark'` | `'default'` | Color theme |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | `20`, `36`, `54`, or `84px` font size |
| `className` | `string` | `''` | Display class name |
| `style` | `React.CSSProperties` | — | Display styles |
| `background` | `string` | — | Custom flap background or gradient |
| `fontColor` | `string` | — | Custom text color |
| `render` | `(display: ReactNode) => ReactNode` | — | Wrap or replace the rendered display |

`padMode` remains available for compatibility but is deprecated. Use `align="left"` instead of `padMode="start"`, and `align="right"` instead of `padMode="end"`.

Characters missing from `chars` make one full rotation through the supplied set before landing on the missing character. Values are uppercased only when every entry in `chars` is uppercase.

### `LongFlap`

Flips a whole `ReactNode`, useful for icons, formatted rows, or rich status panels.

```tsx
import { LongFlap } from 'react-split-flap'

const flaps = [
  { id: 'ready', component: <strong>READY</strong> },
  { id: 'active', component: <strong>ACTIVE</strong> },
]

export function Status({ status }: { status: string }) {
  return <LongFlap flaps={flaps} displayId={status} digitWidth={240} digitHeight={64} />
}
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `flaps` | `Array<{ id: string \| number; component: ReactNode }>` | required | Available flap contents |
| `displayId` | `string \| number` | required | ID to display |
| `animateOnMount` | `boolean` | `true` | Roll from the first flap on mount |
| `digitWidth` | `number` | — | Flap width in pixels |
| `digitHeight` | `number` | `50` | Flap height in pixels |
| `timing` | `number` | `60` | Interval between flap steps in milliseconds |
| `duration` | `number` | `300` | Duration of the final 3D flip in milliseconds |
| `hinge` | `boolean` | `true` | Show the center hinge |
| `theme` | `'default' \| 'light' \| 'dark'` | `'default'` | Color theme |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | Size preset |
| `className` | `string` | `''` | Display class name |
| `style` | `React.CSSProperties` | — | Display styles |
| `background` | `string` | — | Custom flap background or gradient |
| `fontColor` | `string` | — | Custom text color |
| `render` | `(display: ReactNode) => ReactNode` | — | Wrap or replace the rendered display |

Flap identity follows the ordered `id` list, so inline `flaps` arrays keep their animation state as long as their IDs remain stable.

## Recipes

### Whole-value words mode

```tsx
<SplitFlap
  value={status}
  chars={['ON TIME', 'DELAYED', 'CANCELLED']}
  mode="words"
/>
```

### Multi-row boards

`SplitFlap` receives one flat string. Use CSS Grid to wrap its direct digit children into fixed-width rows:

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

export function Board({ rows }: { rows: string[] }) {
  return (
    <SplitFlap
      value={normalizeRows(rows).join('')}
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

Each row must contain exactly `WIDTH` characters after padding or truncation; otherwise later rows shift. Do not put `\n` in `value`—it is treated as a flap character, not a layout break.

Prefer one grid-backed `SplitFlap` over one component per row. One display shares one cursor array, ticker subscription, and state update per tick across the entire board.

### Custom appearance

```tsx
<SplitFlap
  value="CUSTOM"
  chars={Presets.ALPHANUM}
  background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
  fontColor="#fff"
  size="large"
/>
```

## Large-board performance

The default renderer automatically shares its animation clock, batches character cursors per display, memoizes stable displays and digits, avoids DOM remounts and per-face animation reads, and settles Safari's animated underlays after every flip.

For hundreds of small digits:

- Keep the entire grid in one `SplitFlap`.
- Define `chars`, `style`, and callbacks outside render or memoize them.
- Use `animateOnMount={false}` when the first frame should appear immediately.
- Add `className="performance-mode"` for dense, small cells. It preserves the two-stage 3D flip while removing sub-pixel shadows and highlights, enabling strict containment, and using a `160ms` duration unless `duration` is set explicitly.
- Pause the application timer with `IntersectionObserver` while a repeating board is offscreen. The component cannot know whether background progression is meaningful to your application.
- Update only as often as the content needs. Producing a new frame every `requestAnimationFrame` does not make a mechanical flap animation smoother.

```tsx
<SplitFlap
  value={frame}
  length={240}
  className="performance-mode"
  animateOnMount={false}
/>
```

DOM/CSS 3D performance still depends on cell size, update frequency, effects, browser, and device. Hundreds of simultaneous flips may not sustain 60fps on mobile Safari; use a canvas renderer when a hard 60fps target matters more than DOM output.

## Migrating from 0.1.x

- Use named exports: `import { SplitFlap } from 'react-split-flap'`.
- `Flap`, `FlapDigit`, and `FlapStack` are no longer public exports.
- `length` is optional and defaults to `value.length`.
- Use `mode="words"` for whole-value flaps. The legacy `length={1}` behavior remains as a fallback.
- Replace `padMode` with `align`.
- Lowercase character sets now remain lowercase.
- Displays expose their value to screen readers through `role="img"` and `aria-label`.

## Development

```bash
yarn install
yarn build
```

For local package development:

```bash
yarn global add yalc
yarn dev:publish
```

## License

MIT

## Contributing

Issues and pull requests are welcome.
