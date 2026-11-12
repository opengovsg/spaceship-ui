let _theme = "";
const _cache = new Map<string, string>();

/** Resolves a CSS custom property to an actual computed rgb() value via a temp element.
 *  getComputedStyle on :root returns raw var() references, not resolved colors.
 *  Using el.style.color forces the browser to walk the full chain. */
export function resolveColor(token: string): string {
  if (token === "transparent") return "rgba(0,0,0,0)";

  const theme = document.documentElement.getAttribute("data-theme") ?? "light";
  if (theme !== _theme) {
    _theme = theme;
    _cache.clear();
  }

  const cached = _cache.get(token);
  if (cached) return cached;

  const el = document.createElement("span");
  el.style.color = `var(${token}, transparent)`;
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  el.remove();

  _cache.set(token, resolved);
  return resolved;
}

/** Converts 'rgb(R, G, B)' → 'rgba(R, G, B, 0)'. Preserves RGB channels for transparent start,
 *  so Motion only interpolates alpha — no dark intermediate states. */
export function toAlphaZero(rgb: string): string {
  if (rgb.startsWith("rgba(")) return rgb.replace(/,\s*[\d.]+\)$/, ", 0)");
  return rgb.replace("rgb(", "rgba(").replace(")", ", 0)");
}
