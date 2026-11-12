# Lucide Animated icons

`animated-icons.tsx` adapts the refresh-cw and copy icons from
[Lucide Animated](https://lucide-animated.com), by pqoqubbw, read on 21 October 2026.

Source files:

- https://github.com/pqoqubbw/icons/blob/main/icons/refresh-cw.tsx
- https://github.com/pqoqubbw/icons/blob/main/icons/copy.tsx
- https://github.com/pqoqubbw/icons/blob/main/LICENSE
- https://github.com/lucide-icons/lucide/blob/main/LICENSE

Local adaptations: use the existing `framer-motion` dependency; render direct SVG
roots for DS icon slots; expose a controlled `animate` boolean instead of a div
wrapper and imperative handle; support `disableMotion` and OS reduced motion;
inherit size and color; mark SVGs decorative; skip mount animation. The upstream
paths, 50° refresh rotation, and ±3 copy translations are retained. Copy spring
damping is 18 instead of upstream's 17 to meet the DS minimum damping ratio of
0.7 (stiffness 160, mass 1). Refresh retains upstream's spring 250/25.

## Lucide Animated — MIT License

Copyright (c) 2024-2026 pqoqubbw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Lucide — ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
