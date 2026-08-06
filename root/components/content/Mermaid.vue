<template>
  <MermaidDiagram :code="code" :zoomable="zoomable" :zoom-factor="zoomFactor">
    <slot />
  </MermaidDiagram>
</template>

<script setup lang="ts">
import MermaidDiagram from './MermaidDiagram.vue';

defineProps<{
  code?: string;
  zoomable?: boolean;
  zoomFactor?: number;
}>();
</script>
