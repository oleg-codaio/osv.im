import type { RouterConfig } from '@nuxt/schema';
import { useNuxtApp } from '#app';

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        const checkEl = (repeats = 0) => {
          const el = document.querySelector(to.hash);
          if (el) {
            // Cancel the browser's native instant anchor jump by immediately
            // scrolling back to where we already are, then let the smooth
            // scroll below take over as the single source of truth.
            el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            resolve({
              el: to.hash,
              top: 99, // header (75px) + breathing room (24px) — matches scroll-padding-top
              behavior: 'smooth',
            });
          } else if (repeats < 20) {
            setTimeout(() => checkEl(repeats + 1), 100);
          } else {
            resolve({ top: 0 });
          }
        };
        checkEl();
      });
    }

    // Delay the scroll to top/saved position until the new page has finished rendering/mounting.
    // This prevents the current page from jumping to top before the route swap takes place.
    return new Promise((resolve) => {
      if (import.meta.client) {
        const nuxtApp = useNuxtApp();
        nuxtApp.hooks.hookOnce('page:finish', () => {
          resolve(savedPosition || { top: 0 });
        });
      } else {
        resolve(savedPosition || { top: 0 });
      }
    });
  },
};
