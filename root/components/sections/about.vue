<template>
  <section :class="$style.root">
    <article>
      <h1 :class="$style.name">Oleg Vaskevich</h1>

      <p>
        I'm an experienced full-stack software engineer, currently working at
        <a
          href="https://coda.io/?utm_campaign=osv&utm_medium=email&utm_source=coda"
          target="_blank"
          rel="noopener"
        >Coda</a>.
      </p>

      <p>My interests lie in scalable and distributed systems, mobile and IoT, security, and all things web.</p>
    </article>
  </section>
</template>

<script lang="ts">
import {Component, Vue} from 'nuxt-property-decorator';

@Component({})
export default class extends Vue {}
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.root {
  transition: background 1.5s linear;
  background: black url('../../static/bg.jpg') top right / cover no-repeat;
  color: white;
  cursor: default;

  &.root {
    min-height: calc(85vh);
  }

  article {
    background: linear-gradient(to right, black 0px, rgba(black, 0.8) 30%, transparent 60%, transparent 100%);

    p {
      max-width: calc(100vw - 400px);
    }

    @media only screen and (max-width: 768px) {
      margin-top: 200px;
      background: linear-gradient(to top, black 0px, rgba(black, 0.8) 30%, transparent 50%, transparent 100%);

      p {
        max-width: inherit;
      }
    }
  }
}

.name {
  font-size: 45pt;
}
</style>