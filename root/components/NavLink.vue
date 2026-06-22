<template>
  <NuxtLink :to="to" :class="[$style.item, isActive && $style.isActive]" @click="handleClick">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: any;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

function handleClick(event: MouseEvent) {
  emit('click', event);
}
</script>

<style lang="scss" module>
@use '~/assets/css/main.scss' as *;

.item {
  color: var(--text-muted-light, #a1a1aa);
  transition: color 0.3s ease;
  padding: 6px 0;
  margin: 0 15px;
  text-decoration: none;
  z-index: 11;
  font-weight: 500;
  opacity: 0.8;
  position: relative;

  @media only screen and (width <= 768px) {
    margin: 20px 0;
    font-size: 24px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-accent, #38bdf8);
    border-radius: 2px;
    box-shadow: 0 0 8px rgb(56 189 248 / 60%);
    opacity: 0;
    transform: scaleX(0.5);
    transform-origin: center;
    transition:
      opacity 0.3s ease,
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    @media only screen and (width <= 768px) {
      display: none;
    }
  }

  &.isActive {
    color: var(--text-main, #fafafa);
    opacity: 1;
    text-shadow: 0 0 12px rgb(56 189 248 / 40%);

    &::after {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  &:hover {
    color: var(--text-main, #fafafa);
    opacity: 1;
  }
}
</style>
