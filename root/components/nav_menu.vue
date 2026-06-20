<template>
  <div>
    <div :class="[$style.hamburger, shown && $style.shown]" @click="shown = !shown">
      <div :class="$style.hamburgerTop" />
      <div :class="$style.hamburgerMiddle" />
      <div :class="$style.hamburgerBottom" />
    </div>

    <div :class="[$style.root, shown && $style.shown]">
      <NuxtLink :to="{ path: '/', hash: '#about' }" :class="[$style.item, isAboutActive && $style.isActive]" @click="scrollToSection('about', $event)">About</NuxtLink>
      <NuxtLink :to="{ path: '/', hash: '#experience' }" :class="[$style.item, isExperienceActive && $style.isActive]" @click="scrollToSection('experience', $event)">Experience</NuxtLink>
      <NuxtLink :to="writingLinkTarget" :class="[$style.item, isWritingActive && $style.isActive]" @click="scrollToSection('writing', $event)">Writing</NuxtLink>
      <NuxtLink :to="{ path: '/', hash: '#contact' }" :class="[$style.item, isContactActive && $style.isActive]" @click="scrollToSection('contact', $event)">Contact</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const shown = ref(false);
const isMobile = ref(false);
const route = useRoute();
const activeSection = ref(route.hash ? route.hash.slice(1) : 'about');

const isProgrammaticScrolling = ref(false);
let scrollTimeout: any = null;

let observer: IntersectionObserver | null = null;
let setupRetryTimeout: any = null;

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
    if (route.path === '/' && route.hash) {
      isProgrammaticScrolling.value = true;
      activeSection.value = route.hash.slice(1);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isProgrammaticScrolling.value = false;
      }, 1000);
    } else if (route.path === '/' && !route.hash) {
      isProgrammaticScrolling.value = true;
      activeSection.value = 'about';
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isProgrammaticScrolling.value = false;
      }, 1000);
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

const scrollToSection = (id: string, event: Event) => {
  if (route.path === '/') {
    event.preventDefault();
    shown.value = false;
    const el = document.getElementById(id);
    if (el) {
      isProgrammaticScrolling.value = true;
      activeSection.value = id;
      
      const offset = isMobile.value ? 0 : 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      history.pushState(null, '', `#${id}`);

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isProgrammaticScrolling.value = false;
      }, 800);
    }
  } else {
    shown.value = false;
  }
};

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };
  window.addEventListener('resize', handleResize);

  // Block scroll updates on mount if arriving with a hash or at top
  if (route.path === '/') {
    isProgrammaticScrolling.value = true;
    if (route.hash) {
      activeSection.value = route.hash.slice(1);
    } else {
      activeSection.value = 'about';
    }
    scrollTimeout = setTimeout(() => {
      isProgrammaticScrolling.value = false;
    }, 1000);
  }

  // Setup intersection observer for scrollspy
  setupObserver();

  const handleScroll = () => {
    if (route.path !== '/') return;
    if (isProgrammaticScrolling.value) return;
    
    if (window.scrollY <= 0) {
      activeSection.value = 'about';
      return;
    }
    
    const scrollPosition = window.scrollY + window.innerHeight;
    const bottomPosition = document.documentElement.scrollHeight;
    if (scrollPosition >= bottomPosition - 50) {
      activeSection.value = 'contact';
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
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

.item {
  color: #A1A1AA;
  transition: all 0.25s ease-in-out;
  padding: 6px 0;
  margin: 0 15px;
  text-decoration: none;
  z-index: 11;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  opacity: 0.8;

  @media only screen and (max-width: 768px) {
    margin: 20px 0px;
    border-bottom: none;
    font-size: 24px;
  }

  &.isActive {
    color: #FAFAFA;
    border-bottom-color: #3b82f6;
    opacity: 1;
    text-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  }

  &:hover {
    color: #FAFAFA;
    opacity: 1;
  }
}
</style>