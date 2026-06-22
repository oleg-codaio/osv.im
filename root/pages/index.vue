<template>
  <div :class="$style.root">
    <main :class="$style.body">
      <About id="about" :class="[$style.section, $style.aboutSection]" />
      <Experience id="experience" :class="$style.section" />
      <Writing id="writing" :class="[$style.section, $style.writingSection]" />
      <Contact id="contact" :class="[$style.section, $style.contactSection]" />
    </main>
  </div>
</template>

<script setup lang="ts">
import About from '~/components/sections/about.vue';
import Experience from '~/components/sections/experience.vue';
import Writing from '~/components/sections/writing.vue';
import Contact from '~/components/sections/contact.vue';
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

.root {
  display: inline-block;
  margin-top: $header-size;

  @media only screen and (width <= 768px) {
    margin-top: 0;
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

  @media only screen and (width <= 768px) {
    scroll-margin-top: 0;
  }

  article {
    padding: 10px 20px;
    flex: auto;
  }

  @media only screen and (width <= 768px) and (orientation: portrait) {
    // Mobile-only workaround for iOS Chrome/Instagram/Firefox/others.
    min-height: calc(100 * var(--vh, 1vh));
  }
}

.aboutSection {
  min-height: 80vh;

  @media only screen and (width <= 768px) and (orientation: portrait) {
    min-height: calc(80 * var(--vh, 1vh));
  }
}

.writingSection {
  min-height: auto;
  padding: 120px 0 40px;

  @media only screen and (width <= 768px) and (orientation: portrait) {
    min-height: auto;
    padding: 80px 0 30px;
  }
}

.contactSection {
  min-height: auto;
  margin-top: 64px;

  @media only screen and (width <= 768px) and (orientation: portrait) {
    min-height: auto;
    margin-top: 32px;
  }
}

.section p {
  max-width: 600px;
}
</style>
