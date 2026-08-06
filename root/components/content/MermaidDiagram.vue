<template>
  <div :class="[$style.wrapper, 'breakout']">
    <div v-if="error" :class="$style.error">Failed to render diagram: {{ error }}</div>
    <div
      v-else
      :class="[$style.diagramContainer, {[$style.isZoomed]: isZoomed, [$style.isDragging]: isDragging}]"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
    >
      <button
        v-if="zoomable"
        type="button"
        :class="$style.zoomButton"
        :aria-label="isZoomed ? 'Reset Zoom' : 'Zoom In'"
        @click.stop="toggleZoom"
      >
        <svg
          v-if="!isZoomed"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <span>{{ isZoomed ? 'Reset Zoom' : 'Zoom In' }}</span>
      </button>

      <!-- eslint-disable-next-line vue/no-v-html -- Mermaid renders safe client-generated SVG markup -->
      <div ref="containerRef" :class="$style.diagram" :style="diagramStyle" v-html="svgHtml" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch, useSlots} from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    zoomFactor?: number;
    zoomable?: boolean;
  }>(),
  {
    code: '',
    zoomFactor: 2,
    zoomable: false,
  },
);

const slots = useSlots();
const containerRef = ref<HTMLElement | null>(null);
const svgHtml = ref<string>('');
const error = ref<string | null>(null);

const isZoomed = ref(false);
const isDragging = ref(false);
const panOffset = ref({x: 0, y: 0});

let idCounter = 0;
let dragStart = {x: 0, y: 0};
let initialPan = {x: 0, y: 0};

const diagramStyle = computed(() => {
  if (!isZoomed.value) {
    return {
      transform: 'none',
    };
  }
  const scale = props.zoomFactor || 2;
  return {
    transform: `translate3d(${panOffset.value.x}px, ${panOffset.value.y}px, 0) scale(${scale})`,
    transformOrigin: 'center center',
  };
});

function toggleZoom() {
  isZoomed.value = !isZoomed.value;
  panOffset.value = {x: 0, y: 0};
}

function clampPan(x: number, y: number): {x: number; y: number} {
  if (!containerRef.value) return {x, y};

  const container = containerRef.value.parentElement;
  if (!container) return {x, y};

  const scale = props.zoomFactor || 2;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const unscaledWidth = containerRef.value.offsetWidth;
  const unscaledHeight = containerRef.value.offsetHeight;

  const scaledWidth = unscaledWidth * scale;
  const scaledHeight = unscaledHeight * scale;

  const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

function onMouseDown(e: MouseEvent) {
  if (!isZoomed.value) return;

  isDragging.value = true;
  dragStart = {x: e.clientX, y: e.clientY};
  initialPan = {...panOffset.value};

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  e.preventDefault();
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  panOffset.value = clampPan(initialPan.x + dx, initialPan.y + dy);
}

function onMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }
}

function onTouchStart(e: TouchEvent) {
  if (!isZoomed.value || e.touches.length !== 1) return;

  const touch = e.touches[0];
  isDragging.value = true;
  dragStart = {x: touch.clientX, y: touch.clientY};
  initialPan = {...panOffset.value};

  window.addEventListener('touchmove', onTouchMove, {passive: false});
  window.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;
  const touch = e.touches[0];
  const dx = touch.clientX - dragStart.x;
  const dy = touch.clientY - dragStart.y;
  panOffset.value = clampPan(initialPan.x + dx, initialPan.y + dy);
  e.preventDefault();
}

function onTouchEnd() {
  if (isDragging.value) {
    isDragging.value = false;
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }
}

function extractTextFromVNodes(vnodes: any[]): string {
  let text = '';
  for (const node of vnodes) {
    if (typeof node === 'string') {
      text += node;
    } else if (typeof node?.children === 'string') {
      text += node.children;
    } else if (Array.isArray(node?.children)) {
      text += extractTextFromVNodes(node.children);
    }
  }
  return text;
}

async function renderDiagram() {
  if (!import.meta.client) return;

  try {
    let rawCode = props.code || '';
    if (!rawCode && slots.default) {
      rawCode = extractTextFromVNodes(slots.default());
    }

    rawCode = rawCode.trim();
    if (!rawCode) return;

    const mermaidModule = await import('mermaid');
    const mermaid = mermaidModule.default;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#161b22',
        primaryTextColor: '#f0f6fc',
        primaryBorderColor: 'rgba(56, 189, 248, 0.4)',
        lineColor: '#58a6ff',
        secondaryColor: '#161b22',
        tertiaryColor: '#0d1117',
        clusterBkg: 'rgba(255, 255, 255, 0.02)',
        clusterBorder: 'rgba(255, 255, 255, 0.15)',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        subGraphTitleMargin: {
          top: 15,
          bottom: 15,
        },
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'linear',
        nodeSpacing: 50,
        rankSpacing: 65,
        padding: 24,
        subGraphTitleMargin: {
          top: 15,
          bottom: 15,
        },
      },
    });

    const uniqueId = `mermaid-${Date.now()}-${idCounter++}`;
    const {svg} = await mermaid.render(uniqueId, rawCode);
    svgHtml.value = svg;
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

onMounted(() => {
  renderDiagram();
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }
});

watch(
  () => props.code,
  () => {
    renderDiagram();
  },
);
</script>

<style lang="scss" module>
.wrapper {
  position: relative;
  margin: 32px 0;
  width: 100%;
  transition:
    width 0.2s ease,
    margin 0.2s ease;

  @media (width >= 1250px) {
    width: calc(100% + 180px);
    margin-left: -180px;
    max-width: 900px;
  }
}

.diagramContainer {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-card, #0d1117);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 12px;
  box-shadow: 0 6px 24px rgb(0 0 0 / 30%);
  overflow: hidden;
  user-select: none;

  &.isZoomed {
    cursor: grab;

    &.isDragging {
      cursor: grabbing;
    }
  }
}

.zoomButton {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #e2e8f0;
  background: rgb(15 23 42 / 75%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 6px;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgb(30 41 59 / 90%);
    border-color: rgb(255 255 255 / 30%);
  }
}

.diagram {
  width: 100%;
  box-sizing: border-box;
  padding: 28px 32px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .isDragging & {
    transition: none;
  }

  svg {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 0 auto;
    overflow: visible !important;

    :global(g.node foreignObject) {
      overflow: visible !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }

    :global(g.node foreignObject > div) {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      height: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    :global(span.nodeLabel) {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.2 !important;
      text-align: center !important;
      display: inline-block !important;
      white-space: nowrap !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    :global(.cluster-label),
    :global(.cluster-label foreignObject),
    :global(.cluster-label div) {
      overflow: visible !important;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
    }

    :global(.cluster-label span) {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: normal !important;
      color: var(--text-muted, #8b949e) !important;
      white-space: nowrap !important;
      overflow: visible !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    :global(.edgeLabel) {
      background: transparent !important;

      :global(rect) {
        display: none !important;
        opacity: 0 !important;
      }

      :global(foreignObject) {
        overflow: visible !important;
      }

      :global(foreignObject > div),
      :global(div.label),
      :global(p) {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
        height: 100% !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      :global(span) {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        letter-spacing: 0.02em !important;
        color: #8b949e !important;
        background: #0d1117 !important;
        padding: 2px 8px !important;
        border: 1px solid rgb(255 255 255 / 10%) !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 6px rgb(0 0 0 / 20%) !important;
        display: inline-block !important;
        white-space: nowrap !important;
        margin: 0 !important;
        line-height: 1.2 !important;
      }
    }

    :global(g.cluster > rect) {
      rx: 10px !important;
      ry: 10px !important;
      stroke: rgb(255 255 255 / 15%) !important;
      stroke-width: 1.5px !important;
      fill: rgb(255 255 255 / 2%) !important;
    }

    :global(g.node > rect),
    :global(g.node > polygon) {
      rx: 8px !important;
      ry: 8px !important;
    }
  }
}

.error {
  padding: 12px 16px;
  font-size: 0.85rem;
  color: #f85149;
  background: rgb(248 81 73 / 10%);
  border: 1px solid rgb(248 81 73 / 40%);
  border-radius: 6px;
  font-family: monospace;
}
</style>
