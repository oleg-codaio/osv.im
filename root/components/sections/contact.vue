<template>
  <footer :class="$style.footer">
    <div :class="[$style.terminalCard, isTarget && $style.isTarget, isTerminalActive && $style.isActive]">
      <div v-if="!isTerminalActive" :class="$style.terminalHeader" @click="activateTerminal">
        <span :class="$style.prompt">~/$</span>
        <span :class="$style.command">ping oleg</span>
      </div>
      <div v-else :class="$style.terminalHeaderActive">
        <span :class="$style.prompt">~/$</span>
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          :class="$style.terminalInput"
          @keydown.enter="handleCommand"
          @keydown.esc="resetTerminal"
          @blur="resetTerminal"
        />
      </div>
      <div v-if="commandOutput" :class="$style.terminalOutput">
        {{ commandOutput }}
      </div>
      <div :class="$style.items">
        <a
          v-for="item in items"
          :key="item.name"
          :class="$style.item"
          :href="item.link"
          :target="item.target || '_blank'"
          :rel="item.target === '_self' ? undefined : 'noopener noreferrer'"
          :aria-label="item.name"
          @click="handleClick(item, $event)"
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
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue';
import emailIcon from '~/assets/contact/email.png';
import linkedinIcon from '~/assets/contact/linkedin.png';
import twitterIcon from '~/assets/contact/twitter.png';
import githubIcon from '~/assets/contact/github.png';

const email = 'mi.vso@gelo';
const isTarget = ref(false);
let pulseTimeout: any = null;
let resetTimeout: any = null;

const isTerminalActive = ref(false);
const inputValue = ref('ping oleg');
const commandOutput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

function activateTerminal() {
  isTerminalActive.value = true;
  nextTick(() => {
    inputRef.value?.focus();
    if (inputRef.value) {
      const len = inputRef.value.value.length;
      inputRef.value.setSelectionRange(len, len);
    }
  });
}

function handleCommand() {
  const cmd = inputValue.value.trim().toLowerCase();

  if (cmd === 'clear') {
    commandOutput.value = '';
    inputValue.value = '';
    return;
  }

  switch (cmd) {
    case 'help':
      commandOutput.value = 'Available commands: whoami, sudo, clear';
      break;
    case 'whoami':
      commandOutput.value = 'guest_user';
      break;
    case 'sudo':
      commandOutput.value = 'nice try.';
      break;
    case 'ping oleg':
      commandOutput.value = 'pong. (Reach out on the links below!)';
      break;
    default:
      commandOutput.value = `Command not found: ${inputValue.value}. Type 'help' for available commands.`;
  }

  inputValue.value = '';
}

function resetTerminal() {
  isTerminalActive.value = false;
  inputValue.value = 'ping oleg';
  commandOutput.value = '';
}

const handleTargetEvent = (delay = 0) => {
  if (pulseTimeout) clearTimeout(pulseTimeout);

  pulseTimeout = setTimeout(() => {
    isTarget.value = false;
    nextTick(() => {
      isTarget.value = true;
      if (resetTimeout) clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        isTarget.value = false;
      }, 2000);
    });
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
  if (pulseTimeout) clearTimeout(pulseTimeout);
  if (resetTimeout) clearTimeout(resetTimeout);
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
@use '~/assets/css/main.scss' as *;

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px 60px;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
}

.terminalCard {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px 48px;
  width: 280px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 30px rgb(0 0 0 / 20%);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}

.isActive {
  padding: 24px 40px;
  width: 440px;
  max-width: 100%;
}

.isTarget {
  animation: targetPulse 2s ease-out;
}

.terminalHeader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 24px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  user-select: none;
  cursor: text;
}

.terminalHeaderActive {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 24px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.terminalInput {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-muted-light);
  font-family: monospace;
  font-size: inherit;
  caret-color: var(--primary-accent);
  width: 150px;
  cursor: text;
  padding: 0;
  margin: 0;
  line-height: inherit;
}

.terminalOutput {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 20px;
  text-align: center;
  overflow-wrap: break-word;
  max-width: 100%;
}

.prompt {
  font-family: monospace;
  color: var(--primary-accent);
  font-weight: bold;
}

.command {
  font-family: monospace;
  color: var(--text-muted-light);

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
    box-shadow:
      0 4px 30px rgb(0 0 0 / 20%),
      0 0 0 0 rgb(56 189 248 / 0%);
  }

  20% {
    box-shadow:
      0 4px 30px rgb(0 0 0 / 20%),
      0 0 20px 2px rgb(56 189 248 / 40%);
  }

  100% {
    box-shadow:
      0 4px 30px rgb(0 0 0 / 20%),
      0 0 0 0 rgb(56 189 248 / 0%);
  }
}
</style>
