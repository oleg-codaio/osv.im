<template>
  <div :class="$style.root">
    <NavMenu />

    <main :class="$style.body">
      <About id="about" :class="[$style.section, $style.aboutSection]" />
      <Experience id="experience" :class="$style.section" />
      <Blog id="blog" :class="$style.section" />
      <Contact id="contact" :class="[$style.section, $style.contactSection]" />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavMenu from '~/components/nav_menu.vue';
import About from '~/components/sections/about.vue';
import Experience from '~/components/sections/experience.vue';
import Blog from '~/components/sections/blog.vue';
import Contact from '~/components/sections/contact.vue';
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.root {
  display: inline-block;
  margin-top: $header-size;

  @media only screen and (max-width: 768px) {
    margin-top: 0px;
  }
}

.body {
  display: flex;
  flex-direction: column;
}

.section {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  scroll-margin-top: $header-size;

  @media only screen and (max-width: 768px) {
    scroll-margin-top: 0px;
  }

  article {
    padding: 10px 20px;
    flex: auto;
  }

  @media only screen and (max-width: 768px) and (orientation: portrait) {
    // Mobile-only workaround for iOS Chrome/Instagram/Firefox/others.
    min-height: calc(100 * var(--vh, 1vh));
  }
}

.aboutSection {
  min-height: 80vh;

  @media only screen and (max-width: 768px) and (orientation: portrait) {
    min-height: calc(80 * var(--vh, 1vh));
  }
}

.contactSection {
  min-height: auto;

  @media only screen and (max-width: 768px) and (orientation: portrait) {
    min-height: auto;
  }
}

.section p {
  max-width: 600px;
}
</style>