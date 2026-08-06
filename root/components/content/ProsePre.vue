<template>
  <MermaidDiagram v-if="language === 'mermaid'" :code="code" :zoomable="isZoomable" :zoom-factor="zoomFactor" />
  <pre v-else :class="[style.pre, $props.class]"><slot /></pre>
</template>

<script setup lang="ts">
import {computed, useCssModule} from 'vue';
import MermaidDiagram from './MermaidDiagram.vue';

const props = defineProps<{
  code?: string;
  language?: string;
  filename?: string;
  highlights?: number[];
  meta?: string;
  class?: string;
}>();

const style = useCssModule();

const isZoomable = computed(() => {
  const metaStr = `${props.meta || ''} ${props.filename || ''}`;
  return /\bzoom(?:able)?\b/i.test(metaStr);
});

const zoomFactor = computed(() => {
  const metaStr = `${props.meta || ''} ${props.filename || ''}`;
  const match = metaStr.match(/zoom(?:-factor)?=["']?([\d.]+)["']?/i);
  return match ? parseFloat(match[1]) : 2;
});
</script>

<style lang="scss" module>
.pre {
  position: relative;
  margin: 24px 0;
  padding: 16px 20px;
  background: var(--bg-card, #0d1117);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-main, #e4e4e7);

  code {
    font-family: inherit;
    background: transparent;
    padding: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
