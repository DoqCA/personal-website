# Personal Site

Single-page portfolio with a dark, minimal design over a raw WebGL "polygon ocean" background.

## Stack

- **Next.js 16** (App Router, Turbopack) on **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4**, CSS-first config in `src/app/globals.css` (no `tailwind.config.js`)
- **Raw WebGL** for the background, with no three.js or animation library
- **lucide-react** / **react-icons** for icons, **Inter** via `next/font`
- **pnpm**, Node **24.x**, deployed on **Vercel**

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm check      # lint + typecheck + build; run before pushing
```

## Layout

```
src/
  app/                    layout, page, globals.css, fonts
  components/background/  WebGL ocean (all tunables in config.ts)
  components/sections/    page sections (Hero, About, Projects, ...)
  components/ui/          shared primitives (Section, Reveal, Collapse)
  data/site.ts            all site copy and links
  lib/contact.ts          contact form handler (stubbed as of now)
```

To change content, edit `src/data/site.ts`. You shouldn't need to touch the components.

## Considerations

- **Performance first.** Components are Server Components by default, and only interactive pieces use `"use client"`. CSS is inlined (`experimental.inlineCss`) to remove a render-blocking request. Scroll reveals use `IntersectionObserver` and CSS instead of a motion library.
- **Background is adaptive.** Grid density, particle count, and MSAA scale down on narrow or low-power devices. Setup waits for idle time. Rendering pauses when the tab is hidden, recovers from WebGL context loss, and draws a single static frame under `prefers-reduced-motion`.
- **Color sync.** `config.ts` → `colors.base` must match `--color-ocean` in `globals.css`.
- **Minimal dependencies.** Prefer native CSS and browser APIs before adding packages.
