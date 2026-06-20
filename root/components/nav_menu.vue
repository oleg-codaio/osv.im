<template>
  <div>
    <div :class="[$style.hamburger, shown && $style.shown]" @click="shown = !shown">
      <div :class="$style.hamburgerTop" />
      <div :class="$style.hamburgerMiddle" />
      <div :class="$style.hamburgerBottom" />
    </div>

    <div :class="[$style.root, shown && $style.shown]">
      <a href="#about" :class="[$style.item, activeSection === 'about' && $style.isActive]" @click="scrollToSection('about', $event)">About</a>
      <a href="#experience" :class="[$style.item, activeSection === 'experience' && $style.isActive]" @click="scrollToSection('experience', $event)">Experience</a>
      <a href="#blog" :class="[$style.item, activeSection === 'blog' && $style.isActive]" @click="scrollToSection('blog', $event)">Blog</a>
      <a href="#contact" :class="[$style.item, activeSection === 'contact' && $style.isActive]" @click="scrollToSection('contact', $event)">Contact</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const shown = ref(false);
const isMobile = ref(false);
const activeSection = ref('about');

const scrollToSection = (id: string, event: Event) => {
  event.preventDefault();
  shown.value = false;
  const el = document.getElementById(id);
  if (el) {
    const offset = isMobile.value ? 0 : 75;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    activeSection.value = id;
    history.pushState(null, '', `#${id}`);
  }
};

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };
  window.addEventListener('resize', handleResize);

  // Setup intersection observer for scrollspy
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -40% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bottomPosition = document.documentElement.scrollHeight;
      const isAtBottom = scrollPosition >= bottomPosition - 50;

      if (entry.isIntersecting && !isAtBottom) {
        activeSection.value = entry.target.id;
      }
    });
  }, observerOptions);

  const sections = ['about', 'experience', 'blog', 'contact'];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  const handleScroll = () => {
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
    observer.disconnect();
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
  margin-top: -$header-size;
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