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
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id;
      }
    });
  }, observerOptions);

  const sections = ['about', 'experience', 'blog', 'contact'];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
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
  font-size: 15pt;
  height: $header-size;
  justify-content: flex-end;
  margin-top: -$header-size;
  padding-right: 25px;
  position: fixed;
  transition: opacity 0.5s ease, mask-size 0.5s ease, mask-position 0.5s ease;
  width: 100%;
  z-index: 10;
  overflow: hidden;
  border-bottom: solid 1px gray;

  &:before {
    background-repeat: round;
    background-color: $nav-bg-color;
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: -100%;
  }

  @media only screen and (max-width: 768px) {
    pointer-events: none;
    opacity: 0;
    mask-position: 0 0;
    flex-direction: column;
    mask-image: radial-gradient(black, rgba(black, 0.7));
    mask-position: 100% 100%;
    mask-size: 800% 800%;
    padding-top: $header-size;
    padding-bottom: 150px;
    padding-right: 0;
    position: fixed;
    width: 100vw;
    margin-top: 0;
    height: 100vh;

    &.shown {
      opacity: 1;
      pointer-events: all;
      display: flex;
      animation: materialFadeIn 3s forwards;
      mask-position: 70% 50%;
    }

    .item {
      flex: auto;
      display: flex;
      font-size: 40px;
      align-items: center;
    }
  }
}

.hamburger {
  align-content: center;
  background: white;
  border-bottom-left-radius: 15px;
  display: none;
  height: 50px;
  overflow: hidden;
  padding-left: 15px;
  padding-right: 15px;
  position: fixed;
  right: 5px;
  text-align: right;
  top: 5px;
  z-index: 15;

  @media only screen and (max-width: 768px) {
    display: block;
    margin-top: 0;
  }
}

.hamburgerTop::before,
.hamburgerMiddle::before,
.hamburgerBottom::before {
  background: gray;
  content: ' ';
  display: block;
  height: 5px;
  margin-top: 8px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  width: 30px;
}

.hamburgerTop::before {
  .shown & {
    transform: rotateZ(-45deg) translate(-10px, 10px);
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
    transform: rotateZ(45deg) translate(-8px, -9px);
  }
}

.item {
  color: $nav-item-idle;
  transition: color 0.3s ease, border-color 0.3s ease;
  border: solid 1px transparent;
  border-radius: 20px;
  padding: 10px 20px;
  text-decoration: none;
  z-index: 11;

  &:not(:first-child) {
    margin-left: 10px;
  }

  @media only screen and (max-width: 768px) {
    margin: 25px 0px;
  }

  &.isActive {
    color: $nav-item-selected;
    border-color: $nav-item-selected;
  }

  &:hover {
    color: $nav-item-hover;
  }
}
</style>