<template>
  <NuxtLink :to="resolvedHref" :target="computedTarget" :rel="computedRel">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  href?: string;
  to?: string;
  target?: string;
}>();

const resolvedHref = computed(() => props.href || props.to || '');

const isExternal = computed(() => {
  const url = resolvedHref.value;
  if (!url) return false;

  // Match http://, https://, or //
  const match = url.match(/^(?:https?:)?\/\/(?:www\.)?([^/]+)/i);
  if (!match) return false;

  const domain = match[1].toLowerCase();
  // Remove port if present (e.g., localhost:3000 -> localhost)
  const host = domain.split(':')[0];

  // Check if it's the current site's domain
  return host !== 'osv.im' && host !== 'localhost' && !host.endsWith('.osv.im');
});

const isImageOrAsset = computed(() => {
  const url = resolvedHref.value;
  if (!url) return false;

  return (
    url.startsWith('/images/') || url.includes('/images/') || /\.(pdf|png|jpe?g|gif|webp|svg|glb|gltf)$/i.test(url)
  );
});

const shouldOpenInNewTab = computed(() => {
  return isExternal.value || isImageOrAsset.value;
});

const computedTarget = computed(() => {
  if (props.target) return props.target;
  return shouldOpenInNewTab.value ? '_blank' : undefined;
});

const computedRel = computed(() => {
  return shouldOpenInNewTab.value ? 'noopener noreferrer' : undefined;
});
</script>
