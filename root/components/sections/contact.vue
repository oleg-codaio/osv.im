<template>
  <footer :class="$style.footer">
    <div :class="[$style.terminalCard, isTarget && $style.isTarget]">
      <div :class="$style.terminalHeader">
        <span :class="$style.prompt">~/$</span> <span :class="$style.command">ping oleg</span>
      </div>
      <div :class="$style.items">
        <a
          v-for="item in items"
          :class="$style.item"
          :key="item.name"
          :href="item.link"
          :target="item.target || '_blank'"
          @click="handleClick(item, $event)"
          rel="noopener"
          :aria-label="item.name"
        >
          <div
            :class="$style.icon"
            :style="{
              backgroundImage: `url('${item.icon}')`,
            }"
          />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import emailIcon from '~/assets/contact/email.png';
import linkedinIcon from '~/assets/contact/linkedin.png';
import twitterIcon from '~/assets/contact/twitter.png';
import githubIcon from '~/assets/contact/github.png';

const email = 'mi.vso@gelo';
const isTarget = ref(false);

const handleTargetEvent = (delay = 0) => {
  setTimeout(() => {
    isTarget.value = true;
    setTimeout(() => {
      isTarget.value = false;
    }, 2000);
  }, delay);
};

let targetListener: any = null;

onMounted(() => {
  targetListener = (e: any) => {
    const delay = e.detail?.delay || 0;
    handleTargetEvent(delay);
  };
  window.addEventListener('contact-targeted', targetListener);
  
  if (window.location.hash === '#contact') {
    handleTargetEvent(150);
  }
});

onBeforeUnmount(() => {
  if (targetListener) {
    window.removeEventListener('contact-targeted', targetListener);
  }
});

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
    value: 'oleg-codaio',
    icon: githubIcon,
    link: 'https://github.com/oleg-codaio',
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

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px 60px 20px;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
}

.terminalCard {
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px 48px;
  max-width: max-content;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}

.isTarget {
  animation: targetPulse 2s ease-out;
}

.terminalHeader {
  margin-bottom: 20px;
  font-size: 0.95rem;
  user-select: none;
}

.prompt {
  font-family: monospace;
  color: #38bdf8;
  font-weight: bold;
}

.command {
  font-family: monospace;
  color: #A1A1AA;

  &::after {
    content: ' _';
    animation: blink 1s step-end infinite;
  }
}

.items {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.icon {
  height: 28px;
  width: 28px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: brightness(0) invert(0.55); // slate grey similar to #8B949E
  transition: all 0.3s ease;

  .item:hover & {
    filter: brightness(0) invert(1); // turns to white/off-white (#FAFAFA)
    transform: translateY(-2px);
  }
}

:global(#contact):target {
  .terminalCard {
    animation: targetPulse 2s ease-out;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes targetPulse {
  0% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(56, 189, 248, 0);
  }
  20% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2), 0 0 20px 2px rgba(56, 189, 248, 0.4);
  }
  100% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(56, 189, 248, 0);
  }
}
</style>