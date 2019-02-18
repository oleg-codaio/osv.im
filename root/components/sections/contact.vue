<template>
  <section>
    <article :class="$style.root">
      <div :class="$style.items">
        <a
          v-for="item in items"
          :class="$style.item"
          :key="item.name"
          :href="item.link"
          :target="item.target || '_blank'"
          :onclick="item.onclick"
          rel="noopener"
        >
          <div
            :class="$style.icon"
            :style="{
              backgroundImage: `url('${require(`~/assets/contact/${item.icon}`)}')`,
            }"
          />
          <div :class="$style.label" :style="item.labelStyle">{{item.value}}</div>
        </a>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import {Component, Vue} from 'nuxt-property-decorator';

@Component
export default class extends Vue {
  items = Items;
}

const email = 'mi.vso@gelo';
const Items = [
  {
    name: 'Email',
    value: email,
    icon: 'email.png',
    target: '_self',
    labelStyle: 'direction: rtl; unicode-bidi: bidi-override;',
    onclick: `window.location.href = 'mailto:' + [...'${email}'].reverse().join('')`,
  },
  {name: 'LinkedIn', value: 'olegsv', icon: 'linkedin.png', link: 'https://www.linkedin.com/in/olegsv'},
  {name: 'Twitter', value: 'ohleg', icon: 'twitter.png', link: 'https://twitter.com/ohleg'},
  {name: 'GitHub', value: 'vaskevich', icon: 'github.png', link: 'https://github.com/vaskevich'},
];
</script>

<style lang="scss" module>
@import '~/assets/css/main.scss';

.root {
  background: $contact-background-color;
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  justify-content: center;
}

.items {
  display: flex;
  justify-content: center;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.item {
  display: flex;
  flex-direction: column;
  cursor: pointer;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.icon {
  height: 72px;
  width: 72px;
  background-size: contain;
  background-repeat: no-repeat;
  filter: brightness(0) invert(0.3);
  transition: filter 0.3s ease;
  margin: 0 50px;
  align-self: center;

  @media only screen and (max-width: 768px) {
    margin: 20px 0;
    align-content: center;
  }

  .item:hover & {
    filter: brightness(1) invert(0);
  }
}

.label {
  padding-top: 10px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  .item:hover & {
    opacity: 1;
  }

  @media only screen and (max-width: 768px) {
    padding-top: 0;
  }
}
</style>