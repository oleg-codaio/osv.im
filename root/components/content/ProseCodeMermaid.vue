<template>
  <MermaidDiagram :code="code" :zoomable="isZoomable" :zoom-factor="zoomFactor" />
</template>

<script setup lang="ts">
import {computed} from 'vue';
import MermaidDiagram from './MermaidDiagram.vue';

const props = defineProps<{
  code: string;
  language?: string;
  filename?: string;
  highlights?: number[];
  meta?: string;
}>();

const isZoomable = computed(() => {
  if (!props.meta) return false;
  return /\bzoom(?:able)?\b/i.test(props.meta);
});

const zoomFactor = computed(() => {
  if (!props.meta) return 2;
  const match = props.meta.match(/zoom(?:-factor)?=["']?([\d.]+)["']?/);
  return match ? parseFloat(match[1]) : 2;
});
</script>
