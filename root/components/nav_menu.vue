<template>
  <div>
    <div :class="[$style.hamburger, shown && $style.shown]" @click="shown = !shown">
      <div :class="$style.hamburgerTop" />
      <div :class="$style.hamburgerMiddle" />
      <div :class="$style.hamburgerBottom" />
    </div>

    <div :class="[$style.root, shown && $style.shown]">
      <NavLink
        v-for="link in navLinks"
        :key="link.id"
        :to="link.to"
        :is-active="link.isActive"
        @click="scrollToSection(link.id, $event)"
      >
        {{ link.label }}
      </NavLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const shown = ref(false);
const route = useRoute();
const activeSection = ref('about');

const isProgrammaticScrolling = ref(false);
let scrollTimeout: any = null;

let observer: IntersectionObserver | null = null;
let setupRetryTimeout: any = null;

const updateActiveSectionFromScroll = () => {
  if (!process.client) return;
  if (route.path !== '/') return;

  if (window.scrollY <= 0) {
    activeSection.value = 'about';
    return;
  }

  const scrollPosition = window.scrollY + window.innerHeight;
  const bottomPosition = document.documentElement.scrollHeight;
  if (scrollPosition >= bottomPosition - 150) {
    activeSection.value = 'contact';
    return;
  }

  const sections = ['about', 'experience', 'writing', 'contact'];
  const viewportCenter = window.innerHeight / 2;
  let closestSection = activeSection.value;
  let minDistance = Infinity;

  for (const id of sections) {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        activeSection.value = id;
        return;
      }
      const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = id;
      }
    }
  }
  activeSection.value = closestSection;
};

const clearProgrammaticScroll = () => {
  isProgrammaticScrolling.value = false;
};

const setupObserver = () => {
  if (!process.client) return;
  
  if (setupRetryTimeout) clearTimeout(setupRetryTimeout);
  
  if (observer) {
    observer.disconnect();
  }

  const sections = ['about', 'experience', 'writing', 'contact'];
  const elements = sections.map(id => document.getElementById(id)).filter(Boolean);
  
  if (route.path === '/' && elements.length < sections.length) {
    setupRetryTimeout = setTimeout(setupObserver, 100);
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '-45% 0px -45% 0px',
    threshold: 0,
  };

  observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScrolling.value) return;
    
    entries.forEach((entry) => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bottomPosition = document.documentElement.scrollHeight;
      const isAtBottom = (window.scrollY > 100) && (scrollPosition >= bottomPosition - 50);

      if (entry.isIntersecting && !isAtBottom) {
        activeSection.value = entry.target.id;
      }
    });
  }, observerOptions);

  elements.forEach((el) => {
    if (el) observer.observe(el);
  });
};

// Watch route changes to block scroll spy updates during router smooth scrolls
watch(
  () => route.fullPath,
  () => {
    const currentHash = route.hash || (process.client ? window.location.hash : '');
    if (route.path === '/' && currentHash) {
      isProgrammaticScrolling.value = true;
      activeSection.value = currentHash.replace('#', '');
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(clearProgrammaticScroll, 1000);
    } else if (route.path === '/' && !currentHash) {
      isProgrammaticScrolling.value = false;
      activeSection.value = 'about';
      if (scrollTimeout) clearTimeout(scrollTimeout);
    }

    if (route.path === '/') {
      nextTick(() => {
        setupObserver();
      });
    } else {
      if (observer) {
        observer.disconnect();
      }
      if (setupRetryTimeout) clearTimeout(setupRetryTimeout);
    }
  }
);

watch(activeSection, (newSection, oldSection) => {
  if (newSection === 'contact' && oldSection !== 'contact') {
    if (!isProgrammaticScrolling.value) {
      window.dispatchEvent(new CustomEvent('contact-targeted', { detail: { delay: 0 } }));
    }
  }
});

// Dynamic Active States
const isAboutActive = computed(() => {
  return route.path === '/' && activeSection.value === 'about';
});

const isExperienceActive = computed(() => {
  return route.path === '/' && activeSection.value === 'experience';
});

const isWritingActive = computed(() => {
  return route.path.startsWith('/writing') || (route.path === '/' && activeSection.value === 'writing');
});

const isContactActive = computed(() => {
  return route.path === '/' && activeSection.value === 'contact';
});

// Dynamic Link Targets
const writingLinkTarget = computed(() => {
  return route.path === '/' ? { path: '/', hash: '#writing' } : '/writing';
});

const navLinks = computed(() => [
  { id: 'about', label: 'About', to: { path: '/' }, isActive: isAboutActive.value },
  { id: 'experience', label: 'Experience', to: { path: '/', hash: '#experience' }, isActive: isExperienceActive.value },
  { id: 'writing', label: 'Writing', to: writingLinkTarget.value, isActive: isWritingActive.value },
  { id: 'contact', label: 'Contact', to: { path: '/', hash: '#contact' }, isActive: isContactActive.value },
]);

const scrollToSection = (id: string, event: Event) => {
  if (route.path === '/') {
    event.preventDefault();
    shown.value = false;

    if (id === 'about') {
      isProgrammaticScrolling.value = true;
      activeSection.value = 'about';
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      history.pushState(null, '', '/');
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(clearProgrammaticScroll, 800);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      isProgrammaticScrolling.value = true;
      activeSection.value = id;
      
      const targetTop = el.getBoundingClientRect().top + window.scrollY - 99;
      const distance = Math.abs(window.scrollY - targetTop);
      const delay = distance < 50 ? 100 : 800;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      history.pushState(null, '', `#${id}`);

      if (id === 'contact') {
        window.dispatchEvent(new CustomEvent('contact-targeted', { detail: { delay } }));
      }

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(clearProgrammaticScroll, 800);
    }
  } else {
    shown.value = false;
  }
};

onMounted(() => {
  // Block scroll updates on mount if arriving with a hash or at top
  if (route.path === '/') {
    const currentHash = route.hash || (window.location.hash || '');
    if (currentHash) {
      isProgrammaticScrolling.value = true;
      activeSection.value = currentHash.replace('#', '');
      scrollTimeout = setTimeout(clearProgrammaticScroll, 1000);
    } else {
      isProgrammaticScrolling.value = false;
      activeSection.value = 'about';
    }
  }

  // Setup intersection observer for scrollspy
  setupObserver();

  const handleScroll = () => {
    if (route.path !== '/') return;
    if (isProgrammaticScrolling.value) return;
    updateActiveSectionFromScroll();
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    if (observer) observer.disconnect();
    if (scrollTimeout) clearTimeout(scrollTimeout);
    if (setupRetryTimeout) clearTimeout(setupRetryTimeout);
  });
});
</script>

<style lang="scss" module>
@import 'sass-svg-uri';
@import '~/assets/css/main.scss';

.root {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  font-size: 14pt;
  height: $header-size;
  justify-content: flex-end;
  top: 0;
  left: 0;
  padding-right: 40px;
  position: fixed;
  transition: all 0.3s ease;
  width: 100%;
  z-index: 10;
  background: rgba(9, 9, 11, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media only screen and (max-width: 768px) {
    pointer-events: none;
    opacity: 0;
    flex-direction: column;
    padding-top: $header-size;
    padding-bottom: 150px;
    padding-right: 0;
    position: fixed;
    width: 100vw;
    margin-top: 0;
    height: 100vh;
    background: rgba(9, 9, 11, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: none;

    &.shown {
      opacity: 1;
      pointer-events: all;
      display: flex;
    }
  }
}

.hamburger {
  align-content: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 12px;
  display: none;
  height: 50px;
  overflow: hidden;
  padding-left: 15px;
  padding-right: 15px;
  position: fixed;
  right: 0;
  text-align: right;
  top: 0;
  z-index: 15;

  @media only screen and (max-width: 768px) {
    display: block;
    margin-top: 0;
  }
}

.hamburgerTop::before,
.hamburgerMiddle::before,
.hamburgerBottom::before {
  background: #FAFAFA;
  content: ' ';
  display: block;
  height: 3px;
  margin-top: 6px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  width: 24px;
}

.hamburgerTop::before {
  .shown & {
    transform: rotateZ(-45deg) translate(-7px, 7px);
  }
}

.hamburgerMiddle::before {
  .shown & {
    transform: translateX(75px);
    opacity: 0;
  }
}

.hamburgerBottom::before {
  .shown & {
    transform: rotateZ(45deg) translate(-5px, -6px);
  }
}



@media print {
  .hamburger,
  .root {
    display: none !important;
  }
}
</style>