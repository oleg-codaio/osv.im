<template>
  <div :class="$style.root">
    <navmenu/>

    <main :class="$style.body">
      <about id="about" :class="$style.section"/>
      <experience id="experience" :class="$style.section"/>
      <blog id="blog" :class="$style.section"/>
      <contact id="contact" :class="$style.section"/>
    </main>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'nuxt-property-decorator';
import NavMenu from '~/components/nav_menu.vue';
import About from '~/components/sections/about.vue';
import Experience from '~/components/sections/experience.vue';
import Blog from '~/components/sections/blog.vue';
import Contact from '~/components/sections/contact.vue';

@Component({
  components: {
    navmenu: NavMenu,
    about: About,
    blog: Blog,
    experience: Experience,
    contact: Contact,
  },
})
export default class extends Vue {}
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

  article {
    padding: 10px 20px;
    flex: auto;
  }

  @media only screen and (max-width: 768px) and (orientation: portrait) {
    // Mobile-only workaround for iOS Chrome/Instagram/Firefox/others.
    min-height: calc(100 * var(--vh, 1vh));
  }
}

.section p {
  max-width: 600px;
}
</style>