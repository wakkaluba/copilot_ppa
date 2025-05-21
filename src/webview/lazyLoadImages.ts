/**
 * Utility to enable lazy loading for images.
 * Finds all <img> tags with data-src and loads them when in viewport.
 * Falls back to eager loading if IntersectionObserver is not available.
 */
export function enableLazyLoadingForImages(): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately for older browsers
    document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(img => {
      img.src = img.dataset.src || '';
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '100px',
    threshold: 0.01
  });

  document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(img => {
    observer.observe(img);
  });
}
