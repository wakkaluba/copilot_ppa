/**
 * Utilities to optimize the critical rendering path for webviews.
 * - Inlines critical CSS
 * - Defers non-essential scripts
 * - Provides helper for lazy loading images
 */

export function inlineCriticalCss(css: string): string {
  return `<style>${css}</style>`;
}

export function deferScript(src: string): string {
  return `<script src="${src}" defer></script>`;
}

export function lazyLoadImage(imgSrc: string, alt: string): string {
  return `<img src="${imgSrc}" alt="${alt}" loading="lazy" />`;
}
