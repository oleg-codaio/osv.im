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
          @click="handleClick(item, $event)"
          rel="noopener"
        >
          <div
            :class="$style.icon"
            :style="{
              backgroundImage: `url('${item.icon}')`,
            }"
          />
          <div :class="$style.label" :style="item.labelStyle">{{ item.value }}</div>
        </a>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import emailIcon from '~/assets/contact/email.png';
import linkedinIcon from '~/assets/contact/linkedin.png';
import twitterIcon from '~/assets/contact/twitter.png';
import githubIcon from '~/assets/contact/github.png';

const email = 'mi.vso@gelo';

const items = [
  {
    name: 'Email',
    value: email,
    icon: emailIcon,
    target: '_self',
    labelStyle: 'direction: rtl; unicode-bidi: bidi-override;',
    isEmail: true,
    link: '#',
  },
  {
    name: 'LinkedIn',
    value: 'olegsv',
    icon: linkedinIcon,
    link: 'https://www.linkedin.com/in/olegsv',
  },
  {
    name: 'Twitter',
    value: 'ohleg',
    icon: twitterIcon,
    link: 'https://twitter.com/ohleg',
  },
  {
    name: 'GitHub',
    value: 'vaskevich',
    icon: githubIcon,
    link: 'https://github.com/vaskevich',
  },
];

const handleClick = (item: any, event: MouseEvent) => {
  if (item.isEmail) {
    event.preventDefault();
    window.location.href = 'mailto:' + [...item.value].reverse().join('');
  }
};
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