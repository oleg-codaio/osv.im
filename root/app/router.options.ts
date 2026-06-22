import type {RouterConfig} from '@nuxt/schema';
import {useNuxtApp} from '#app';

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        const checkEl = (repeats = 0) => {
          const el = document.querySelector(to.hash);
          if (el) {
            resolve({
              el: to.hash,
              top: 99, // header (75px) + breathing room (24px) — matches scroll-padding-top
              behavior: 'smooth',
            });
          } else if (repeats < 20) {
            setTimeout(() => checkEl(repeats + 1), 100);
          } else {
            resolve({top: 0});
          }
        };
        // Give Nuxt/Vue page transition a small initial delay to render
        setTimeout(() => checkEl(), 100);
      });
    }

    // Delay the scroll to top/saved position until the new page has finished rendering/mounting.
    // This prevents the current page from jumping to top before the route swap takes place.
    return new Promise((resolve) => {
      if (import.meta.client) {
        const nuxtApp = useNuxtApp();
        nuxtApp.hooks.hookOnce('page:finish', () => {
          resolve(savedPosition || {top: 0});
        });
      } else {
        resolve(savedPosition || {top: 0});
      }
    });
  },
};
